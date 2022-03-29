process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../src/index.ts');

const should = chai.should();

chai.use(chaiHttp);
/*
  * Test the GETroute
  */
describe('GET /api/fetchMetricsData', () => {
  it('it should GET the metrics data for a team', (done) => {
    chai.request(server)
      .get(`/api/fetchMetricsData?competition=2020ilch&team=8160&CLIENT_ID=${process.env.TRA_CLIENTID}&CLIENT_SECRET=${process.env.TRA_CLIENTSECRET}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('metrics');
        res.body.metrics.should.have.property('elo');
        res.body.metrics.should.have.property('gl2');
        res.body.competition.should.eql('2020ilch');
        res.body.should.have.property('success').eql(true);
      });
      chai.request(server)
      .get(`/api/fetchMetricsData?CLIENT_ID=${process.env.TRA_CLIENTID}&CLIENT_SECRET=${process.env.TRA_CLIENTSECRET}`)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('success').eql(false);
        done();
      });
  });
});
