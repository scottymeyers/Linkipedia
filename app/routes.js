const { fork } = require('child_process');

const initializeCrawl = (req) => {
  const socketio = req.app.get('socketio');
  const data = [req.body.start, req.body.end, req.body.exact];
  const childProcess = fork('app/crawl.js', data);

  childProcess.on('message', ((m) => {
    switch (m.type) {
      case 'message':
        return socketio.emit('message', {
          message: m.message,
        });
      case 'results':
        childProcess.kill();
        return socketio.emit('results', {
          message: m.message,
          results: {
            urls: m.urls,
          },
        });
      default:
        // childProcess.kill();
        return null;
    }
  }));

  // childProcess.on('disconnect', (() => console.log('disconnect')));
  // childProcess.on('error', ((m) => console.log('error', m)));
  // childProcess.on('exit', ((m) => console.log('exit', m)));
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
  app.post('/crawl', (req) => initializeCrawl(req));
  app.get('*', (_, res) => res.redirect('/'));
};
