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
    this.socket.on('pass', (data) =>
                   this.actionHandler(this, 'pass', data));
    this.socket.on('pay', (data) =>
                   this.actionHandler(this, 'pay', data));
    this.socket.on('buy', (data) =>
                   this.actionHandler(this, 'buy', data));
    this.socket.on('flip', (data) =>
                   this.actionHandler(this, 'flip', data));
    this.socket.on('run', (data) =>
                   this.actionHandler(this, 'run', data));
    this.socket.on('fund', (data) =>
                   this.actionHandler(this, 'fund', data));
    this.socket.on('vote', (data) =>
                   this.actionHandler(this, 'vote', data));

    this.socket.removeAllListeners('ready');
  }

  emitGameState(gs) {
    const hiddenInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(hiddenInfo);
  }
}

module.exports = Viewer;
