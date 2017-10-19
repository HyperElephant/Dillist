let Mongoose = require('mongoose').Mongoose;
let mongoose = new Mongoose();

let Mockgoose = require('mockgoose').Mockgoose;
let mockgoose = new Mockgoose(mongoose);

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();


process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

if (mockgoose.helper.isMocked) {
  // mocked
  console.log("mocked");
} else {
  // mock it now
  console.log("not mocked, mocking");
  mockgoose(mongoose);
}

before(function(done) {
  mockgoose.prepareStorage().then(function() {
    console.log("Before connect");
    mongoose.connect('mongodb://localhost/conduit', function(err) {
      done(err);
    })
  });
});

describe('Server', () => {
  describe('/GET users', () => {
    it('it should get no users, the server should be empty', (done) => {
      chai.request(server)
        .get('/api/users')
        .end((err, res) => {
          console.log("Server: " + server);
          res.body.should.have.param("users");
          res.body.should.have.param("userCount");
          res.body.userCount.should.be.eql(0);
          done();
        })
    })
  })
});