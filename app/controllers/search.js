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
  var exact = req.body.exact;
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

  // in case start URL is redirected, such as when /wiki/history -> /wiki/History, etc.
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

    // e.g. skateboard not 'skateboard'ing
    if (exact === 'true') {
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
    var result = [_.findWhere(urls, { href: url.replace('https://en.wikipedia.org', '') })];
    var searchStrings = [];

    // trace back to parent ID of 0
    while (result[0].parent > 0){
      var parent = _.findWhere(urls, { id: result[0].parent });
      // place start term in beginning of array
      result.unshift(parent);
    }

    // include the end term
    result.push({href: term, parent: result[result.length-1].id });

    for (var i = 0; i < result.length; i++){
      searchStrings.push(result[i].href);
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

    // return the result and total URLs searched
    var i = result.length;

    while (i--) {
      if (result[i].parent !== 0) {
        var parent = _.findWhere(result, { id: result[i].parent });
        _.extend(parent, { children: [result[i]] });
        result.splice(i, 1);
      }
    }

    fs.writeFile('public/data/result.json', JSON.stringify(result, null, 4));
    fs.writeFile('public/data/urls.json', JSON.stringify(urls, null, 4));

    res.send({
      status: 'OK',
      result: '/data/result.json',
      urls: '/data/urls.json',
      count: _.where(urls, { searched: true }).length,
      depth: searchStrings.length - 2
    });
  }
};
