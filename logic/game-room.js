const GameState = require('./gamestate.js');
const Viewer = require('./viewer.js');

class GameRoom {
  constructor(io, settings, callback) {
    this.io = io.of('/game/' + settings.gameCode);
    this.settings = settings;
    this.gs = new GameState(settings);
    this.gmCallback = callback;

    this.viewers = [];
    this.players = [];

    this.io.on('connection', (socket) => {
      const viewer = new Viewer(socket,
                                this.viewers.length,
                                this.enqueueAction);
      this.enqueueAction(viewer, 'connect', null);
    });

    this.handlers = {
      'connect': this.handleConnect.bind(this),
      'join': this.handleJoin.bind(this),
      'replace': this.handleReplace.bind(this),
      'ready': this.handleReady.bind(this),
      'msg': this.handleMsg.bind(this),
      'disconnect': this.handleDisconnect.bind(this)
    }
    this.actionQueue = [];
    this.handlingAction = false;
    this.enqueueAction = this.enqueueAction.bind(this);
    this.teardownTimer = setTimeout(() => {this.gmCallback(this)}, 900000);
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

    clearTimeout(this.teardownTimer);
    this.teardownTimer = setTimeout(() => {this.gmCallback(this)}, 900000);

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
    this.io.emit('newreplace', target);
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
  }

  handleReady(viewer, isReady) {
    this.gs.parties[viewer.pov].ready = isReady;
    viewer.socket.broadcast.emit('newready', {
      party: viewer.pov,
      isReady: isReady
    });
    if (this.gs.allReady()) {
      if (this.gs.ended) {
        this.rematch();
      } else if (!this.gs.started) {
        for (let i = 0; i < this.players.length; i++) {
          this.players[i].begin();
        }
        this.gs.commitAll();
      } else {
        this.executeAllActions();
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

  executeAllActions() {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players[i].flipQueue.length; j++) {
        this.gs.flip(i, this.players[i].flipQueue[j]);
      }
      for (let j = 0; j < this.players[i].payQueue.length; j++) {
        this.gs.pay(i, this.players[i].payQueue[j]);
      }
    }

    if (this.gs.activeProv.stage == 0) {
      for (let i = 0; i < this.players.length; i++) {
        for (let j = 0; j < this.players[i].runQueue.length; j++) {
          this.gs.run(i, this.players[i].runQueue[j]);
        }
      }
    } else if (this.gs.activeProv.stage == 1) {
      for (let i = 0; i < this.players.length; i++) {
        for (let j = 0; j < this.players[i].bribeQueue.length; j++) {
          this.gs.bribe(i, this.players[i].bribeQueue[j]);
        }
        for (let j = 0; j < this.players[i].adQueue.length; j++) {
          this.gs.ad(i, this.players[i].adQueue[j]);
        }
        for (let j = 0; j < this.players[i].smearQueue.length; j++) {
          this.gs.smear(i, this.players[i].smearQueue[j]);
        }
      }
    } else if (this.gs.activeProv.stage == 2) {
      for (let i = 0; i < this.players.length; i++) {
        for (let j = 0; j < this.players[i].voteQueue.length; j++) {
          this.gs.vote(i, this.players[i].voteQueue[j]);
        }
      }
    }

    this.players[i].resetActionQueues(this.gs.activeProv.stage);
  }

  rematch() {
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
    const [removedPlayer] = this.players.splice(pov, 1);
    if (!this.gs.started) {
      this.gs.parties.splice(pov, 1);
      for (let i = pov; i < this.players.length; i++) {
        this.players[i].pov = i;
      }
      this.emitGameStateToAll();
    } else {
      this.gs.parties[pov].connected = false;
      this.io.emit('newdisconnect', pov);
    }

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

  joinInfo() {
    return {
      name: this.settings.name,
      gameCode: this.settings.gameCode,
      players: this.players.length,
      started: this.gs.started,
      ended: this.gs.ended
    };
  }
}

module.exports = GameRoom;
