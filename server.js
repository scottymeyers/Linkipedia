// set up ===============================================
var bodyParser = require('body-parser');
var database   = require('./config/database');
var mongoose   = require('mongoose');
var sass       = require('node-sass');
var timeout    = require('connect-timeout');

var express    = require('express');
var app        = express();

// configuration ========================================
app.locals.moment = require('moment');
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

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(timeout('3600s'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.listen('8081');

// routes ===============================================
require('./app/routes')(app);

exports = module.exports = app;

console.log('App is running.');
