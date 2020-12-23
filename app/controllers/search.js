const fork = require('child_process').fork;

module.exports.createSearch = (req, res) => {
  const socketio = req.app.get('socketio');
  const data = [req.body.start, req.body.end, req.body.exact];
  const childProcess = fork('app/processes/search.js', data);

  childProcess.on('message', (m) => {
    if (m.error) {
      return socketio.emit('error', {
        results: {
          error: m.error,
        },
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

    if (m.initial) {
      return res.json({ status: 'searching' });
    }
  });
};
