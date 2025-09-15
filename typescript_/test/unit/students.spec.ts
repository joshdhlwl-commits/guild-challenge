import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { students, student } from '../../src/queries';
import { Client } from 'pg';

chai.use(sinonChai);
const expect = chai.expect;

describe('students', () => {
  const sandbox = sinon.createSandbox();

  const studentMock = { id: '1234', name: 'test student', major: null };

  beforeEach(() => {
    sandbox.stub(Client.prototype, 'connect').resolves();
    sandbox.stub(Client.prototype, 'end').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('list students', () => {
    it('lists students returned from db', async () => {
      const mock = sandbox.stub(Client.prototype, 'query').resolves({ rows: [studentMock] });

      const response = await students();

      expect(response).to.deep.equal([studentMock]);
      expect(mock).to.have.been.calledWith('select * from students');
    });
  });
  
  describe('get student', () => {
    it('gets student by id', async () => {
      const mock = sandbox.stub(Client.prototype, 'query').resolves({ rows: [studentMock] });

      const response = await student({ id: '1234' });

      expect(response).to.equal(studentMock);
      expect(mock).to.have.been.calledWith('select * from students where id = $1::uuid', ['1234']);
    });

    it('returns null when no student in db', async () => {
      const mock = sandbox.stub(Client.prototype, 'query').resolves({ rows: [] });

      const response = await student({ id: '12345' });

      expect(response).to.be.null;
      expect(mock).to.have.been.calledWith('select * from students where id = $1::uuid', ['12345']);
    });
  });
});
