// set up ===============================================
var bodyParser = require('body-parser');
var database   = require('./config/database');
var mongoose   = require('mongoose');
var timeout    = require('connect-timeout');

var express    = require('express');
var app        = express();
// var path       = require('path');

// configuration ========================================
mongoose.connect(database.url);

/*
  1. set /public for assets
  2. parse application/x-www-form-urlencoded
  3. parse application/json
  4. 1 hour timeout
  5. use jade
  6. set /views for views
  7. listen
*/

app
  .use(express.static('public'))
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(timeout('3600s'))
  .set('view engine', 'jade')
  .set('views', __dirname + '/views')
  .listen('8081');

// routes ===============================================
require('./app/routes')(app);

exports = module.exports = app;

console.log('http://localhost:8081/');
