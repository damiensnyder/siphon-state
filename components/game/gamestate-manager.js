class GamestateManager {
  constructor() {
    this.gs = {
      parties: [],
      pov: -1,
      started: false,
      ended: false
    };

    this.handlers = {
      'connection': this.handleConnect,
      'join': this.handleJoin,
      'replace': this.handleReplace,
      'ready': this.handleReady,
      'disconnect': this.handleDisconnect,
      'flip': this.handleFlip,
      'pay': this.handlePay,
      'run': this.handleRun,
      'ad': this.handleAd,
      'smear': this.handleSmear,
      'bribe': this.handleBribe,
      'vote': this.handleVote,
      'newreplace': this.handleNewReplace,
      'newready': this.handleNewReady,
      'newdisconnect': this.handleNewDisconnect
    }
    this.currentReady = this.currentReady.bind(this);
  }

  setGs(gs) {
    this.gs = gs;
    this.actionQueue = {
      flipQueue: [],
      payQueue: []
    }
    if (gs.provs[this.gs.activeProvId].stage == 0) {
      this.actionQueue.runQueue = [];
    } else if (gs.provs[this.gs.activeProvId].stage == 1) {
      this.actionQueue.adQueue = [];
      this.actionQueue.smearQueue = [];
      this.actionQueue.bribeQueue = [];
    } else if (gs.provs[this.gs.activeProvId].stage == 2) {
      this.actionQueue.voteQueue = [];
    }
  }

  updateAfter(type, actionInfo) {
    this.handlers[type].bind(this)(actionInfo);
  }

  currentReady() {
    if (!this.gs.parties[this.gs.pov].ready) {
      return false;
    } else if (!this.gs.started || thiis.gs.ended) {
      return true;
    } else {
      return this.actionQueue;
    }
  }

  handleConnect() {

  }

  handleJoin() {

  }

  handleReplace() {

  }

  handleReady() {
    this.gs.parties[this.gs.pov].ready = !this.gs.parties[this.gs.pov].ready;
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

  handleNewDisconnect(party) {
    this.gs.parties[party].connected = false;
  }
}

export default GamestateManager;
