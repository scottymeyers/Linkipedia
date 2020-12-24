const cheerio = require('cheerio');
const { default: PQueue } = require('p-queue');
const fetch = require('node-fetch');

const START = process.argv[2];
const TERM  = process.argv[3];
const EXACT = process.argv[4];

let id = 1;
const urls = [];

const queue = new PQueue({ concurrency: 1 });

const addToQueue = async (url, parentId) => {
	await queue.add(() => {
    fetch(url)
    .then(res => res.text())
    .then(html => {
      if (!html) return;
      process.send({ message: `searching: ${url}` });
      const $ = cheerio.load(html);
      const term = EXACT ? new RegExp('\\b'+ TERM +'\\b', 'gi') : new RegExp(TERM, 'gi');
      const found = $('#bodyContent').text().match(term);

      const urlId = id++;

      urls.push({
        id: urlId,
        parentId,
        href: url,
      });

      if (found) {
        process.send({ message: `found in: ${url}` });
        process.send({ urls });
      } else {
        $('#bodyContent a').each((_, value) => {
          const href = $(value).attr('href');
          if (href && href.startsWith('/wiki/')) {
            addToQueue(`https://en.wikipedia.org${href}`, urlId);
          }
        });
      }
    })
    .catch((e) => console.log('error', e));
  });
};

addToQueue(`https://en.wikipedia.org/wiki/${START}`, 0);

queue.onEmpty(() => console.log('EMPTY!'));