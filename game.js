const POL_NAMES = [
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

    this.handlers = {
      'connect': this.handleConnect,
      'join': this.handleJoin,
      'replace': this.handleReplace,
      'ready': this.handleReady,
      'msg': this.handleMsg,
      'pay': this.handlePay,
      'buy': this.handleBuy,
      'disconnect': this.handleDisconnect
    }
    for (var type in this.handlers) {
      if (this.handlers.hasOwnProperty(type)) {
          this.handlers[type] = this.handlers[type].bind(this);
      }
    }

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
    this.handlers[action.type](action.viewer, action.data);

    this.actionQueue.splice(0, 1);
    if (this.actionQueue.length > 0) {
      this.handleAction();
    } else {
      this.handlingAction = false;
    }
  }

  handleConnect(viewer, data) {
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
    this.gs.addParty(data.name, data.abbr);

    this.broadcastSystemMsg(
      viewer.socket,
      `Player '${data.name}' (${data.abbr}) has joined the game.`
    );
    this.emitGameStateToAll();
  }

  handleReplace(viewer, data) {
    viewer.join(data.target, this.gs.parties[data.target].name);
    viewer.begin();
    this.players.splice(data.target, 0, viewer);
    this.gs.parties[data.target].connected = true;

    this.broadcastSystemMsg(
      viewer.socket,
      `Player '${viewer.name}' has been replaced.`
    );
    this.emitGameStateToAll();
  }

  handleReady(viewer, data) {
    this.gs.parties[viewer.pov].ready = data.ready;
    if (this.gs.allReady()) {
      this.gs.begin();
      this.begin();
    }
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

  handlePay(viewer, data) {
    if (this.gs.parties[viewer.pov].funds >= data.amount) {
      this.gs.pay(viewer.pov, data.p2, data.amount);
      this.emitGameStateToAll();
    }
  }

  handleBuy(viewer, data) {
    if (this.gs.parties[viewer.pov].funds >= 5) {
      this.gs.buySymp(viewer.pov);
      this.emitGameStateToAll();
    }
  }

  // When a player disconnects, remove them from the list of viewers, fix the
  // viewer indices of all other viewers, and remove them from the game.
  handleDisconnect(viewer, data) {
    let index = this.viewers.indexOf(viewer);
    this.viewers.splice(index, 1);
    for (let i = index; i < this.viewers.length; i++) {
      this.viewers[index].viewerIndex = index;
    }

    if (viewer.pov >= 0) {
      this.removePlayer(viewer.pov);
    }
  }

  begin() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].begin();
    }
  }

  // If the game hasn't started, remove the player with the given POV from the
  // game.
  // TODO: If the game has started, replace them with a bot.
  removePlayer(pov) {
    const name = this.gs.parties[pov].name;
    this.players.splice(pov, 1);
    if (!this.gs.started) {
      this.gs.parties.splice(pov, 1);

      for (let i = pov; i < this.players.length; i++) {
        this.players[i].pov = i;
      }
    } else {
      this.gs.parties[pov].connected = false;
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
    this.socket.on('replace', (data) =>
                   this.actionHandler(this, 'replace', { target: data }));
    this.socket.on('disconnect', (data) =>
                   this.actionHandler(this, 'disconnect', {}));
  }

  join(pov, name) {
    this.pov = pov;
    this.name = name;
    this.socket.on('ready', (data) =>
                   this.actionHandler(this, 'ready', { ready: data }));
    this.socket.on('msg', (data) =>
                   this.actionHandler(this, 'msg', { msg: data }));

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
  }

  begin() {
    this.socket.on('pay', (data) =>
                   this.actionHandler(this, 'pay', data));
    this.socket.on('buy', (data) =>
                   this.actionHandler(this, 'buy', {}));

    this.socket.removeAllListeners('ready');
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
    this.activeProvince = -1;
    this.priority = -1;
    this.pov = -1;
    this.turn = -1;

    this.parties = [];
    this.provinces = PROVINCE_NAMES.map((name) => { return {
      name: name,
      stage: -1,
      governors: [],
      officials: [],
      candidates: [],
      dropouts: []
    }});
    shuffle(this.provinces);
  }

  addParty(name, abbr) {
    this.parties.push({
      name: name,
      abbr: abbr,
      ready: false,
      connected: true,
      funds: 5,
      pols: [],
      symps: []
    });
  }

  allReady() {
    if (this.parties.length < 2) {
      return false;
    }

    for (let i = 0; i < this.parties.length; i++) {
      if (!this.parties[i].ready) {
        return false;
      }
    }

    return true;
  }

  begin() {
    this.pols = POL_NAMES.map((name) => { return {
      name: name,
      party: null,
      actionTaken: false,
      available: true
    }});
    this.sympOrder = this.pols.slice();
    shuffle(this.pols);
    shuffle(this.sympOrder);

    for (let i = 0; i < this.pols.length; i++) {
      this.pols[i].party = i % this.parties.length;
      this.parties[i % this.parties.length].pols.push(i);
    }

    for (let i = 0; i < this.parties.length; i++) {
      this.giveSymp(i);
    }

    this.activeProvince = 0;
    this.priority = 0;
    this.started = true;

    this.beginNoms();
  }

  buySymp(party) {
    this.parties[party].funds -= 5;
    this.giveSymp(party);
  }

  giveSymp(party) {
    var i = 0;
    while(this.sympOrder[i].party === party) {
      i++;
    }
    const polIndex = this.pols.indexOf(this.sympOrder[i]);
    this.parties[party].symps.push(polIndex);
    this.sympOrder.splice(i, 1);
  }

  beginNoms() {
    this.provinces[this.activeProvince].stage = 0;
    this.turn = this.priority;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].funds += 5;
    }
  }

  pay(p1Index, p2Index, amount) {
    this.parties[p1Index].funds -= amount;
    this.parties[p2Index].funds += amount;
  }

  // Censor secret info so the gamestate can be sent to the client, and return
  // it so it can be retrieved later.
  setPov(pov) {
    this.pov = pov;
    const symps = [];

    for (let i = 0; i < this.parties.length; i++) {
      symps.push(this.parties[i].symps);
      if (i !== pov) {
        this.parties[i].symps = [];
      }
    }

    const sympOrder = this.sympOrder;
    this.sympOrder = [];

    return {
      symps: symps,
      sympOrder: sympOrder
    }
  }

  // Uncensor stored secret info.
  unsetPov(sympInfo) {
    this.pov = -1;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].symps = sympInfo.symps[i];
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
