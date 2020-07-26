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
    // Set the gamestate to the received gamestate, and add helper variables
    // to keep track of the current province and the player's party.
    if (gs.provs != undefined) {
      gs.activeProv = gs.provs[gs.activeProvId];
    }
    if (gs.pov >= 0) {
      gs.ownParty = gs.parties[gs.pov];
    }
    this.gs = gs;

    // Reset the action queue
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

  handleRun(targetPol) {
    this.gs.activeProv.candidates.push(targetPol);
    this.actionQueue.runQueue.push(
        this.gs.ownParty.candidates.indexOf(targetPol));
  }

  handleAd() {

  }

  handleSmear() {

  }

  handleBribe() {

  }

  handleVote(targetIndex) {
    this.gs.activeProv.officials[targetIndex].votes++;
    this.gs.ownParty.votes--;
    this.actionQueue.voteQueue.push(targetIndex);
  }

  handleUndoFlip() {

  }

  handleUndoPay() {

  }

  handleUndoRun(targetPol) {
    const targetIndex = this.gs.ownParty.candidates.indexOf(targetPol);
    this.gs.activeProv.candidates.splice(
        this.gs.activeProv.candidates.indexOf(targetPol), 1);
    this.actionQueue.runQueue.splice(
        this.actionQueue.runQueue.indexOf(targetIndex), 1);
  }

  handleUndoAd() {

  }

  handleUndoSmear() {

  }

  handleUndoBribe() {

  }

  handleUndoVote(targetIndex) {
    this.gs.activeProv.officials[targetIndex].votes--;
    this.gs.ownParty.votes++;
    this.actionQueue.voteQueue.splice(
        this.actionQueue.voteQueue.indexOf(targetIndex), 1);
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
