var searchController = require('./controllers/search');

// expose the routes to our app with module.exports
module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('index');
  });

  // history of searches
  app.get('/history', function(req, res) {
    searchController.get_searches(res);
  });

  // move this to an outside service? use ruby/python?
  app.post('/scrape', function(req, res) {
    searchController.create_search(req, res);
  });

  // fallback
  app.get('*', function(req, res) {
    res.render('index');
  });
};
