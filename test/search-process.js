process.env.NODE_ENV = 'test';

var chai     = require('chai');
var chaiHttp = require('chai-http');
var scrape   = require('../app/processes/search');
var should   = chai.should();

describe('Search Process', function() {

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
