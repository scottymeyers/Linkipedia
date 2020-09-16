const cheerio = require('cheerio');
const request = require('request');
const _ = require('underscore-node');

const START = process.argv[2];
const TERM  = process.argv[3];

let id       = 2;
let parentId = 1;
let urls     = [];

// make request, then fire suplied callback on response.
const makeRequest = (url, callback) => {
  console.log('> ' + url);
  request(url, function(error, res, html){
    if (error) res.send({ error: error });
    callback(res, html, url);
  });
};

// uses res.request.uri.path in case of redirect, blue > Blue.
const init = (res) => {
  urls = [{ id: 1, parent: 0, href: res.request.uri.path, searched: true }];
  makeRequest(res.request.uri.href, collectUrls);
  process.send({ initial: true });
};

// make first request, dont include on tests...
if ('test' !== process.env.NODE_ENV) {
  makeRequest('https://en.wikipedia.org/wiki/' + START, init);
}

// takes a HTTP response and grab all internal links
const collectUrls = (res, html, url) => {
  const $ = cheerio.load(html);
  // select all internal article urls
  $('#bodyContent a[href^="/wiki/"]').each(function(){
    // not already added to urls arr & exclude media files
    if (_.where(urls, { href: $(this).attr('href') }).length <= 0 && $(this).attr('href').indexOf(':') === -1) {
      // save to urls arr
      urls.push({'id': id++, 'parent': parentId, 'href': $(this).attr('href'), 'searched': false });
    }
  });
  // increment the parent ID
  parentId++;
  // then look for our search term
  searchForTerm(url, $, res);
};

const searchForTerm = (url, $, res) => {
  const exact = process.argv[4];
  let nextUrl;
  let searchTerm;

  // e.g. skateboard not 'skateboard'ing
  if (exact === 'true') {
    searchTerm = new RegExp('\\b'+ TERM +'\\b', 'gi');
  } else {
    searchTerm = new RegExp(TERM, 'gi');
  }

  if ($('#bodyContent').text().match(searchTerm)) {
    // send the url which the term was found on
    saveAndSendResponse(url);
  } else {
    // otherwise, find first saved unsearched URL
    nextUrl = _.findWhere(urls, {searched: false});
    // if all URLs have been searched
    if (urls.length <= 1 || !nextUrl) {
      res.send({ error: 'No remaining URLs.' });
    } else {
      nextUrl.searched = true;
      makeRequest('https://en.wikipedia.org' + nextUrl.href, collectUrls);
    }
  }
};

const saveAndSendResponse = (url) => {
  // remove unsearched urls
  const searchedUrls = urls.filter((url) => url.searched === true);

  // send URLs w/ parent/children hierarchy > D3 Tree
  const sendUrlsForVisualization = (arr) => {
    const urlsCopy = _.map(arr, _.clone);
    let i = urlsCopy.length;

    console.log('!', urlsCopy);

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
    const finalUrl = _.findWhere(urlsCopy, { href: url.replace('https://en.wikipedia.org', '') });
    // and add our end term as its child
    _.extend(finalUrl, { children: [{ href: TERM }] });

    return urlsCopy[0];
  };

  // visualize
  const updatedUrls = sendUrlsForVisualization(searchedUrls);

  // create array for visualization
  let result = [];

  // store the final URL which contained our search term
  result.push(_.findWhere(searchedUrls, { href: url.replace('https://en.wikipedia.org', '') }));

  // trace back to start term, prepend array with each parent
  while (result[0].parent > 0) {
    let parent = _.findWhere(searchedUrls, { id: result[0].parent });
    result.unshift(parent);
  }

  // the search term
  result.push({href: TERM, parent: result[result.length - 1].id });

  // preserve searched article titles/permalinks
  // saves titles for sequence
  const titles = result.map((item) => item.href);

  // remove all items except the first
  let i = result.length;

  while (i--) {
    if (result[i].parent !== 0) {
      const parent = _.findWhere(result, { id: result[i].parent });
      _.extend(parent, { children: [result[i]] });
      result.splice(i, 1);
    }
  }

  // return results
  process.send({
    body: titles,
    depth: titles.length,
    pages_searched: searchedUrls.length,
    urls: updatedUrls
  });
};

module.exports = {
  init: init,
  makeRequest,
  collectUrls,
  searchForTerm,
  saveAndSendResponse,
};
