interface ActionQueue {
  payQueue: {
    partyIndex: number,
    amount: number
  }[];
  adQueue?: number[];
  smearQueue?: number[];
  bribeQueue?: number[];
  hitQueue?: number[];
  voteQueue?: number[];
  flipQueue?: number[];
  pmChoice?: boolean;
}

// @ts-ignore
class Viewer {
  pov: number;
  callback: any;
  socket: any;
  actionQueue: ActionQueue;
  
  constructor(socket: any, callback: any) {
    this.socket = socket;
    this.callback = callback;

    this.socket.on('join',
        (partyInfo) => this.callback(this, 'join', partyInfo));
    this.socket.on('disconnect', () => this.callback(this, 'disconnect'));
  }

  join(pov: number): void {
    this.pov = pov;
    this.socket.on('ready', (readyInfo) => this.ready.bind(this)(readyInfo));
    this.socket.on('msg', (msg) => this.callback(this, 'msg', msg));

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
  }

  begin(): void {
    if (this.pov === undefined) {
      this.socket.on('replace',
          (target) => this.callback(this, 'replace', target));
    }
  }

  end(): void {
    this.socket.removeAllListeners('msg');
  }

  ready(readyInfo: boolean | ActionQueue): void {
    if (readyInfo === false || readyInfo === true) {
      this.callback(this, 'ready', readyInfo);
    } else {
      this.actionQueue = readyInfo;
      this.callback(this, 'ready', true);
    }
  }

  reset(): void {
    delete this.pov;

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
    this.socket.removeAllListeners('ready');
    this.socket.removeAllListeners('msg');

    this.socket.on('join',
        (partyInfo) => this.callback(this, 'join', partyInfo));
  }

  emitGameState(gs): void {
    const hiddenInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(hiddenInfo);
  }
}

module.exports = {
  Viewer: Viewer
}
