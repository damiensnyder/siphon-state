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
      'unflip': this.handleUndoFlip,
      'unpay': this.handleUndoPay,
      'unrun': this.handleUndoRun,
      'unad': this.handleUndoAd,
      'unsmear': this.handleUndoSmear,
      'unbribe': this.handleUndoBribe,
      'unvote': this.handleUndoVote,
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
    } else if (!this.gs.started || this.gs.ended) {
      return true;
    } else {
      return this.actionQueue;
    }
  }

  handleConnect() {

  }

  handleJoin() {

  }

  handleReplace(target) {
    this.gs.parties[target].connected = true;
    this.gs.pov = target;
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

  handleRun(targetIndex) {
    const targetPol = this.gs.parties[this.gs.pov].candidates[targetIndex];
    this.gs.provs[this.gs.activeProvId].candidates.push(targetPol);
    this.actionQueue.runQueue.push(targetPol);
  }

  handleAd() {

  }

  handleSmear() {

  }

  handleBribe() {

  }

  handleVote() {

  }

  handleUndoFlip() {

  }

  handleUndoPay() {

  }

  handleUndoRun() {

  }

  handleUndoAd() {

  }

  handleUndoSmear() {

  }

  handleUndoBribe() {

  }

  handleUndoVote() {

  }

  handleNewReplace(party) {
    this.gs.parties[party].connected = true;
  }

  handleNewReady(readyInfo) {
    this.gs.parties[readyInfo.party].connected = readyInfo.isReady;
  }

  handleNewDisconnect(party) {
    this.gs.parties[party].connected = false;
  }
}

export default GamestateManager;
