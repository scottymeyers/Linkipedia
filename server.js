// set up ===============================================
var auth       = require('http-auth');
var bodyParser = require('body-parser');
var config     = require('./app/config');
var mongoose   = require('mongoose');
var path       = require('path');
var express    = require('express');
var app        = express();

// mongoose =============================================
mongoose.connect(config.mongoURI[app.settings.env], function(err, res) {
  if(err)
    console.log('Error connecting to the database. ' + err);
});

// configuration ========================================
var port = process.env.PORT || 8081;

app.locals.moment = require('moment');

// globals ==============================================
global.appRoot = path.resolve(__dirname);

// protect on production ================================
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
  7. set /public for assets
  8. listen
*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'jade');
app.set('views', appRoot + '/views');

app.use(express.static('public'));

app.listen(port);

// routes ===============================================
require('./app/routes')(app);

exports = module.exports = app;
console.log('App is running.');
