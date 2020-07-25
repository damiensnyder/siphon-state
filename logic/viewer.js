class Viewer {
  constructor(socket, viewerIndex, callback) {
    this.socket = socket;
    this.callback = callback;
    this.viewerIndex = viewerIndex;
    this.pov = -1;  // point of view: -1 for spectator, player index for player

    this.socket.on('join',
        (partyInfo) => this.callback(this, 'join', partyInfo));
    this.socket.on('disconnect', () => this.callback(this, 'disconnect'));
  }

  join(pov, name) {
    this.pov = pov;
    this.name = name;
    this.socket.on('ready', (readyInfo) => this.ready.bind(this)(readyInfo));
    this.socket.on('msg', (msg) => this.callback(this, 'msg', msg));

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
  }

  begin() {
    if (this.pov < 0) {
      this.socket.on('replace',
          (target) => this.callback(this, 'replace', target));
    }
  }

  end() {
    this.socket.removeAllListeners('msg');
    this.socket.removeAllListeners('replace');
  }

  ready(readyInfo) {
    if (readyInfo === false || readyInfo === true) {
      this.callback(this, 'ready', readyInfo);
    } else {
      this.actionQueue = readyInfo;
      this.callback(this, 'ready', true);
    }
  }

  reset() {
    delete this.name;
    this.pov = -1;

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
    this.socket.removeAllListeners('ready');
    this.socket.removeAllListeners('msg');

    this.socket.on('join',
        (partyInfo) => this.callback(this, 'join', partyInfo));
  }

  emitGameState(gs) {
    const hiddenInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(hiddenInfo);
  }
}

module.exports = Viewer;
