var cheerio = require('cheerio');
var fs      = require('fs');
var request = require('request');
var _       = require('underscore-node');

// load the saved searches model
var Search = require('../models/search');

// get a list of all performed searches
module.exports.get_searches = function(res) {
  Search.find({}, function(err, searches) {
    if (err) throw err;

    res.render('history', {searches: searches});
  });
};

// initialize a search
module.exports.create_search = function(req, res) {
  var start = req.body.start;
  var term = req.body.end;
  var exact = req.body.exact;
  var baseUrl  = 'https://en.wikipedia.org/wiki/' + req.body.start;
  var id = 2;
  var parentId = 1;
  var json = [{ id: 1, parent: 0, href: '/wiki/'+ start, searched: true }];
  var connectionClosed = false;

  // if the connection is closed, stop this search
  req.connection.on('close', function(){
    connectionClosed = true;
  });

  // initialize
  makeRequest(baseUrl);

  // accepts a URL, calls two further functions to store current URL's internal liks
  function makeRequest(url){
    console.log('> ' + url);

    if (connectionClosed !== true) {
      request(url, function(error, response, html) {

          if (!error) {
              var $ = cheerio.load(html);

              // store all interal content links in json if they aren't already added and aren't media files, etc :
              $('#mw-content-text p a[href^="/wiki/"]').each(function(){
                  if (_.where(json, { href: $(this).attr('href') }).length <= 0 && $(this).attr('href').indexOf(':') === -1) {
                    json.push({'id': id++, 'parent': parentId, 'href': $(this).attr('href'), 'searched': false });
                  }
              });

              parentId++;

              // then search for our end term
              searchForTerm(url, $);
          } else {
            console.log('ERROR: ' + error);
            res.send({error: error });
          }
      });
    }
  }

  // check if page content contains our search term
  function searchForTerm(url, $){
    var nextUrl, searchTerm;

    // if exact, use Regex
    if (exact) {
      searchTerm = new RegExp('\\b'+ term +'\\b', 'gi');
    } else {
      searchTerm = term;
    }

    if ($('#bodyContent').text().match(searchTerm)) {
      createLineageArray(url);
    } else {
      // otherwise, find first saved unsearched URL
      nextUrl = _.findWhere(json, {searched: false});

      // no URLs unsearched URLs exist (sometimes a page will have zero content and this catches it)
      if (json.length <= 1 || !nextUrl) {
        res.send({error: 'Not enough URLs' });
      } else {
        nextUrl.searched = true;
        makeRequest('https://en.wikipedia.org' + nextUrl.href, nextUrl.id);
      }
    }
  }

  function sendResponse(data, count){
    var parent;
    var time = Date.now();
    var i = data.length;

    while (i--) {
      if (data[i].parent !== 0) {
        parent = _.findWhere(data, { id: data[i].parent });
        _.extend(parent, { children: [data[i]] });
        data.splice(i, 1);
      }
    }

    fs.writeFile('public/data/lineage.json', JSON.stringify(data, null, 4), function() {
        console.log('File successfully written! - Check your project directory for the lineage.json file');
    });

    res.send({status: 'OK', url: '/data/lineage.json', count: count });
  }

  function createLineageArray(url){
    var result = _.findWhere(json, { href: url.replace('https://en.wikipedia.org', '') });
    var count = _.where(json, { searched: true }).length;
    var lineage = [result];
    var searchStrings = [];

    // trace back to parent ID of 0
    while (lineage[0].parent > 0){
      // find earliest URL's parent
      var parent = _.findWhere(json, { id: lineage[0].parent });
      // place start term in beginning of array
      lineage.unshift(parent);
    }

    // place end term at end of array
    lineage.push({href: term, parent: lineage[lineage.length-1].id });

    for (var i = 0; i < lineage.length; i++){
      searchStrings.push(lineage[i].href);
    }

    // create a new user called chris
    var search = new Search({
      body: searchStrings
    });

    // call the built-in save method to save to the database
    search.save(function(err) {
      if (err) throw err;
      console.log('Search saved successfully!');
    });

    sendResponse(lineage, count);
  }
};
