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
    if (this.gs.ownParty != undefined) {
      props.gs.ownParty.connected = true;
    }
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

  handleDisconnect(targetIndex) {
    if (this.gs.ownParty != undefined) {
      this.gs.ownParty.connected = false;
    }
  }

  handleFlip(flipInfo) {
    flipInfo.pol.oldParty = flipInfo.pol.party;
    flipInfo.pol.party = this.gs.pov;

    // If the flipped politician was an active official, gain a vote.
    if (this.gs.activeProv.officials.includes(flipInfo.pol)
        && this.gs.activeProv.stage == 2) {
      this.gs.ownParty.votes++;
      this.gs.parties[flipInfo.pol.oldParty].votes--;
    }

    this.actionQueue.flipQueue.push(flipInfo.index);
  }

  handlePay(paymentInfo) {
    this.gs.ownParty.funds -= paymentInfo.amount;
    this.gs.parties[paymentInfo.target].funds += paymentInfo.amount;
    this.gs.parties[paymentInfo.target].paid = true;
    this.actionQueue.payQueue.push(paymentInfo);
  }

  handleRun(targetPol) {
    this.gs.activeProv.candidates.push(targetPol);
    this.actionQueue.runQueue.push(
        this.gs.ownParty.candidates.indexOf(targetPol));
  }

  handleAd(targetIndex) {
    this.gs.ownParty.funds -= 3 + this.gs.rounds;
    if (this.gs.activeProv.candidates[targetIndex].adsBought == undefined) {
      this.gs.activeProv.candidates[targetIndex].adsBought = 0;
    }
    this.gs.activeProv.candidates[targetIndex].adsBought++;
    this.gs.activeProv.candidates[targetIndex].support++;
    this.actionQueue.adQueue.push(targetIndex);
  }

  handleSmear(targetIndex) {
    this.gs.ownParty.funds -= 2 + this.gs.rounds;
    if (this.gs.activeProv.candidates[targetIndex].adsBought == undefined) {
      this.gs.activeProv.candidates[targetIndex].adsBought = 0;
    }
    this.gs.activeProv.candidates[targetIndex].adsBought++;
    this.gs.activeProv.candidates[targetIndex].support--;
    this.actionQueue.smearQueue.push(targetIndex);
  }

  handleBribe() {
    this.gs.ownParty.funds -= 10 * (2 + this.gs.rounds);
    this.gs.ownParty.symps[0].flipped = true;
    this.gs.ownParty.bribed.push(this.gs.ownParty.symps[0]);
    this.actionQueue.bribeQueue.push(true);
  }

  handleVote(targetIndex) {
    this.gs.activeProv.officials[targetIndex].votes++;
    this.gs.ownParty.votes--;
    this.actionQueue.voteQueue.push(targetIndex);
  }

  handleUndoFlip(flipInfo) {
    flipInfo.pol.party = flipInfo.pol.oldParty;

    // If they were an official, give a vote back to their old party, and if
    // the player's own party has voted with the unflipped politician, take
    // back the last vote.
    if (this.gs.activeProv.officials.includes(flipInfo.pol)
        && this.gs.activeProv.stage == 2) {
      this.gs.ownParty.votes--;
      this.gs.parties[flipInfo.pol.oldParty].votes++;
      if (this.gs.voteQueue.length > this.gs.ownParty.votes) {
        this.gs.voteQueue.splice(this.gs.voteQueue.length - 1, 1);
      }
    }

    this.actionQueue.flipQueue.splice(
        this.actionQueue.flipQueue.indexOf[flipInfo.index], 1);
  }

  handleUndoPay(targetIndex) {
    var paymentIndex = 0;
    for (let i = 1; i < this.actionQueue.payQueue.length; i++) {
      if (this.actionQueue.payQueue[i].target == targetIndex) {
        paymentIndex = i;
      }
    }
    this.gs.ownParty.funds += this.actionQueue.payQueue[paymentIndex].amount;
    this.gs.parties[targetIndex].funds -=
        this.actionQueue.payQueue[paymentIndex].amount;
    this.gs.parties[targetIndex].paid = false;
    this.actionQueue.payQueue.splice(paymentIndex, 1);
  }

  handleUndoRun(targetPol) {
    const targetIndex = this.gs.ownParty.candidates.indexOf(targetPol);
    this.gs.activeProv.candidates.splice(
        this.gs.activeProv.candidates.indexOf(targetPol), 1);
    this.actionQueue.runQueue.splice(
        this.actionQueue.runQueue.indexOf(targetIndex), 1);
  }

  handleUndoAd(targetIndex) {
    this.gs.ownParty.funds += 3 + this.gs.rounds;
    this.gs.activeProv.candidates[targetIndex].adsBought--;
    this.gs.activeProv.candidates[targetIndex].support--;
    this.actionQueue.adQueue.splice(
        this.actionQueue.adQueue.indexOf(targetIndex), 1);
  }

  handleUndoSmear(targetIndex) {
    this.gs.ownParty.funds += 2 + this.gs.rounds;
    this.gs.activeProv.candidates[targetIndex].adsBought--;
    this.gs.activeProv.candidates[targetIndex].support++;
    this.actionQueue.smearQueue.splice(
        this.actionQueue.smearQueue.indexOf(targetIndex), 1);
  }

  handleUndoBribe() {
    this.gs.ownParty.funds += 10 * (2 + this.gs.rounds);
    this.gs.ownParty.symps[0].flipped = false;
    this.gs.ownParty.bribed.splice(
        this.gs.ownParty.bribed.indexOf(this.gs.ownParty.symps[0]));
    this.actionQueue.bribeQueue = [];
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
    this.gs.parties[readyInfo.party].ready = readyInfo.isReady;
  }

  handleNewDisconnect(party) {
    this.gs.parties[party].connected = false;
  }
}

export default GamestateManager;
