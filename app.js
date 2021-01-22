const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

app.locals.moment = require('moment');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('socketio', io);

io.sockets.on('connection', (socket) => {
  socket.emit('message', { message: 'Connected' });
  socket.on('message', (message) => console.log(message));
});

require('./app/routes')(app, io);

server.listen(process.env.PORT || 3000);
