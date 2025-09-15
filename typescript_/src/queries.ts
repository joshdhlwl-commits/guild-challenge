import { Client } from 'pg';
import dotenv from 'dotenv';
import {
  Student,
  Enrollment,
  Major,
  Course,
  GradesPerCourse,
} from './types';


dotenv.config({ path: `${process.cwd()}/../.env` });
const connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

export async function student(args: { id: string }): Promise<Student | null> {
  const client = new Client(connectionString);
  await client.connect();
  const res = await client.query('select * from students where id = $1::uuid', [args.id]);
  await client.end();
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function students(): Promise<Student[]> {
  const client = new Client(connectionString);
  await client.connect();
  const res = await client.query('select * from students');
  await client.end();
  return res.rows as Student[];
}

export async function courseNames(): Promise<string[]> {
  const client = new Client(connectionString);
  await client.connect();
  const res = await client.query('select distinct course_name from enrollments');
  await client.end();
  return res.rows.map((row: { course_name: string }) => row.course_name);
}

export async function enrollments(): Promise<Enrollment[]> {
  const client = new Client(connectionString);
  await client.connect();
  const res = await client.query('select * from enrollments');
  await client.end();
  return res.rows as Enrollment[];
}


// Returns the most popular course   by enrollment count from startDate to endDate
export async function getMostPopularCourse(args: { input: { startDate: string, endDate: string } }): Promise<Course | null> {
  const client = new Client(connectionString);
  await client.connect();
  // Filter enrollments by startDate and endDates
  const res = await client.query(`
    select course_name, count(*) as count
    from enrollments
    where start_date >= $1 and end_date <= $2
    group by course_name
    order by count desc
    limit 1
  `, [args.input.startDate, args.input.endDate]);
  if (res.rows.length === 0) {
    await client.end();
    return null;
  }
  // Get course details from the most popular course
  const courseName = res.rows[0].course_name;
  const detailsRes = await client.query(
    'select * from enrollments where course_name = $1 and start_date >= $2 and end_date <= $3 limit 1',
    [courseName, args.input.startDate, args.input.endDate]
  );
  await client.end();
  if (!detailsRes.rows[0]) return null;
  return {
    id: detailsRes.rows[0].id,
    name: courseName,
    majorId: detailsRes.rows[0].major_id ?? '',
    creditHours: detailsRes.rows[0].credit_hours,
    tuitionCost: detailsRes.rows[0].cost,
    deviationFromMeanGPA: undefined,
    rawDifferenceFromMeanGPA: undefined,
  };
}

// Given a courseId, return all grades ever achieved in this  courses
export async function getGradesPerCourse(args: { input: { courseId: string } }): Promise<GradesPerCourse> {
  const client = new Client(connectionString);
  await client.connect();
  const courseId = args.input.courseId ?? '';

  const res = await client.query('select student_id, letter_grade from enrollments where course_name = $1 and letter_grade is not null', [courseId]);
  await client.end();
  return {
    courseId,
    grades: res.rows.map((row: { student_id: string, letter_grade: string }) => ({
      studentId: row.student_id,
      letterGrade: row.letter_grade,
    })),
  };
}

// Returns statistics
export async function getCourseStatistics(): Promise<{ meanGPA: number; courseStatistics: Course[] }> {
  const client = new Client(connectionString);
  await client.connect();

  const gradesRes = await client.query(`
    select e.*, m.id as major_id
    from enrollments e
    left join majors m on lower(e.course_name) like '%' || lower(m.name) || '%'
    where e.letter_grade is not null
  `);
  await client.end();
  const gradeMap: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0,
  };

  // Group grades by course_name
  const courseGrades: { [courseName: string]: number[] } = {};
  const courseInfo: { [courseName: string]: Course } = {};
  for (const row of gradesRes.rows) {
    if (!courseGrades[row.course_name]) courseGrades[row.course_name] = [];
    if (gradeMap[row.letter_grade]) courseGrades[row.course_name].push(gradeMap[row.letter_grade]);
    if (!courseInfo[row.course_name]) {
      courseInfo[row.course_name] = {
        id: row.id,
        name: row.course_name,
        majorId: row.major_id ?? '',
        creditHours: row.credit_hours,
        tuitionCost: row.cost,
        deviationFromMeanGPA: undefined,
        rawDifferenceFromMeanGPA: undefined,
      };
    }
  }

  // Calculate mean GPA for each course
  const courseMeans: { [courseName: string]: number } = {};
  let allGrades: number[] = [];
  for (const courseName in courseGrades) {
    const grades = courseGrades[courseName];
    if (grades.length > 0) {
      const mean = grades.reduce((a, b) => a + b, 0) / grades.length;
      courseMeans[courseName] = mean;
      allGrades = allGrades.concat(grades);
    }
  }
  const overallMean = allGrades.length > 0 ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length : 0;

  // Calculate standard deviation for each course
  const courseStdDevs: { [courseName: string]: number } = {};
  for (const courseName in courseGrades) {
    const grades = courseGrades[courseName];
    if (grades.length > 0) {
      const mean = courseMeans[courseName];
      const variance = grades.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / grades.length;
      courseStdDevs[courseName] = Math.sqrt(variance);
    }
  }
  // Calculate raw difference from mean for each course
  const courseDiffs: { [courseName: string]: number } = {};
  for (const courseName in courseMeans) {
    courseDiffs[courseName] = courseMeans[courseName] - overallMean;
  }

  // Map to schema Course type
  const courseStatistics: Course[] = Object.keys(courseMeans).map((courseName) => ({
    ...courseInfo[courseName],
    deviationFromMeanGPA: courseStdDevs[courseName] ?? null,
    rawDifferenceFromMeanGPA: courseDiffs[courseName] ?? null,
  }));
  return {
    meanGPA: overallMean,
    courseStatistics,
  };
}

export async function majors(): Promise<Major[]> {
  const client = new Client(connectionString);
  await client.connect();
  const res = await client.query('select * from majors');
  await client.end();
  return res.rows as Major[];
}
