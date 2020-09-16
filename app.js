const bodyParser = require('body-parser');
const express = require('express');

const app = express();

app.locals.moment = require('moment');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'jade');
app.set('views', './app/views');
app.use(express.static('public'));

require('./app/routes')(app);

const port = 3000;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

exports = module.exports = app;
