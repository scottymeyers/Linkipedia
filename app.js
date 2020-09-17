const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.locals.moment = require('moment');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

io.sockets.on('connection', (socket) => {
  console.log('Someone connected to me, hooray!');
  socket.emit('status', { message: "EHLO OK Connected" });

  // sending a message back to the client
  socket.emit('connected', { message: 'Thanks for connecting!' });

  // listening for messages from the client
  socket.on('message', (message) => {
    console.log(message);
  });
});

require('./app/routes')(app);

server.listen(process.env.PORT || 3000);
