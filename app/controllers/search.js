var fork   = require('child_process').fork;
var Search = require('../models/search');

// list of all performed searches
module.exports.get_searches = function(req, res) {
  Search.find({}, function(err, searches) {
    if (err) throw err;

    res.render('history', {
      path: req.path,
      searches: searches
    });
  });
};

// initialize a search
module.exports.create_search = function(req, res) {
  var data = [req.body.start, req.body.end, req.body.exact];
  var childProcess = fork(appRoot +'/app/child/scrape.js', data);
  var searchId;

  // send response from child process
  childProcess.on('message', function(m){

    if (m.initial) {
      // create temp object in db
      var search = new Search({
        body: 'null',
        depth: 0,
        pages_searched: 0,
        pending: true,
        urls: {}
      });

      search.save(function(err){
        if (err) throw err;

        // save temp search object in dbs id
        searchId = search.id;

        // pending = true
        res.send({
          id: searchId,
          status: 'Searching'
        });
      });

    } else {

      // pending = false

      Search.findById(searchId, function(err, search){
        if (err) throw err;

        search.body           = m.body;
        search.depth          = m.depth;
        search.pages_searched = m.pages_searched;
        search.pending        = false;
        search.urls           = m.urls;

        search.save(function(err){
          if (err) throw err;
          console.log('updated!');
        });
      });
    }
  });
};
