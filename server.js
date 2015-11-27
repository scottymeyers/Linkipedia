// set up ===============================================
var bodyParser = require('body-parser');
var database   = require('./config/database');

var express    = require('express');
var app        = express();

var mongoose   = require('mongoose');
var path       = require('path');
var timeout    = require('connect-timeout');

// configuration ========================================
mongoose.connect(database.url);

/*
  1. set the static files location
  2. parse application/x-www-form-urlencoded
  3. parse application/json
  4. no timeout x for /scrap specifically, investigate further
  5. use jade as templating lang
  6. set /views as default views directory
  7. listen (start app with node server.js)
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

console.log('http://localhost:8081/');

exports = module.exports = app;
