const { fork } = require('child_process');

const initializeCrawl = (req) => {
  const socketio = req.app.get('socketio');
  const data = [req.body.start, req.body.end, req.body.exact];
  const childProcess = fork('app/crawl.js', data);

  childProcess.on('message', ((m) => {
    if (m.error) {
      return socketio.emit('error', {
        results: {
          error: m.error,
        },
      });
    }
    if (m.message) {
      return socketio.emit('message', {
        message: m.message,
      });
    }
    if (m.urls) {
      childProcess.kill();
      return socketio.emit('results', {
        results: {
          urls: m.urls,
        },
      });
    }
    return null;
  }));
};

module.exports = (app) => {
  app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
  app.get('/', (req, res) => res.render('index', { path: req.path }));
  app.post('/crawl', (req, res) => initializeCrawl(req, res));
  app.get('*', (req, res) => res.redirect('/'));
};
