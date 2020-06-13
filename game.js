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

    this.io.on('connection', (socket) => {
      const viewer = new Viewer(socket,
                                this.viewers.length,
                                this.enqueueAction);
      this.enqueueAction(viewer, 'connect', null);
    });

    this.actionQueue = [];
    this.handlingAction = false;

    this.enqueueAction = this.enqueueAction.bind(this);
  }

  // Sends actions to a queue that can be handled one at a time so they don't
  // interfere with each other.
  enqueueAction(viewer, type, data) {
    this.actionQueue.push({
      viewer: viewer,
      type: type,
      data: data
    });

    if (!this.handlingAction) {
      this.handlingAction = true;
      this.handleAction();
    }
  }

  // Handle the first action in the queue. If there are no more actions in the
  // queue, show that it is done. Otherwise, handle the next action.
  handleAction() {
    const action = this.actionQueue[0];
    if (action.type == 'connect') {
      this.handleConnect(action.viewer);
    } else if (action.type == 'join') {
      this.handleJoin(action.viewer, action.data);
    } else if (action.type == 'msg') {
      this.handleMsg(action.viewer, action.data);
    } else if (action.type == 'disconnect') {
      this.handleDisconnect(action.viewer);
    }

    this.actionQueue.splice(0, 1);
    if (this.actionQueue.length > 0) {
      this.handleAction();
    } else {
      this.handlingAction = false;
    }
  }

  handleConnect(viewer) {
    this.viewers.push(viewer);
    viewer.socket.emit('msg', {
      sender: 'Game',
      text: "Connected to chat.",
      isSelf: false,
      isSystem: true
    });
    viewer.emitGameState(this.gs);
  }

  handleJoin(viewer, data) {
    viewer.join(this.players.length, data.name);
    this.players.push(viewer);
    this.gs.players.push({
      name: data.name,
      abbr: data.abbr
    });

    this.broadcastSystemMsg(
      viewer.socket,
      `Player '${data.name}' (${data.abbr}) has joined the game.`
    );
    this.emitGameStateToAll();
  }

  handleMsg(viewer, data) {
    const msg = data.msg;
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

  // When a player disconnects, remove them from the list of viewers, fix the
  // viewer indices of all other viewers, and remove them from the game.
  handleDisconnect(viewer) {
    let index = this.viewers.indexOf(viewer);
    this.viewers.splice(index, 1);
    for (let i = index; i < this.viewers.length; i++) {
      this.viewers[index].viewerIndex = index;
    }

    if (viewer.pov >= 0) {
      this.removePlayer(viewer.pov);
    }
  }

  // If the game hasn't started, remove the player with the given POV from the
  // game.
  // TODO: If the game has started, replace them with a bot.
  removePlayer(pov) {
    const name = this.gs.players[pov].name;
    this.players.splice(pov, 1);
    if (!this.gs.started) {
      this.gs.players.splice(pov, 1);

      for (let i = pov; i < this.players.length; i++) {
        this.players[i].pov = i;
      }
    }

    this.emitGameStateToAll();
    this.emitSystemMsg(`Player '${name}' has disconnected.`);
  }

  // Broadcast a system message to all sockets except the one passed in.
  broadcastSystemMsg(socket, msg) {
    socket.broadcast.emit('msg', {
      sender: 'Game',
      text: msg,
      isSelf: false,
      isSystem: true
    });
  }

  // Send a system message to all sockets.
  emitSystemMsg(msg) {
    this.io.emit('msg', {
      sender: 'Game',
      text: msg,
      isSelf: false,
      isSystem: true
    });
  }

  // Emit the current game state to all viewers.
  emitGameStateToAll() {
    for (let i = 0; i < this.viewers.length; i++) {
      this.viewers[i].emitGameState(this.gs);
    }
  }
}

class Viewer {
  constructor(socket, viewerIndex, actionHandler) {
    this.socket = socket;
    this.actionHandler = actionHandler;

    this.viewerIndex = viewerIndex;
    this.name = undefined;
    this.pov = -1; // point of view: -1 for spectator, player index for player

    this.socket.on('join', (data) =>
                   this.actionHandler(this, 'join', data));
    this.socket.on('disconnect', () =>
                   this.actionHandler(this, 'disconnect', null));
  }

  join(pov, name) {
    this.pov = pov;
    this.name = name;
    this.socket.on('msg', (msg) =>
                   this.actionHandler(this, 'msg', { msg: msg }));

    // Set up handlers for actions and messages, and remove the join handler.
    this.socket.removeAllListeners('join');
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
