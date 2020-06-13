const _ = require('lodash');

const POLITICIAN_NAMES = [
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
const PLAYER_NAMES = ["idiot 1", "johson", "Bkjbkjbkj", "0"];
const PROVINCE_NAMES = ["Jermany 4", "Kanzas", "wilfred", "NO NO NO", "ian"];

class GameManager {
  constructor(io, gameCode) {
    this.io = io;
    this.gs = new GameState(gameCode);

    this.viewers = [];
    this.players = [];

    this.io.on('connect', (socket) => this.handleConnect(socket));

    this.handleJoin = this.handleJoin.bind(this);
    this.handleMsg = this.handleMsg.bind(this);
    this.handleAction = this.handleAction.bind(this);
  }

  handleConnect(socket) {
    this.viewers.push(new Viewer(socket, this.viewers.length, this.handleJoin,
                                 this.handleMsg, this.handleAction));
    socket.emit('msg', {
      sender: 'Game',
      text: "Connected to chat.",
      isSelf: false,
      isSystem: true
    });
  }

  handleJoin(index, name, abbr) {
    const playerIndex = this.players.length;
    this.players.push(this.viewers[index]);

    this.viewers[index].socket.broadcast.emit('msg', {
      sender: 'Game',
      text: `Player '${name}' (${abbr}) has joined the chat`,
      isSelf: false,
      isSystem: true
    });

    return playerIndex;
  }

  handleMsg(msg, viewer) {
    if (typeof(msg) == 'string' &&
        msg.trim().length > 0 &&
        viewer.pov >= 0) {
      viewer.socket.broadcast.emit('msg', {
        sender: viewer.name,
        text: msg.trim(),
        isSelf: false,
        isSystem: false
      });
    }
  }

  handleAction(action, viewer) {

  }

  sendGameStateToAll() {
    for (let i = 0; i < this.viewers.length; i++) {
      const viewer = this.viewers[i];
      const gs = this.gs;
      this.gs.setToPov(viewer.pov);
      viewer.sendGameState(this.gs);
      this.gs = gs;
    }
  }
}

class Viewer {
  constructor(socket, viewerIndex, joinHandler, msgHandler, actionHandler) {
    this.socket = socket;
    this.joinHandler = joinHandler;
    this.actionHandler = actionHandler;
    this.msgHandler = msgHandler

    this.viewerIndex = viewerIndex;
    this.name = null;
    this.pov = -1; // point of view: -1 for spectator, player index for player

    this.socket.on('join', (data) => this.handleJoin(data));
  }

  handleJoin(data) {
    this.pov = this.joinHandler(this.viewerIndex, data.name, data.abbr);
    this.name = data.name;

    // Set up handlers for actions and messages, and remove the join handler.
    this.socket.on('action', (action) => this.handleAction(action));
    this.socket.on('msg', (msg) => this.handleMsg(msg));
    this.socket.removeAllListeners('join');
  }

  handleMsg(msg) {
    this.msgHandler(msg, this);
  }

  handleAction(action) {
    this.actionHandler(action, this);
  }

  sendGameState(gs) {
    this.socket.emit('update', gs);
  }
}

class GameState {
  constructor(gameCode) {
    this.gameCode = gameCode;

    this.started = false;
    this.ended = false;
    this.pov = null;

    this.provinces = PROVINCE_NAMES.slice();
    shuffle(this.provinces);
  }

  setToPov(pov) {
    this.pov = pov;
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = GameManager;
