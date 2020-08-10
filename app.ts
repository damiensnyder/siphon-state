const expressApp = require('express')();
const bodyParser = require('body-parser');
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());

const server = require('http').Server(expressApp);
const io = require('socket.io')(server);

const nextJs = require('next');
const nextApp = nextJs({dev: process.env.NODE_ENV != 'production'});
const nextHandler = nextApp.getRequestHandler();

const gameManager = new (require('./logic/game-manager').GameManager)(io);

nextApp.prepare().then(() => {
  expressApp.post('/create', (req, res) => {
    gameManager.createGame(req, res);
  });

  expressApp.get('/api/activeGames', (req, res) => {
    gameManager.getActiveGames(req, res);
  });

  // Send people who join the game to the game room
  expressApp.get('/game/:gameCode', (req, res) => {
    gameManager.sendToGame(req, res, nextHandler);
  });

  expressApp.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  // Start the server for socket.io
  const envPort = parseInt(process.env.PORT);
  const port = envPort >= 0 ? envPort : 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log("Listening on port " + port);
  })
});

module.exports = {
  gameManager: gameManager
};
