import { expect } from 'chai';
import sinon from 'sinon';
import { enrollments, getMostPopularCourse, getGradesPerCourse, getCourseStatistics } from '../../src/queries';
import { Client } from 'pg';

describe('enrollments and course reports', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('lists enrollments returned from db', async () => {
    const enrollmentMock = {
      id: '1',
      student_id: 's1',
      course_name: 'Math 101',
      credit_hours: 3,
      start_date: '2022-01-01',
      end_date: '2022-06-01',
      cost: 1000,
      letter_grade: 'A',
    };
    sandbox.stub(Client.prototype, 'connect').resolves();
    sandbox.stub(Client.prototype, 'end').resolves();
    sandbox.stub(Client.prototype, 'query').resolves({ rows: [enrollmentMock] });
    const response = await enrollments();
    expect(response).to.deep.equal([enrollmentMock]);
  });

  it('returns the most popular course', async () => {
    sandbox.stub(Client.prototype, 'connect').resolves();
    sandbox.stub(Client.prototype, 'end').resolves();
    sandbox.stub(Client.prototype, 'query')
      .onFirstCall().resolves({ rows: [{ course_name: 'Math 101', count: '2' }] })
      .onSecondCall().resolves({ rows: [{ id: 'c1', course_name: 'Math 101', major_id: 'm1', credit_hours: 3, cost: 1000 }] });
    const result = await getMostPopularCourse({ input: { startDate: '2022-01-01', endDate: '2022-12-31' } });
    expect(result).to.deep.equal({
      id: 'c1',
      name: 'Math 101',
      majorId: 'm1',
      creditHours: 3,
      tuitionCost: 1000,
      deviationFromMeanGPA: undefined,
      rawDifferenceFromMeanGPA: undefined,
    });
  });

  it('returns all grades for a course', async () => {
    sandbox.stub(Client.prototype, 'connect').resolves();
    sandbox.stub(Client.prototype, 'end').resolves();
    sandbox.stub(Client.prototype, 'query').resolves({ rows: [
      { student_id: 's1', letter_grade: 'A' },
      { student_id: 's2', letter_grade: 'B+' },
    ] });
    const result = await getGradesPerCourse({ input: { courseId: 'Math 101' } });
    expect(result).to.deep.equal({
      courseId: 'Math 101',
      grades: [
        { studentId: 's1', letterGrade: 'A' },
        { studentId: 's2', letterGrade: 'B+' },
      ],
    });
  });

  it('returns course statistics', async () => {
    sandbox.stub(Client.prototype, 'connect').resolves();
    sandbox.stub(Client.prototype, 'end').resolves();
    sandbox.stub(Client.prototype, 'query').resolves({ rows: [
      { course_name: 'Math 101', letter_grade: 'A', credit_hours: 3, cost: 1000 },
      { course_name: 'Math 101', letter_grade: 'B', credit_hours: 3, cost: 1000 },
      { course_name: 'History 201', letter_grade: 'C', credit_hours: 4, cost: 1200 },
    ] });
    const result = await getCourseStatistics();
    expect(result).to.have.property('meanGPA');
    expect(result).to.have.property('courseStatistics');
    expect(result.courseStatistics).to.be.an('array');
    expect(result.courseStatistics[0]).to.have.property('name');
    expect(result.courseStatistics[0]).to.have.property('creditHours');
    expect(result.courseStatistics[0]).to.have.property('tuitionCost');
    expect(result.courseStatistics[0]).to.have.property('deviationFromMeanGPA');
    expect(result.courseStatistics[0]).to.have.property('rawDifferenceFromMeanGPA');
  });
});
