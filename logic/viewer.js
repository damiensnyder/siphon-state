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
    this.socket.on('disconnect', () =>
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
    this.socket.on('flip', (data) => this.flipQueue.push(data));
    this.socket.on('pay', (data) => this.payQueue.push(data));
    this.socket.on('buy', (data) => this.buyQueue.push(data));
    this.socket.on('run', (data) => this.runQueue.push(data));
    this.socket.on('fund', (data) => this.fundQueue.push(data));
    this.socket.on('vote', (data) => this.voteQueue.push(data));
  }

  end() {
    this.socket.removeAllListeners('pay');
    this.socket.removeAllListeners('buy');
    this.socket.removeAllListeners('flip');
    this.socket.removeAllListeners('run');
    this.socket.removeAllListeners('fund');
    this.socket.removeAllListeners('vote');

    this.deleteActionQueues();
  }

  reset() {
    this.name = undefined;
    this.pov = -1;

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
    this.socket.removeAllListeners('ready');
    this.socket.removeAllListeners('msg');

    this.socket.on('join', (data) =>
                   this.actionHandler(this, 'join', data));
    this.socket.on('replace', (data) =>
                   this.actionHandler(this, 'replace', { target: data }));

    this.deleteActionQueues();
  }

  emitGameState(gs) {
    const hiddenInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(hiddenInfo);
  }

  resetActionQueues() {
    this.flipQueue = [];
    this.payQueue = [];
    this.buyQueue = [];
    this.runQueue = [];
    this.fundQueue = [];
    this.voteQueue = [];
  }

  deleteActionQueues() {
    delete this.flipQueue;
    delete this.payQueue;
    delete this.buyQueue;
    delete this.runQueue;
    delete this.fundQueue;
    delete this.voteQueue;
  }
}

module.exports = Viewer;
