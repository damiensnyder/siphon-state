// @ts-ignore
const GameRoom = require('./game-room');

interface Settings {
  name: string,
  gameCode: string,
  private: boolean,
  nation: string
}

// @ts-ignore
class GameManager {
  activeGames: any;
  io: any;

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
    const gameCode: string = this.generateGameCode()
    const settings: Settings = {
      name: userSettings.name,
      gameCode: gameCode,
      private: userSettings.private,
      nation: userSettings.nation
    };

    // Send error code 400 if the game code is already in use or is invalid.
    // Otherwise, create a game at that game code and send status code 200.
    if (settings.name.length < 1) {
      res.status = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ errMsg: "Name must not be empty." }));
    } else {
      this.activeGames[gameCode] = new GameRoom(this.io,
          settings,
          this.callback.bind(this));
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ gameCode: gameCode }));
    }
  }
  
  addTestGame(gameRoom) {
    this.activeGames[gameRoom.settings.gameCode] = gameRoom;
  }

  generateGameCode() {
   const chars: string = "abcdefghijklmnopqrstuvwxyz";
   const numChars: number = chars.length;
   const gameCodeLength: number = Math.ceil(
     Math.log(Object.keys(this.activeGames).length + 2) / Math.log(26)) + 1;

   let gameCode: string = "";
   while (gameCode == "" || this.activeGames.hasOwnProperty(gameCode)) {
     gameCode = "";
     for (let i = 0; i < gameCodeLength; i++) {
        gameCode += chars.charAt(Math.floor(Math.random() * numChars));
     }
   }
   return gameCode;
  }

  getActiveGames(req, res): void {
    let foundGames: any[] = [];

    for (const [gameCode, game] of Object.entries(this.activeGames)) {
      // @ts-ignore
      if (!game.settings.hidden) {
        // @ts-ignore
        foundGames.push(game.joinInfo());
      }
    }

    res.status = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(foundGames));
  }

  sendToGame(req, res, nextHandler): void {
    if (this.activeGames.hasOwnProperty(req.params.gameCode)) {
      return nextHandler(req, res);
    } else {
      res.redirect('/');
    }
  }
}

module.exports = {
  GameManager: GameManager
}
