process.env.NODE_ENV = 'test';

var app      = require('../server');
var chai     = require('chai');
var chaiHttp = require('chai-http');
var expect   = require('chai').expect;
var Search   = require("../app/models/search");
var should   = chai.should();

chai.use(chaiHttp);

describe('History', function() {

  it('should display history in HTML on /history GET', function(done) {
    chai.request(app)
      .get('/history')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.html;
        done();
      });
  });
});

describe('Searches', function() {

  Search.collection.drop();

  beforeEach(function(done){
    var newSearch = new Search({
      body: 'test',
      depth: 100,
      pages_searched: 100,
      pending: false,
      urls: { 'test': 'test' }
    });

    newSearch.save(function(err) {
      done();
    });
  });

  afterEach(function(done){
    Search.collection.drop();
    done();
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

  it('should display a single search in JSON on /api/searches/<id> GET', function(done) {
    var search = new Search({
      body: 'null',
      depth: 0,
      pages_searched: 0,
      pending: false,
      urls: { 'test': 'test' }
    });

    search.save(function(err, data) {
      chai.request(app)
        .get('/api/searches/' + data.id)
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('Object');
          res.body.should.have.property('_id');
          res.body.should.have.property('body');
          res.body.should.have.property('depth');
          res.body.should.have.property('pages_searched');
          res.body.should.have.property('pending');
          res.body.should.have.property('urls');
          done();
        });
    });
  });
});


// NOTES
/*


.get('/').auth('', '')

*/
