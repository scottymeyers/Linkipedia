var cheerio = require('cheerio');
var fs      = require('fs');
var request = require('request');
var _       = require('underscore-node');

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
  var start = req.body.start;
  var term = req.body.end;
  var urls;
  var id = 2;
  var parentId = 1;
  var connectionClosed = false;

  // on closed connection, stop search
  req.connection.on('close', function(){
    connectionClosed = true;
  });

  // initial request to the start term page
  makeRequest('https://en.wikipedia.org/wiki/' + start, init);

  function init(response) {
    urls = [{ id: 1, parent: 0, href: response.request.uri.path, searched: true }];
    makeRequest(response.request.uri.href, collectUrls);
  }

  function makeRequest(url, callback) {
    // continue to check for active connection
    if (connectionClosed !== true) {
      request(url, function(error, response, html) {
        console.log('> ' + url);

        if (!error) {
          callback(response, html, url);
        } else {
          res.send({ error: error });
        }
      });
    }
  }

  function collectUrls(response, html, url) {
    var $ = cheerio.load(html);

    // include only if not already added to list, and are not media files
    $('#bodyContent a[href^="/wiki/"]').each(function(){
        if (_.where(urls, { href: $(this).attr('href') }).length <= 0 && $(this).attr('href').indexOf(':') === -1) {
          urls.push({'id': id++, 'parent': parentId, 'href': $(this).attr('href'), 'searched': false });
        }
    });

    parentId++;
    searchForTerm(url, $);
  }

  function searchForTerm(url, $){
    var nextUrl, searchTerm;

    // i.e. skateboard not 'skateboard'ing
    if (req.body.exact) {
      searchTerm = new RegExp('\\b'+ term +'\\b', 'gi');
    } else {
      searchTerm = new RegExp(term, 'gi');
    }

    if ($('#bodyContent').text().match(searchTerm)) {
      saveAndSaveResponse(url);
    } else {
      // otherwise, find first saved unsearched URL
      nextUrl = _.findWhere(urls, {searched: false});

      // no URLs unsearched URLs exist (sometimes a page will have zero content and this catches it)
      if (urls.length <= 1 || !nextUrl) {
        res.send({ error: 'No remaining URLs.' });
      } else {
        nextUrl.searched = true;
        makeRequest('https://en.wikipedia.org' + nextUrl.href, collectUrls);
      }
    }
  }

  // revisit this function
  function saveAndSaveResponse(url){
    var lineage = [_.findWhere(urls, { href: url.replace('https://en.wikipedia.org', '') })];
    var searchStrings = [];

    // trace back to parent ID of 0
    while (lineage[0].parent > 0){
      var parent = _.findWhere(urls, { id: lineage[0].parent });
      // place start term in beginning of array
      lineage.unshift(parent);
    }

    // include the end term
    lineage.push({href: term, parent: lineage[lineage.length-1].id });

    for (var i = 0; i < lineage.length; i++){
      searchStrings.push(lineage[i].href);
    }

    // create search to save to DB
    var search = new Search({
      body: searchStrings
    });

    // call the built-in save method to save to the database
    search.save(function(err) {
      if (err) throw err;
      console.log('Search saved successfully!');
    });

    // return the lineage and total URLs searched
    var i = lineage.length;

    while (i--) {
      if (lineage[i].parent !== 0) {
        var parent = _.findWhere(lineage, { id: lineage[i].parent });
        _.extend(parent, { children: [lineage[i]] });
        lineage.splice(i, 1);
      }
    }

    fs.writeFile('public/data/lineage.json', JSON.stringify(lineage, null, 4));

    res.send({
      status: 'OK',
      url: '/data/lineage.json',
      count: _.where(urls, { searched: true }).length
    });
  }
};
