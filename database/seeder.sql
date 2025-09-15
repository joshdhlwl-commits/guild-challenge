\copy majors(id, name, credits_required, minimum_gpa) from 'majors.csv' csv header null 'null';
\copy students(id, name, major) from 'students.csv' csv header null 'null';
\copy enrollments(student_id, course_name, credit_hours, start_date, end_date, cost, letter_grade) from 'enrollments.csv' csv header null 'null';
