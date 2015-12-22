// set up ===============================================
var auth       = require('http-auth');
var bodyParser = require('body-parser');
var database   = require('./config/database');
var mongoose   = require('mongoose');
var path       = require('path');
var sass       = require('node-sass-middleware')
var express    = require('express');
var app        = express();

// configuration ========================================
var port = process.env.PORT || 8081;
var db   = process.env.MONGOLAB_URI || database.url;

app.locals.moment = require('moment');
mongoose.connect(db);
global.appRoot = path.resolve(__dirname);

// protect on production for now
if ('production' == app.get('env')) {
  var basic = auth.basic({
      realm: "Private",
      file: appRoot + "/data/users.htpasswd"
  });

  app.use(auth.connect(basic));
}

/*
  1. parse application/x-www-form-urlencoded
  2. parse application/json
  3. 1 hour timeout
  4. use jade
  5. set /views for views
  6. use sass middleware
  7. set /public for assets
  8. listen
*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'jade');
app.set('views', appRoot + '/views');

app.use(sass({
 src: appRoot + '/public',
 dest: appRoot + '/public',
 debug: true,
 outputStyle: 'compressed'
}));

app.use(express.static('public'));

app.listen(port);

// routes ===============================================
require('./app/routes')(app);

exports = module.exports = app;
console.log('App is running.');
