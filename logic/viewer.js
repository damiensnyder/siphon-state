class Viewer {
  constructor(socket, viewerIndex, callback) {
    this.socket = socket;
    this.callback = callback;
    this.viewerIndex = viewerIndex;
    this.pov = -1;  // point of view: -1 for spectator, player index for player

    this.socket.on('join', (partyInfo) =>
                   this.callback(this, 'join', partyInfo));
    this.socket.on('replace', (target) =>
                   this.callback(this, 'replace', target));
    this.socket.on('disconnect', () => this.callback(this, 'disconnect'));
  }

  join(pov, name) {
    this.pov = pov;
    this.name = name;
    this.socket.on('ready', (isReady) => this.callback(this, 'ready', isReady));
    this.socket.on('msg', (msg) => this.callback(this, 'msg', msg));

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
  }

  begin() {
    this.socket.on('flip', (sympIndex) => this.flipQueue.push(sympIndex));
    this.socket.on('pay', (paymentInfo) => this.payQueue.push(paymentInfo));
  }

  end() {
    this.socket.removeAllListeners('ad');
    this.socket.removeAllListeners('smear');
  }

  reset() {
    delete this.name;
    this.pov = -1;

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
    this.socket.removeAllListeners('ready');
    this.socket.removeAllListeners('msg');

    this.socket.on('join', (partyInfo) =>
        this.callback(this, 'join', partyInfo));
    this.socket.on('replace', (data) => this.callback(this, 'replace', data));
  }

  emitGameState(gs) {
    const hiddenInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(hiddenInfo);
  }

  resetActionQueues(stage) {
    if (stage == 0) {
      this.flipQueue = [];
      this.payQueue = [];
      this.runQueue = [];
      this.socket.on('run', (polIndex) => this.runQueue.push(polIndex));
    } else if (stage == 1) {
      this.flipQueue = [];
      this.payQueue = [];
      this.bribe = false;
      this.adQueue = [];
      this.smearQueue = [];
      this.socket.on('bribe', (doBribe) => {this.bribe = doBribe});
      this.socket.on('ad', (polIndex) => this.adQueue.push(polIndex));
      this.socket.on('smear', (polIndex) => this.smearQueue.push(polIndex));
      this.socket.removeAllListeners('run');
    } else if (stage == 2) {
      this.flipQueue = [];
      this.payQueue = [];
      this.voteQueue = [];
      this.socket.on('vote', (polIndex) => this.voteQueue.push(polIndex));
      this.socket.removeAllListeners('bribe');
      this.socket.removeAllListeners('ad');
      this.socket.removeAllListeners('smear');
    } else {
      this.flipQueue = [];
      this.payQueue = [];
      this.socket.removeAllListeners('vote');
    }
  }
}

module.exports = Viewer;
