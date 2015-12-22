var app    = require('../server');
var chai = require('chai');
var chaiHttp = require('chai-http');
// var expect  = require('chai').expect;
var should = chai.should();

chai.use(chaiHttp);


describe('Searches', function() {

  it('should display ALL searches on /history GET', function(done) {
    chai.request(app)
      .get('/history')
      //.auth('dangler', 'dangler')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.html;
        done();
      });
  });

});
