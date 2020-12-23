const cheerio = require('cheerio');
const { default: PQueue } = require('p-queue');
const fetch = require('node-fetch');

const START = process.argv[2];
const TERM  = process.argv[3];
const EXACT = process.argv[4];

let id = 0;
const urls = [];

const queue = new PQueue({ concurrency: 1 });

const addToQueue = async (url, parentId) => {
	await queue.add(() => {
    fetch(url)
    .then(res => res.text())
    .then(html => {
      if (!html) return;
      console.log(`searching: ${url}`);
      const $ = cheerio.load(html);
      const term = EXACT ? new RegExp('\\b'+ TERM +'\\b', 'gi') : new RegExp(TERM, 'gi');
      const found = $('#bodyContent').text().match(term);

      urls.push({
        id: id++,
        parent: parentId,
        href: url,
      });

      if (found) {
        saveAndSendResponse(url);
      } else {
        $('#bodyContent a').each((_, value) => {
          const href = $(value).attr('href');
          if (href && href.startsWith('/wiki/')) {
            addToQueue(`https://en.wikipedia.org${href}`, parentId + 1);
          }
        });
      }
    })
    .catch((e) => console.log('error', e));
  });
};

addToQueue(`https://en.wikipedia.org/wiki/${START}`, 0);

queue.onEmpty(() => console.log('EMPTY!'));

const saveAndSendResponse = (url) => {
  console.log('FOUND!', url);
  const u = [...urls];
  process.send({ urls: u });
};
