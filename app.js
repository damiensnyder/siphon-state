const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const next = require('next');

const nextApp = next({ dev: process.env.NODE_ENV !== 'production' });
const nextHandler = nextApp.getRequestHandler();

var envPort = parseInt(process.env.PORT);
const port = envPort >= 0 ? envPort : 3000;

io.on('connect', (socket) => {
  socket.emit('connected', {
    msg: "test"
  });
});

nextApp.prepare().then(() => {
  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log("Listening on port " + port);
  })
});
