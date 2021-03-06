// @ts-ignore
const GameRoom = require('./game-room');

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

interface Settings {
  name: string,
  gameCode: string,
  private: boolean,
  nation: string
}

// @ts-ignore
class RoomManager {
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

  // Create a game and send the game code along with status 200.
  createGame(req, res) {
    const gameCode: string = this.generateGameCode()
    const settings: Settings = req.body.settings;
    settings.gameCode = gameCode;

    if (settings.name.length === 0) {
      settings.name = "My Game";
    }

    this.activeGames[gameCode] = new GameRoom(this.io,
        settings,
        this.callback.bind(this));
    res.status = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({gameCode: gameCode}));
  }
  
  addTestGame(gameRoom) {
    this.activeGames[gameRoom.settings.gameCode] = gameRoom;
  }

  generateGameCode() {
   const numChars: number = ALPHABET.length;
   const gameCodeLength: number = Math.ceil(
     Math.log(Object.keys(this.activeGames).length + 2) / Math.log(26)) + 1;

   let gameCode: string = "";
   while (gameCode == "" || this.activeGames.hasOwnProperty(gameCode)) {
     gameCode = "";
     for (let i = 0; i < gameCodeLength; i++) {
       gameCode += ALPHABET.charAt(Math.floor(Math.random() * numChars));
     }
   }
   return gameCode;
  }

  getActiveGames(req, res): void {
    let foundGames: any[] = [];

    for (const [gameCode, game] of Object.entries(this.activeGames)) {
      // @ts-ignore
      if (!game.settings.private) {
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
  GameManager: RoomManager
}
