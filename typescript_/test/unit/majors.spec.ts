import { expect } from 'chai';
import sinon from 'sinon';
import { majors } from '../../src/queries';
import { Client } from 'pg';

describe('majors', () => {
  const sandbox = sinon.createSandbox();
  const majorMock = { id: '1', name: 'Mathematics', cost: 10000 };

  beforeEach(() => {
    sandbox.stub(Client.prototype, 'connect').resolves();
    sandbox.stub(Client.prototype, 'end').resolves();
    sandbox.stub(Client.prototype, 'query').resolves({ rows: [majorMock] });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('lists majors returned from db', async () => {
    const response = await majors();
    expect(response).to.deep.equal([majorMock]);
  });
});
