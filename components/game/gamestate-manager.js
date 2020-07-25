class GamestateManager {
  constructor() {
    this.gs = {
      parties: [],
      pov: -1,
      started: false,
      ended: false
    };
    this.actionQueue = [{
      'flip': [],
      'pay': [],
      'run': [],
      'ad': [],
      'smear': [],
      'bribe': [],
      'vote': []
    }];

    this.handlers = {
      'connection': this.handleConnect.bind(this),
      'join': this.handleJoin.bind(this),
      'replace': this.handleReplace.bind(this),
      'ready': this.handleReady.bind(this),
      'disconnect': this.handleDisconnect.bind(this),
      'flip': this.handleFlip.bind(this),
      'pay': this.handlePay.bind(this),,
      'run': this.handleRun.bind(this)
      'ad': this.handleAd.bind(this),
      'smear': this.handleSmear.bind(this),
      'bribe': this.handleBribe.bind(this),
      'vote': this.handleVote.bind(this),
      'newreplace': this.handleNewReplace.bind(this),
      'newready': this.handleNewReady.bind(this),
      'newdisconnect': this.handleNewDisconnect.bind(this)
    }
  }

  setGs(gs) {
    this.gs = gs;
    this.actionQueue = [];
  }

  updateAfter(type, actionInfo) {
    this.handlers[type](actionInfo);
  }

  handleConnect() {

  }

  handleJoin() {

  }

  handleReplace() {

  }

  handleReady() {

  }

  handleDisconnect() {

  }

  handleFlip() {

  }

  handlePay() {

  }

  handleRun() {

  }

  handleAd() {

  }

  handleSmear() {

  }

  handleBribe() {

  }

  handleVote() {

  }

  handleNewReplace() {

  }

  handleNewReady() {

  }

  handleNewDisconnect() {

  }
}

export default GamestateManager;
