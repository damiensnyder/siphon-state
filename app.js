var expressApp = require('express')();
var bodyParser = require('body-parser');
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());
var server = require('http').Server(expressApp);
var io = require('socket.io')(server);
var nextJs = require('next');
var nextApp = nextJs({ dev: process.env.NODE_ENV != 'production' });
var nextHandler = nextApp.getRequestHandler();
var GameManager = require('./logic/game-manager').GameManager;
var gameManager = new GameManager(io);
nextApp.prepare().then(function () {
    expressApp.post('/create', function (req, res) {
        gameManager.createGame(req, res);
    });
    expressApp.get('/api/activeGames', function (req, res) {
        gameManager.getActiveGames(req, res);
    });
    // Send people who join the game to the game room
    expressApp.get('/game/:gameCode', function (req, res) {
        gameManager.sendToGame(req, res, nextHandler);
    });
    expressApp.get('*', function (req, res) {
        return nextHandler(req, res);
    });
    // Start the server for socket.io
    var envPort = parseInt(process.env.PORT);
    var port = envPort >= 0 ? envPort : 3000;
    server.listen(port, function (err) {
        if (err)
            throw err;
        console.log("Listening on port " + port);
    });
});
module.exports = {
    gameManager: gameManager
};
