process.env.NODE_ENV = 'test';

var app      = require('../server');
var chai     = require('chai');
var chaiHttp = require('chai-http');
var scrape   = require('../app/child/scrape');
var Search   = require("../app/models/search");
var should   = chai.should();

describe('Scraper', function() {

  describe('makeRequest', function() {
    it('should make a request, then fire a callback function', function(done){

      scrape.makeRequest('http://www.google.com', callbackFunction);

      function callbackFunction() {
        this.should.be.ok;
        done();
      }
    });
  });
});
