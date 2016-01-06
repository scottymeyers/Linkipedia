process.env.NODE_ENV = 'test';

var app      = require('../server');
var chai     = require('chai');
var chaiHttp = require('chai-http');
var expect   = require('chai').expect;
var Search   = require("../app/models/search");
var should   = chai.should();

// id of newely created search
var searchId = '';

chai.use(chaiHttp);

describe('Routes', function() {

  describe('Home', function() {
    it('should render and show html', function(done){
      chai.request(app)
        .get('/')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;
          done();
      });
    });
  });


  describe('History', function() {
    Search.collection.drop();

    beforeEach('create and save a search record', function(done){
      createRecord(done);
    });

    afterEach('remove all searches', function(done){
      Search.collection.drop();
      done();
    });

    it('should display searches in HTML on /history GET', function(done) {
      chai.request(app)
        .get('/history')
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.html;
          done();
        });
    });

    it('should display a single search in HTML on /history/<id> GET', function(done) {
      chai.request(app)
        .get('/history/' + searchId)
        .end(function(err, res){
          res.should.have.status(200);
          res.should.be.html;
          done();
      });
    });
  });


  describe('Searches API', function() {
    Search.collection.drop();

    beforeEach('create and save a search record', function(done){
      createRecord(done);
    });

    afterEach('remove all searches', function(done){
      Search.collection.drop();
      done();
    });

    it('should display searches in JSON on /api/searches GET', function(done) {
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
        chai.request(app)
          .get('/api/searches/' + searchId)
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

  describe('Nonexistant Route', function(){
   var randomString = generateRandomString(10);

    it('should render the homepage', function(done){
      chai.request(app)
        .get('/'+ randomString)
        .redirects(0)
        .end(function(err, res){
          res.should.redirectTo('/');
          done();
      });
    });
  });
});

function generateRandomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function createRecord(done) {
    var search = new Search({
      body: 'test',
      depth: 100,
      pages_searched: 100,
      pending: false,
      urls: { 'test': 'test' }
    });

    search.save(function(err) {
      searchId = search.id;
      done();
    });
}
