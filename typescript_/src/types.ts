
export type Student = {
  id: string;
  name: string;
};

export type Course = {
  id: string;
  name: string;
  majorId: string;
  creditHours: number;
  tuitionCost: number;
  deviationFromMeanGPA?: number | null;
  rawDifferenceFromMeanGPA?: number | null;
};

export type CourseGrade = {
  studentId: string;
  letterGrade: string;
};

export type GradesPerCourse = {
  courseId: string;
  grades: CourseGrade[];
};

export type CourseStatistics = {
  meanGPA: number;
  courseStatistics: Course[];
};

export type Major = {
  id: string;
  name: string;
};

export type MajorStatistics = {
  cheapestMajor: Major;
  mostExpensiveMajor: Major;
};

export type StudentStatus = {
  studentInfo: Student;
  gpa: number;
  currentEnrollments: Course[];
  previousEnrollments: Course[];
  creditsCompleted: number;
  declaredMajor?: string | null;
};

export type CourseOutcome = {
  id: string;
  grade: string;
  gpaContribution: number;
};

export type CourseCombinationOutcome = {
  overallGPA: number;
  courseOutcomes: CourseOutcome[];
};

export type AllPossibleGPAOutcomes = {
  gpaOutcomes: CourseCombinationOutcome[];
};

export type AllPossibleGraduationOutcomes = {
  courseOutcomes: CourseCombinationOutcome[];
};


// Enrollment type is still needed for DB mapping, not exposed in GraphQL
export type Enrollment = {
  id: string;
  student_id: string;
  course_name: string;
  credit_hours: number;
  start_date: string;
  end_date: string;
  cost: number;
  letter_grade: string | null;
};
