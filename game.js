const _ = require('lodash');

const politicianNames = [
  "Olive Bass",
  "Amber Melendez",
  "Iyla Conrad",
  "Maleeha Hughes",
  "Pixie Mackenzie",
  "Hareem Worthington",
  "Eliott Kirby",
  "Davey Hogan",
  "Yahya Schaefer",
  "Annaliese Webber",
  "Milana Flowers",
  "Bonita Houston",
  "Hywel Swift",
  "Kynan Skinner",
  "Adela Britton",
  "Sebastien Morrow",
  "Irving Weaver",
  "Johnathon Tait",
  "Willow Rooney",
  "Sahra Huffman",
  "Marlon Howe",
  "Karter Richard",
  "Jimmy Floyd",
  "Eliza Akhtar",
  "Jai Leal",
  "Harriett Cervantes",
  "Sianna Reyes",
  "Rueben Finley",
  "Zion Kemp",
  "Sachin Hirst",
  "Zahid Vaughan",
  "Finn Cole",
  "Dominika Gonzalez",
  "Henley Colon",
  "Lainey Hollis",
  "Isla-Grace Madden",
  "Samera Stephenson",
  "Ayoub Stanley",
  "Esmay Ramirez",
  "Joy Wormald",
  "Veronika Calderon",
  "Jolyon Stafford",
  "Kaif Owens",
  "Skye Norton",
  "Shauna Greaves",
  "Charmaine Phan",
  "Sky Watt",
  "Heath Osborn",
  "Conrad Cortez",
  "Valentino Pena",
  "Tayla Carlson",
  "Beatriz Richardson",
  "Ashlyn English",
  "Arla Baker",
  "Yusha Bailey",
  "Anastasia Elliott",
  "Marjorie Williamson",
  "Tom Esparza",
  "Reid Buckley",
  "Shannon Morse"
];
const playerNames = ["idiot 1", "johson", "Bkjbkjbkj", "0"];
const provinceNames = ["Jermany 4", "Kanzas", "wilfred", "NO NO NO", "ian"];

class Game {
  constructor(io, gameCode) {
    this.io = io;
    this.gameCode = gameCode;

    this.viewers = [];
    this.players = [];

    this.politicians = politicianNames.map(name => new Politician(name));
    this.provinces = provinceNames.map(name => new Province(name));

    this.activeProvince = 0;
    this.activePlayer = 0;
    this.started = false;
    this.ended = false;
    this.sympOrder = undefined;
    this.numPlayers = 0;

    this.io.on('connect', (socket) => {
      this.addViewerHandlers(socket);
    });
  }

  addViewerHandlers(socket) {
    this.viewers.push(socket);
    
    this.sendGameState(socket, -1);
    socket.emit('msg', {
      sender: 'Game',
      text: "Connected to chat.",
      isSelf: false,
      isSystem: true
    });
    socket.on('join', (data) => {
      const player = new Player(data.name, data.abbr, socket,
                                this.players.length, this.handleAction,
                                this.handleMsg);
      this.players.push(player);
      socket.removeAllListeners('join');
    });
  }

  begin() {
    // assign each player an equal amount of politicians
    shuffle(this.politicians);
    for (var i = 0; i < politicianNames.length; i++) {
      this.players[i % numPlayers].politicians.push(this.politicians[i]);
      this.politicians[i].player = this.players[i % numPlayers];
    }

    // assign each player one random symp and their player index
    this.sympOrder = shuffle(this.politicians.slice());
    for (var i = 0; i < numPlayers; i++) {
      this.giveSymp(i);
    }
  }

  giveSymp(playerIndex) {
    this.players[playerIndex].symps.push(this.politicians[0]);
    this.politicians[0].sympTo = this.players[playerIndex];
    this.politicians.splice(0, 1);
  }

  sendGameState(socket, pov) {
    var gs = _.cloneDeep(this);

    // send which player the client is, if they are a player
    if (pov >= 0) {
      gs.self = gs.players[pov];
      gs.selfIndex = pov;
    }

    // remove knowledge of other players' symps
    for (var i = 0; i < gs.numPlayers; i++) {
      if (i !== pov) {
        delete gs.players[i].symps;
      }
    }
    for (var i = 0; i < gs.politicians.length; i++) {
      gs.politicians[i].isSymp = gs.politicians[i].sympTo === pov;
      delete gs.politicians[i].sympTo;
    }
    delete gs.sympOrder;

    // remove socket.io information
    delete gs.viewers;
    delete gs.io;
    for (var i = 0; i < gs.numPlayers; i++) {
      delete gs.players[i].socket;
    }

    socket.emit('update', gs);
  }

  handleAction(action, player) {

  }

  handleMsg(msg, player) {
    if (typeof(msg) == 'string' && msg.trim().length > 0) {
      player.socket.broadcast.emit('msg', {
        sender: player.name,
        text: msg.trim(),
        isSelf: false,
        isSystem: false
      });
    }
  }
}

class Politician {
  constructor(name) {
    this.name = name;

    this.isAvailable = true;
    this.usedThisTurn = false;
    this.position = null;
    this.player = null;
    this.province = null;
    this.sympTo = null;
  }
}

class Player {
  constructor(name, abbr, socket, index, actionHandler, msgHandler) {
    this.name = name;
    this.abbr = abbr;
    this.index = index;

    this.isTurn = false;
    this.money = 10;
    this.politicians = [];
    this.symps = [];

    this.socket = socket;
    this.socket.broadcast.emit('msg', {
      sender: 'Game',
      text: `Player '${this.name}' (${this.abbr}) has joined the chat`,
      isSelf: false,
      isSystem: true
    });
    this.socket.on('action', (action) => actionHandler(action, this));
    this.socket.on('msg', (msg) => msgHandler(msg, this));
  }
}

class Province {
  constructor(name) {
    this.name = name;

    this.isStarted = false;
    this.isActive = false;
    this.stage = 0;

    this.governor = [];
    this.officials = [];
    this.candidates = [];
    this.dropouts = [];
  }
}

function generateGameState(gameObj, pov) {
  var game = _.cloneDeep(gameObj);

  // send which player the client is, if they are a player
  if (pov >= 0) {
    game.self = game.players[pov];
    game.selfIndex = pov;
  }

  // remove knowledge of other players' symps
  for (var i = 0; i < game.numPlayers; i++) {
    if (i !== pov) {
      delete game.players[i].symps;
    }
  }
  for (var i = 0; i < game.politicians.length; i++) {
    game.politicians[i].isSymp = game.politicians[i].sympTo === pov;
    delete game.politicians[i].sympTo;
  }
  delete game.sympOrder;

  // remove socket.io information
  delete game.viewers;
  delete game.io;
  for (var i = 0; i < game.numPlayers; i++) {
    delete game.players[i].socket;
  }

  return game;
}

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = Game;
