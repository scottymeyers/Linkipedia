var cheerio = require('cheerio');
var request = require('request');
var _       = require('underscore-node');

// globals
var start    = process.argv[2];
var term     = process.argv[3];
var exact    = process.argv[4];
var id       = 2;
var parentId = 1;
var urls     = [];


// initial request to the start term page
// dont setup on tests, find a better way...
if ('test' !== process.env.NODE_ENV) {
  var url = 'https://en.wikipedia.org/wiki/' + start;
  makeRequest(url, init);
}


// in case start URL is redirected, such as when /wiki/history -> /wiki/History, etc.
function init(response){
  urls = [{ id: 1, parent: 0, href: response.request.uri.path, searched: true }];
  makeRequest(response.request.uri.href, collectUrls);

  if (process)
    process.send({ initial: true });
}


// make request and supply a callback
function makeRequest(url, callback){
  request(url, function(error, res, html){
    console.log('> ' + url);

    if (error)
      res.send({ error: error });

    callback(res, html, url);
  });
}


// accepts a requests response and grab all internal links
function collectUrls(response, html, url){
  var $ = cheerio.load(html);

  // all internal article urls
  $('#bodyContent a[href^="/wiki/"]').each(function(){
      // not already added to urls arr & exclude media files
      if (_.where(urls, { href: $(this).attr('href') }).length <= 0 && $(this).attr('href').indexOf(':') === -1) {
        // save to urls arr
        urls.push({'id': id++, 'parent': parentId, 'href': $(this).attr('href'), 'searched': false });
      }
  });

  // increment the parent ID
  parentId++;

  // lookup our search term
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
    // send the url which the term was found on
    saveAndSendResponse(url);
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


// remove unsearched urls from urls array,
// then remove searched property from each url,
// and send to visualization function.
function saveAndSendResponse(url){
  var i = urls.length;

  while (i--) {
    if (urls[i].searched === false) {
      urls.splice(i, 1);
    } else {
      delete urls[i].searched;
    }
  }

  var updatedUrls = sendUrlsForVisualization(urls);

  // - - - - - - - - - - - - - - - - - - - - - - - -
  // store the lineage w/ parent/child relationship
  // - - - - - - - - - - - - - - - - - - - - - - - -
  var result = [];

  // store the final URL which contained our search term
  result.push(_.findWhere(urls, { href: url.replace('https://en.wikipedia.org', '') }));

  // trace back to start term, prepend array with each parent
  while (result[0].parent > 0) {
    var parent = _.findWhere(urls, { id: result[0].parent });

    // place each parent at front of array
    result.unshift(parent);
  }

  // then include the end term
  result.push({href: term, parent: result[result.length - 1].id });

  var searchStrings = searchStringsArr();

  // count items in results
  var i = result.length;

  // remove all items except the first
  while (i--) {
    if (result[i].parent !== 0) {
      var parent = _.findWhere(result, { id: result[i].parent });

      _.extend(parent, { children: [result[i]] });
      result.splice(i, 1);
    }
  }


  // return results
  process.send({
    body: searchStrings,
    depth: searchStrings.length,
    pages_searched: urls.length,
    urls: updatedUrls
  });

  // - - - - - - - - - - - - - - - - - - - - - -
  // count how many levels we searched
  // - - - - - - - - - - - - - - - - - - - - - -
  function searchStringsArr(){
    var searchStrings = [];

    for (var i = 0; i < result.length; i++){
      searchStrings.push(result[i].href);
    }

    return searchStrings;
  }

  // - - - - - - - - - - - - - - - - - - - -
  // send URLs w/ parent/children hierarchy,
  // for D3 collapsible tree
  // - - - - - - - - - - - - - - - - - - - -
  function sendUrlsForVisualization(arr){
    var urlsCopy = _.map(arr, _.clone),
        i = urlsCopy.length;

    // remove all items except the first
    while (i--) {
      if (urlsCopy[i].id !== 1) {
        var parent = _.findWhere(urlsCopy, { id: urlsCopy[i].parent });

        if ( _.has(parent, 'children') ) {
          parent.children.push(urlsCopy[i]);
        } else {
          _.extend(parent, { children: [urlsCopy[i]] });
        }
      }
    }

    // find our URL which contains the end term
    var finalUrl = _.findWhere(urlsCopy, { href: url.replace('https://en.wikipedia.org', '') });

    // and add our end term as its child
    _.extend(finalUrl, { children: [{ href: term }] });

    return urlsCopy[0];
  }
}

module.exports = {
  init: init,
  makeRequest: makeRequest,
  collectUrls: collectUrls,
  searchForTerm: searchForTerm,
  saveAndSendResponse: saveAndSendResponse
}
