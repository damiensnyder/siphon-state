const Game = require('./game-room.js');

class GameManager {
  constructor(io) {
    this.io = io;
    this.activeGames = {};
  }

  // Called by a game room when it is ready to destruct. Allows the game code
  // to be reused.
  callback(game) {
    delete this.activeGames[game.gameCode];
  }

  createGame(req, res) {
    const settings = req.body.settings;
    const gameCode = settings.gameCode;

    // Send error code 400 if the game code is already in use or is invalid.
    // Otherwise, create a game at that game code and send status code 200.
    if (this.activeGames.hasOwnProperty(gameCode)
        || typeof(gameCode) !== 'string'
        || gameCode.length < 1) {
      res.sendStatus(400);
    } else {
      this.activeGames[gameCode] = new Game(this.io, settings, this.callback);
      res.sendStatus(200);
    }
  }

  getActiveGames(req, res) {
    let foundGames = [];

    for (const [gameCode, game] of Object.entries(this.activeGames)) {
      if (!game.settings.hidden) {
        foundGames.push(game.joinInfo());
      }
    }

    res.status = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(foundGames));
  }

  sendToGame(req, res, nextHandler) {
    if (this.activeGames.hasOwnProperty(req.params.gameCode)) {
      return nextHandler(req, res);
    } else {
      res.redirect(404, '/');
    }
  }
}

module.exports = GameManager;
