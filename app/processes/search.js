const cheerio = require('cheerio');
const request = require('request');
const _ = require('underscore-node');

const START = process.argv[2];
const TERM  = process.argv[3];

let id = 2;
let parentId = 1;
let urls = [];

// make request, then fire suplied callback on response.
const makeRequest = (url, callback) => {
  console.log('> ' + url);
  request(url, (error, res, html) => {
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

makeRequest('https://en.wikipedia.org/wiki/' + START, init);

// takes a HTTP response and grab all internal links
const collectUrls = (res, html, url) => {
  const $ = cheerio.load(html);
  // select all internal article urls
  $('#bodyContent a[href^="/wiki/"]').each(function(){
    // hat haven't already been added (exclude media files)
    if (_.where(urls, { href: $(this).attr('href') }).length <= 0 && $(this).attr('href').indexOf(':') === -1) {
      // save to urls arr
      urls.push({'id': id++, 'parent': parentId, 'href': $(this).attr('href'), 'searched': false });
    }
  });
  parentId++;
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

/** url: the url which the term was found on */
const saveAndSendResponse = (url) => {
  const searchedUrls = urls.filter((url) => url.searched === true);

  let results = [];
  results.push(_.findWhere(searchedUrls, { href: url.replace('https://en.wikipedia.org', '') }));

  while (results[0].parent > 0) {
    let parent = _.findWhere(searchedUrls, { id: results[0].parent });
    results.unshift(parent);
  }

  results.push({ href: TERM, parent: results[results.length - 1].id });
  const titles = results.map((item) => item.href);
  let i = results.length;

  while (i--) {
    if (results[i].parent !== 0) {
      const parent = _.findWhere(results, { id: results[i].parent });
      _.extend(parent, { children: [results[i]] });
      results.splice(i, 1);
    }
  }

  process.send({
    body: titles,
    depth: titles.length,
    pages_searched: searchedUrls.length,
    urls: searchedUrls,
  });
};

module.exports = {
  collectUrls,
  makeRequest,
  saveAndSendResponse,
};
