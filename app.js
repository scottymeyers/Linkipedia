// const bodyParser = require('body-parser');
const express = require('express');
const cheerio = require('cheerio');
const { default: PQueue } = require('p-queue');
const fetch = require('node-fetch')

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

app.locals.moment = require('moment');

app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

/** routes */
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/', (req, res) => res.render('index', { path: req.path }));
app.post('/crawl', (req, res) => {
  const socketio = req.app.get('socketio');
  const { start, end, exact } = req.body;
  let id = 1;
  const links = [];
  const nodes = [];
  const queue = new PQueue({ concurrency: 1, timeout: 5000 });
  
  const addToQueue = async (url, parentId) => {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const term = exact ? new RegExp('\\b'+ end +'\\b', 'gi') : new RegExp(end, 'gi');
    const found = $('#bodyContent').text().match(term);
    const urlId = id++;
    const u = {
      id: url,
      nid: urlId,
      parentId,
    };
    nodes.push(u);
    links.push({
      source: urlId,
      target: parentId,
    })
    console.log(`-> ${url}`)
    if (found) {
      queue.clear();
      socketio.emit('results', {
        /** TODO: return only the sequence not all the nodes */
        message: `Found in: ${url}`,
        results: {
          links,
          nodes,
        },
      });
    } else {
      socketio.emit('message', {
        message: `Searching: ${url}`,
      });
      $('#bodyContent a').each((_, value) => {
        const href = $(value).attr('href');
        if (href && href.startsWith('/wiki/') && !href.includes('(identifier)')) {
          queue.add(() => addToQueue(`https://en.wikipedia.org${href}`, urlId));
        }
      });
    }
  };
  
  // initialize
  queue.add(() => addToQueue(`https://en.wikipedia.org/wiki/${start}`, 0));
  
  res.status(200).json({
    data: {
      message: 'initializing search'
    }
  });
});
app.get('*', (_, res) => res.redirect('/'));

/** sockets */
app.set('socketio', io);

io.sockets.on('connection', (socket) => {
  socket.emit('message', { message: 'Connected' });
});

server.listen(process.env.PORT || 3000);
