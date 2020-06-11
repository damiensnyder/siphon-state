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
const playerNames = ["idiot 1", "johson", "bkjbkjbkj", "0"];
const provinceNames = ["Jermany 4", "Kanzas", "wilfred", "NO NO NO", "ian"];

class Game {
  constructor(io, gameCode) {
    this.io = io;
    this.gameCode = gameCode;

    this.politicians = politicianNames.map(name => new Politician(name));
    this.players = playerNames.map(
      name => new Player(name, null, this.handleAction, this.handleMsg)
    );
    this.provinces = provinceNames.map(name => new Province(name));

    var numPlayers = this.players.length;

    // assign each player an equal amount of politicians
    for (var i = 0; i < politicianNames.length; i++) {
      this.players[i % numPlayers].politicians.push(this.politicians[i]);
      this.politicians[i].player = this.players[i % numPlayers];
    }

    this.ympIndex = 0;

    while (sympIndex < numPlayers) {
      this.players[(i + 1) % numPlayers].symps.push(this.politicians[i]);
      this.politicians[i].sympTo = this.players[(i + 1) % numPlayers];
      sympIndex++;
    }

    this.activeProvince = 0;
    this.activePlayer = 0;
    this.started = false;
    this.ended = false;
  }

  handleAction(action, playerName) {

  }

  handleMsg(msg, playerName) {

  }
}

class Politician {
  constructor(name) {
    this.name = name;

    this.isAvailable = null;
    this.position = null;

    this.player = null;
    this.province = null;
    this.sympTo = null;
  }
}

class Player {
  constructor(name, socket, actionHandler, msgHandler) {
    this.name = name;

    this.isTurn = false;

    this.politicians = [];
    this.symps = [];

    this.socket = socket;
    this.socket.on('action', (action) => actionHandler(action, this.name));
    this.socket.on('msg', (msg) => msgHandler(msg, this.name));
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

class GameState {
  constructor(game, pointOfView) {

  }
}

module.exports = Game;
