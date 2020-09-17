const fork = require('child_process').fork;

module.exports.createSearch = (req, res) => {
  const socketio = req.app.get('socketio');
  const data = [req.body.start, req.body.end, req.body.exact];
  const childProcess = fork('app/processes/search.js', data);

  childProcess.on('message', (m) => {
    if (!m.initial) {
      socketio.emit('results', {
        results: {
          body: m.body,
          depth: m.depth,
          pages_searched: m.pages_searched,
          urls: m.urls,
        }
      });
    } else {
      // send a response immediately communicating that search has begun and update UI accordingly
      res.json({ status: 'searching' });
    }
  });
};
