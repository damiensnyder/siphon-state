const GameState = require('./gamestate.js');
const Viewer = require('./viewer.js');

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
      'rematch': this.handleRematch,
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
      if (this.gs.ended) {
        this.restart();
      } else {
        for (let i = 0; i < this.players.length; i++) {
          if (!this.gs.started) {
            this.players[i].begin();
          } else {
            this.enqueueAllActions(this.players[i]);
          }
        }
      }
      this.gs.commitAll();
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

  enqueueAllActions(player) {
    for (let i = 0; i < player.flipQueue.length; i++) {
      this.gs.enqueueFlip(player.pov, player.flipQueue[i]);
    }
    for (let i = 0; i < player.payQueue.length; i++) {
      this.gs.enqueuePay(player.pov, player.payQueue[i]);
    }
    for (let i = 0; i < player.buyCounter; i++) {
      this.gs.enqueueBuy(player.pov);
    }
    for (let i = 0; i < player.runQueue.length; i++) {
      this.gs.enqueueRun(player.pov, player.runQueue[i]);
    }
    for (let i = 0; i < player.fundQueue.length; i++) {
      this.gs.enqueueFund(player.pov, player.fundQueue[i]);
    }
    for (let i = 0; i < player.voteQueue.length; i++) {
      this.gs.enqueueVote(player.pov, player.voteQueue[i]);
    }

    player.resetActionQueues();
  }

  restart() {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].reset();
    }
    this.gs = new GameState();
    this.players = [];
    this.actionQueue = [];
    this.emitGameStateToAll();
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

module.exports = GameManager;
