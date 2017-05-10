const bodyParser = require('body-parser');
const config     = require('./app/config');
const jade       = require('jade');
const mongoose   = require('mongoose');
const path       = require('path');
const express    = require('express');

const app = express();

// mongoose =============================================
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI[app.settings.env], function(err, res) {
    if(err)
        console.log('Error connecting to the database. ' + err);
});

// configuration ========================================
app.locals.moment = require('moment');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade');
app.set('views', './app/views');
app.use(express.static('public'));

// routes ===============================================
require('./app/routes')(app);

exports = module.exports = app;
