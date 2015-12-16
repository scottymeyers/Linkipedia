
var fs      = require('fs');
var searchController = require('./controllers/search');

// expose the routes to our app with module.exports
module.exports = function(app) {

  // CORS
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // index
  app.get('/', function(req, res) {
    res.render('index', { path: req.path });
  });

  // history of searches
  app.get('/history', function(req, res) {
    searchController.get_searches(req, res);
  });

  // move this to an outside service? use ruby/python?
  app.post('/scrape', function(req, res) {
    // delete existing files
    fs.unlink('public/data/urls.json', function (err) {});
    fs.unlink('public/data/result.json', function (err) {});
    // express default of 2 mins
    req.setTimeout(0);
    searchController.create_search(req, res);
  });

  // fallback
  app.get('*', function(req, res) {
    res.render('index');
  });
};
