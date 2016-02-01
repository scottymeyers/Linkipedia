// set up ===============================================
var bodyParser = require('body-parser');
var config     = require('./app/config');
var jade       = require('jade');
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

/*
  ~ parse application/x-www-form-urlencoded
  ~ parse application/json
  ~ 1 hour timeout
  ~ use jade
  ~ set /views for views
  ~ set /public for assets
  ~ listen
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
