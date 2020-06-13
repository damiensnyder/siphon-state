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
    this.gs = new GameState();

    this.viewers = [];
    this.players = [];

    this.io.on('connect', (socket) => this.handleConnect(socket));

    this.handleJoin = this.handleJoin.bind(this);
    this.handleMsg = this.handleMsg.bind(this);
    this.handleAction = this.handleAction.bind(this);
  }

  handleConnect(socket) {
    const newViewer = new Viewer(socket, this.viewers.length, this.handleJoin,
                                 this.handleMsg, this.handleAction);
    this.viewers.push(newViewer);
    socket.emit('msg', {
      sender: 'Game',
      text: "Connected to chat.",
      isSelf: false,
      isSystem: true
    });
    newViewer.emitGameState(this.gs);
  }

  handleJoin(viewer, name, abbr) {
    viewer.pov = this.players.length;
    this.players.push(viewer);
    this.gs.players.push({
      name: name,
      abbr: abbr
    });

    viewer.socket.broadcast.emit('msg', {
      sender: 'Game',
      text: `Player '${name}' (${abbr}) has joined the chat`,
      isSelf: false,
      isSystem: true
    });
    this.emitGameStateToAll();
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

  emitGameStateToAll() {
    for (let i = 0; i < this.viewers.length; i++) {
      this.viewers[i].emitGameState(this.gs);
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
    this.name = undefined;
    this.pov = -1; // point of view: -1 for spectator, player index for player

    this.socket.on('join', (data) => this.handleJoin(data));
  }

  handleJoin(data) {
    this.joinHandler(this, data.name, data.abbr);
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

  emitGameState(gs) {
    const sympInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(sympInfo);
  }
}

class GameState {
  constructor() {
    this.started = false;
    this.ended = false;
    this.pov = -1;

    this.players = [];

    this.politicians = POLITICIAN_NAMES.slice();
    shuffle(this.politicians);
    this.sympOrder = this.politicians.slice();
    shuffle(this.sympOrder);
    const provinceNames = PROVINCE_NAMES.slice();
    shuffle(provinceNames);
    this.provinces = provinceNames.map((name) => { return {
      name: name,
      isActive: false
    }});
  }

  // Censor secret info so the gamestate can be sent to the client, and return
  // it so it can be retrieved later.
  setPov(pov) {
    this.pov = pov;
    const symps = [];

    for (let i = 0; i < this.players.length; i++) {
      symps.push(this.players[i].symps);
      if (i !== pov) {
        this.players[i].symps = undefined;
      }
    }

    const sympOrder = this.sympOrder;
    this.sympOrder = undefined;

    return {
      symps: symps,
      sympOrder: sympOrder
    }
  }

  // Uncensor stored secret info.
  unsetPov(sympInfo) {
    this.pov = -1;

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].symps = sympInfo.symps[i];
    }

    this.sympOrder = sympInfo.sympOrder;
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
