var searchController = require('./controllers/search');
var Search = require('./models/search');

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

  // get all searches
  app.get('/api/searches', function(req, res) {
    Search.find(function(err, searches) {
      if (err)
        res.send(err);
      res.json(searches);
    });
  });

  // get a particular search
  app.get('/api/searches/:search_id', function(req, res) {
    Search.findById(req.params.search_id, function(err, search) {
      if (err)
        res.send(err);
      res.json(search);
    });
  });

  // history of searches
  app.get('/history', function(req, res) {
    searchController.get_searches(req, res);
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
