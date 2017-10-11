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

before(function(done) {
  mockgoose.prepareStorage().then(function() {
    mongoose.connect('mongodb://localhost/conduit', function(err) {
      done(err);
    })
  });
});

describe('Server', () => {
  describe('/GET users', () => {
    it('it should get no books, the server should be empty', (done) => {
      chai.request(server)
        .get('api/users')
        .end((err, res) => {
          res.body.should.have(users);
          res.body.should.have(userCount);
          res.body.userCount.should.be.eql(0);
          done(err);
        })
    })
  })
});