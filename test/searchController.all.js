var app    = require('../server');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
// var expect  = require('chai').expect;


chai.use(chaiHttp);


describe('Searches', function() {

  it('should display history in HTML on /history GET', function(done) {
    chai.request(app)
      .get('/history')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.html;
        done();
      });
  });

  it('should display ALL searches in JSON on /api/searches GET', function(done) {
    chai.request(app)
      .get('/api/searches')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('body');
        res.body[0].should.have.property('depth');
        res.body[0].should.have.property('pages_searched');
        res.body[0].should.have.property('pending');
        res.body[0].should.have.property('urls');
        done();
      });
  });

});


// NOTES
/*

.get('/')
  .auth('', '')

*/
