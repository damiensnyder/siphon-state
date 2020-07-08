const Game = require('./game-room.js');

class GameManager {
  constructor(io) {
    this.io = io;
    this.activeGames = {};
  }

  callback() {

  }

  createGame(req, res) {
    const gameCode = req.body.gameCode;
    this.activeGames[gameCode] = new Game(this.io, gameCode, this.callback);
    res.statusCode = 200;
    res.sendStatus(200);
  }

  sendToGame(req, res, nextHandler) {
    console.log("sending to " + req.params.gameCode);
    if (this.activeGames.hasOwnProperty(req.params.gameCode)) {
      return nextHandler(req, res);
    } else {
      res.redirect(404, '/');
    }
  }
}

module.exports = GameManager;
