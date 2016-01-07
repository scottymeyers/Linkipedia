var fork   = require('child_process').fork;
var Search = require('../models/search');

// return all searches
module.exports.get_searches = function(req, res) {
  // grab all records
  Search.find({}, function(err, searches) {
    if (err)
      res.send(err);

    // render the history view
    res.render('history', {
      path: req.path,
      searches: searches
    });
  });
};

// return a single search
module.exports.get_search = function(req, res) {
  // grab record by ID
  Search.findById(req.params.search_id, function(err, search) {
    // return to all searches if record doesnt exist
    if (err)
      res.redirect('/history');

    // render the single view
    res.render('single', {
      path: req.path,
      search: search
    });
  });
}

// initialize a search
module.exports.create_search = function(req, res) {
  var data = [req.body.start, req.body.end, req.body.exact];
  var childProcess = fork(appRoot +'/app/processes/search.js', data);
  var searchId;

  // send response from child process
  childProcess.on('message', function(m){

    // create a temp object
    if (m.initial) {
      // create temp object in db
      var search = new Search({
        body: 'null',
        depth: 0,
        pages_searched: 0,
        pending: true,
        urls: {}
      });

      // save temp object to DB
      search.save(function(err){
        if (err) throw err;

        // save temp search object in dbs id
        searchId = search.id;

        res.send({
          id: searchId,
          status: 'Searching'
        });
      });
    } else {
      Search.findById(searchId, function(err, search){
        search.body           = m.body;
        search.depth          = m.depth;
        search.pages_searched = m.pages_searched;
        search.pending        = false;
        search.urls           = m.urls;
        search.save();
      });
    }
  });
};
