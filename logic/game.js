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

  handleJoin(viewer, partyInfo) {
    viewer.join(this.players.length, partyInfo.name);
    this.players.push(viewer);
    this.gs.addParty(partyInfo.name, partyInfo.abbr);

    this.broadcastSystemMsg(
      viewer.socket,
      `Player '${partyInfo.name}' (${partyInfo.abbr}) has joined the game.`
    );
    this.emitGameStateToAll();
  }

  handleReplace(viewer, target) {
    if (this.gs.started && !this.gs.parties[target].connected) {
      viewer.join(target, this.gs.parties[target].name);
      viewer.begin();
      this.players.splice(target, 0, viewer);
      this.gs.parties[target].connected = true;

      this.broadcastSystemMsg(
        viewer.socket,
        `Player '${viewer.name}' has been replaced.`
      );
    }
    this.emitGameStateToAll();
  }

  handleReady(viewer, isReady) {
    this.gs.parties[viewer.pov].ready = isReady;
    if (this.gs.allReady()) {
      if (this.gs.ended) {
        this.restart();
      } else if (!this.gs.started) {
        for (let i = 0; i < this.players.length; i++) {
          this.players[i].begin();
        }
        this.gs.commitAll();
      } else {
        this.enqueueAllActions();
        this.gs.commitAll();
      }
      this.emitGameStateToAll();
    }
  }

  handleMsg(viewer, msg) {
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

  enqueueAllActions() {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players[i].flipQueue.length; j++) {
        this.gs.enqueueFlip(i, this.players[i].flipQueue[j]);
      }
      for (let j = 0; j < this.players[i].payQueue.length; j++) {
        this.gs.enqueuePay(i, this.players[i].payQueue[j]);
      }
      for (let j = 0; j < this.players[i].buyCounter; j++) {
        this.gs.enqueueBuy(i);
      }
      for (let j = 0; j < this.players[i].runQueue.length; j++) {
        this.gs.enqueueRun(i, this.players[i].runQueue[j]);
      }
      for (let j = 0; j < this.players[i].fundQueue.length; j++) {
        this.gs.enqueueFund(i, this.players[i].fundQueue[j]);
      }
      for (let j = 0; j < this.players[i].voteQueue.length; j++) {
        this.gs.enqueueVote(i, this.players[i].voteQueue[j]);
      }

      this.players[i].createActionListeners();
      this.players[i].resetActionQueues();
    }
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
  handleDisconnect(viewer) {
    let index = this.viewers.indexOf(viewer);
    this.viewers.splice(index, 1);
    for (let i = index; i < this.viewers.length; i++) {
      this.viewers[index].viewerIndex = index;
    }

    if (viewer.pov >= 0) {
      this.gs.parties[viewer.pov].ready = false;
      this.removePlayer(viewer.pov);
    }
  }

  // If the game hasn't started, remove the player with the given POV from the
  // game.
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
