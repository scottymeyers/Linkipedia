const fork = require('child_process').fork;

module.exports.createSearch = (req, res) => {
  const data = [req.body.start, req.body.end, req.body.exact];
  const childProcess = fork('app/processes/search.js', data);

  // send response from child process
  childProcess.on('message', (m) => {
    if (!m.initial) {
      console.log(
        'body', m.body,
        'depth', m.depth,
        'pages_searched', m.pages_searched,
        'urls', m.urls
      );
      // randomized ID
      /*
      res.send({
        id: Math.floor(Math.random() * new Date()),
        status: 'Searching'
      });
      */
      console.log('set');
    } else {
      console.log('search');
    }
  });
};
