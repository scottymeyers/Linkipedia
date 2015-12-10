var searchController = require('./controllers/search');

// expose the routes to our app with module.exports
module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('index', { path: req.path });
  });

  // history of searches
  app.get('/history', function(req, res) {
    // searchController.get_searches(req, res);
  });

  // move this to an outside service? use ruby/python?
  app.post('/scrape', function(req, res) {
    // express default of 2 mins
    req.setTimeout(0);
    searchController.create_search(req, res);
  });

  // fallback
  app.get('*', function(req, res) {
    res.render('index');
  });
};
