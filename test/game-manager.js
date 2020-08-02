const Game = require('../logic/game-room.js');

class GameManager {
  constructor(io) {
    this.io = io;
    this.activeGames = {};
  }

  // Called by a game room when it is ready to tear down. Allows the game code
  // to be reused.
  callback(game) {
    delete this.activeGames[game.settings.gameCode];
  }

  createGame(req, res) {
    const userSettings = req.body.settings;
    const gameCode = this.generateGameCode()
    const settings = {
      name: userSettings.name,
      gameCode: gameCode,
      private: userSettings.private
    };

    // Send error code 400 if the game code is already in use or is invalid.
    // Otherwise, create a game at that game code and send status code 200.
    if (settings.name.length < 1) {
      res.status = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ errMsg: "Name must not be empty." }));
    } else {
      this.activeGames[gameCode] = new Game(this.io,
          settings,
          this.callback.bind(this));
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ gameCode: gameCode }));
    }
  }
  
  createTestGame(gameCode, gameRoom) {
    this.activeGames[gameCode] = gameRoom;
  }

  generateGameCode() {
   const chars = "abcdefghijklmnopqrstuvwxyz";
   const numChars = chars.length;
   const gameCodeLength = Math.ceil(
     Math.log(Object.keys(this.activeGames).length + 2) / Math.log(26)) + 1;

   var gameCode = "";
   while (gameCode == "" || this.activeGames.hasOwnProperty(gameCode)) {
     gameCode = "";
     for (var i = 0; i < gameCodeLength; i++) {
        gameCode += chars.charAt(Math.floor(Math.random() * numChars));
     }
   }
   return gameCode;
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
      res.redirect('/');
    }
  }
}

module.exports = GameManager;
