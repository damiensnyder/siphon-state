class Viewer {
  constructor(socket, viewerIndex, callback) {
    this.socket = socket;
    this.callback = callback;
    this.actionHandlersActive = false;
    this.midgame = false;
    this.viewerIndex = viewerIndex;
    this.pov = -1; // point of view: -1 for spectator, player index for player

    this.socket.on('join', (partyInfo) =>
                   this.callback(this, 'join', partyInfo));
    this.socket.on('replace', (target) =>
                   this.callback(this, 'replace', target));
    this.socket.on('disconnect', () =>
                   this.callback(this, 'disconnect'));
  }

  join(pov, name) {
    this.pov = pov;
    this.name = name;
    this.socket.on('ready', (isReady) => {
      if (isReady) {
        this.removeActionListeners();
      } else {
        this.createActionListeners();
      }
      this.callback(this, 'ready', isReady);
    });
    this.socket.on('msg', (msg) => this.callback(this, 'msg', msg));

    this.socket.removeAllListeners('join');
    this.socket.removeAllListeners('replace');
  }

  begin() {
    this.midgame = true;
    this.createActionListeners();
    this.resetActionQueues();
  }

  end() {
    this.midgame = false;
    this.removeActionListeners();
    this.deleteActionQueues();
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
    this.socket.on('replace', (data) =>
                   this.callback(this, 'replace', data));

    this.deleteActionQueues();
  }

  emitGameState(gs) {
    const hiddenInfo = gs.setPov(this.pov);
    this.socket.emit('update', gs);
    gs.unsetPov(hiddenInfo);
  }

  createActionListeners() {
    if (!this.actionHandlersActive && this.midgame) {
      this.socket.on('flip', (pol) => this.flipQueue.push(pol));
      this.socket.on('pay', (party) => this.payQueue.push(party));
      this.socket.on('buy', () => { this.buyCounter++ });
      this.socket.on('run', (pol) => this.runQueue.push(pol));
      this.socket.on('fund', (pol) => this.fundQueue.push(pol));
      this.socket.on('vote', (pol) => this.voteQueue.push(pol));

      this.socket.on('unflip', (pol) => {
        this.flipQueue.splice(this.flipQueue.indexOf(pol), 1);
      });
      this.socket.on('unpay', (party) => {
        this.payQueue.splice(this.payQueue.indexOf(party), 1);
      });
      this.socket.on('unbuy', () => { this.buyCounter-- });
      this.socket.on('unrun', (pol) => {
        this.runQueue.splice(this.runQueue.indexOf(pol), 1);
      });
      this.socket.on('unfund', (pol) => {
        this.fundQueue.splice(this.fundQueue.indexOf(pol), 1);
      });
      this.socket.on('unvote', (pol) => {
        this.voteQueue.splice(this.voteQueue.indexOf(pol), 1);
      });

      this.actionHandlersActive = true;
    }
  }

  removeActionListeners() {
    this.socket.removeAllListeners('flip');
    this.socket.removeAllListeners('pay');
    this.socket.removeAllListeners('buy');
    this.socket.removeAllListeners('run');
    this.socket.removeAllListeners('fund');
    this.socket.removeAllListeners('vote');

    this.socket.removeAllListeners('unflip');
    this.socket.removeAllListeners('unpay');
    this.socket.removeAllListeners('unbuy');
    this.socket.removeAllListeners('unrun');
    this.socket.removeAllListeners('unfund');
    this.socket.removeAllListeners('unvote');

    this.actionHandlersActive = false;
  }

  resetActionQueues() {
    this.flipQueue = [];
    this.payQueue = [];
    this.buyCounter = 0;
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
