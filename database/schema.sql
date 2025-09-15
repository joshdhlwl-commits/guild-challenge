drop table if exists enrollments;
drop table if exists students;
drop table if exists majors;

create table majors (
    id uuid primary key default gen_random_uuid (),
    name varchar not null,
    credits_required int not null,
    minimum_gpa float not null
);

create table students (
    id uuid primary key default gen_random_uuid(),
    name varchar not null,
    major uuid references majors(id) null
);


create table enrollments (
    id uuid primary key default gen_random_uuid (),
    student_id uuid references students (id),
    course_name varchar not null,
    credit_hours int not null,
    start_date date not null,
    end_date date not null,
    cost float not null,
    letter_grade varchar
);