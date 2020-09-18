interface ActionQueue {
  adQueue?: number[];
  smearQueue?: number[];
  bribeQueue?: number[];
  hitQueue?: number[];
  voteQueue?: number[];
  flipQueue?: number[];
  pmChoice?: boolean;
}

interface OfferInfo {
  target: number,
  amount: number,
  fromParty: number
}

class GamestateManager {
  handlers: any;
  gs: any;
  actionQueue?: ActionQueue;

  constructor() {
    this.gs = {
      parties: [],
      pov: -1,
      started: false,
      ended: false,
      settings: {
        name: "Loading..."
      }
    };

    this.handlers = {
      'connection': this.handleConnect,
      'join': this.handleJoin,
      'replace': this.handleReplace,
      'ready': this.handleReady,
      'disconnect': this.handleDisconnect,
      'flip': this.handleFlip,
      'offer': this.handleOffer,
      'ad': this.handleAd,
      'smear': this.handleSmear,
      'hit': this.handleHit,
      'bribe': this.handleBribe,
      'vote': this.handleVote,
      'choose': this.handleChoose,
      'unflip': this.handleUndoFlip,
      'unad': this.handleUndoAd,
      'unsmear': this.handleUndoSmear,
      'unhit': this.handleUndoHit,
      'unbribe': this.handleUndoBribe,
      'unvote': this.handleUndoVote,
      'newoffer': this.handleNewOffer,
      'newreplace': this.handleNewReplace,
      'newready': this.handleNewReady,
      'newdisconnect': this.handleNewDisconnect
    }
    this.currentReady = this.currentReady.bind(this);
    this.ownParty = this.ownParty.bind(this);
  }

  setGs(gs): void {
    // Set the gamestate to the received gamestate, and add helper variables
    // to keep track of the current province and the player's party.
    this.gs = gs;

    // Reset the action queue
    this.actionQueue = {};
    if (gs.stage === 1) {
      this.actionQueue.adQueue = [];
      this.actionQueue.smearQueue = [];
      this.actionQueue.bribeQueue = [];
      this.actionQueue.hitQueue = [];
    } else if (gs.stage === 2) {
      this.actionQueue.voteQueue = [];
      this.actionQueue.hitQueue = [];
    } else if (gs.stage === 3) {
      this.actionQueue.pmChoice = false;
      if (this.ownParty() != null) {
        this.ownParty().pmChoice = false;
      }
    }
    if (gs.stage >= 2) {
      this.actionQueue.flipQueue = [];
    }
  }

  updateAfter(type: string, actionInfo?: any): void {
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

  handleConnect(): void {
    if (this.ownParty() !== undefined) {
      this.ownParty().connected = true;
    }
  }

  handleJoin(): void {

  }

  handleReplace(target): void {
    this.gs.parties[target].connected = true;
    this.gs.pov = target;
  }

  handleReady(): void {
    this.ownParty().ready = !this.ownParty().ready;
  }

  handleDisconnect(): void {
    if (this.ownParty() !== undefined) {
      this.ownParty().connected = false;
    }
  }

  handleFlip(polIndex: number): void {
    this.gs.pols[polIndex].oldParty =
        this.gs.pols[polIndex].party;
    this.gs.pols[polIndex].party = this.gs.pov;

    // If the flipped politician was an active official, gain a vote.
    if (this.gs.officials.includes(polIndex) &&
        this.gs.stage === 2) {
      this.ownParty().votes++;
      this.gs.parties[this.gs.pols[polIndex].oldParty].votes--;
    }

    this.actionQueue.flipQueue.push(polIndex);
  }

  handleOffer(offerInfo: {target: number, amount: number}): void {
    this.ownParty().funds -= offerInfo.amount;
  }

  handleAd(polIndex: number): void {
    this.gs.pols[polIndex].adsBought++;
    this.ownParty().funds -= this.gs.pols[polIndex].adsBought;
    this.gs.pols[polIndex].support++;
    this.actionQueue.adQueue.push(polIndex);
  }
  
  handleSmear(polIndex: number): void {
    this.gs.pols[polIndex].adsBought++;
    this.ownParty().funds -= this.gs.pols[polIndex].adsBought;
    this.gs.pols[polIndex].support--;
    this.actionQueue.smearQueue.push(polIndex);
  }

  handleHit(polIndex: number): void {
    this.ownParty().funds -= (this.gs.stage >= 2) ? 50 : 25;
    this.ownParty().hitAvailable = false;
    this.gs.pols[polIndex].hitOrdered = true;
    this.actionQueue.hitQueue.push(polIndex);
  }

  handleBribe(polIndex: number): void {
    this.ownParty().funds -= 25 + 10 * this.gs.rounds;
    this.gs.pols[polIndex].flipped = true;
    this.actionQueue.bribeQueue.push(polIndex);
  }

  handleVote(polIndex: number): void {
    this.gs.pols[polIndex].support++;
    this.ownParty().votes--;
    this.actionQueue.voteQueue.push(polIndex);
  }

  handleChoose(choice: boolean): void {
    this.actionQueue.pmChoice = choice;
    if (this.gs.pov >= 0) {
      this.ownParty().pmChoice = choice;
    }
  }

  handleUndoFlip(flipInfo): void {
    this.gs.pols[flipInfo.polIndex].party =
        this.gs.pols[flipInfo.polIndex].oldParty;

    // If they were an official, give a vote back to their old party, and if
    // the player's own party has voted with the unflipped politician, take
    // back the last vote.
    if (this.gs.stage === 2) {
      this.ownParty().votes--;
      this.gs.parties[this.gs.pols[flipInfo.polIndex].oldParty].votes++;
      if (this.ownParty().votes < 0) {
        const lastVote = this.actionQueue.voteQueue.pop();
        this.gs.pols[lastVote].support--;
        this.ownParty().votes++;
      }
    }

    this.actionQueue.flipQueue.splice(
        this.actionQueue.flipQueue.indexOf[flipInfo.polIndex], 1);
  }

  handleUndoAd(polIndex: number): void {
    this.ownParty().funds += this.gs.pols[polIndex].adsBought;
    this.gs.pols[polIndex].adsBought--;
    this.gs.pols[polIndex].support--;
    this.actionQueue.adQueue.splice(
        this.actionQueue.adQueue.indexOf(polIndex), 1);
  }

  handleUndoSmear(polIndex: number): void {
    this.ownParty().funds += this.gs.pols[polIndex].adsBought;
    this.gs.pols[polIndex].adsBought--;
    this.gs.pols[polIndex].support++;
    this.actionQueue.smearQueue.splice(
        this.actionQueue.smearQueue.indexOf(polIndex), 1);
  }

  handleUndoHit(): void {
    this.ownParty().funds += (this.gs.stage == 2) ? 50 : 25;
    this.ownParty().hitAvailable = true;
    this.gs.pols[this.actionQueue.hitQueue[0]].hitOrdered = false;
    this.actionQueue.hitQueue = [];
  }

  handleUndoBribe(polIndex: number): void {
    this.ownParty().funds += 25 + 10 * this.gs.rounds;
    this.gs.pols[polIndex].flipped = false;
    this.actionQueue.bribeQueue.splice(
        this.actionQueue.bribeQueue.indexOf(polIndex));
  }

  handleUndoVote(polIndex: number): void {
    this.gs.pols[polIndex].support--;
    this.ownParty().votes++;
    this.actionQueue.voteQueue.splice(
        this.actionQueue.voteQueue.indexOf(polIndex), 1);
  }

  handleNewOffer(offerInfo: OfferInfo): void {
    this.gs.parties[offerInfo.fromParty].offering = offerInfo.amount;
  }

  handleNewReplace(partyIndex): void {
    this.gs.parties[partyIndex].connected = true;
  }

  handleNewReady(readyInfo): void {
    this.gs.parties[readyInfo.party].ready = readyInfo.isReady;
  }

  handleNewDisconnect(partyIndex): void {
    this.gs.parties[partyIndex].connected = false;
  }
  
  ownParty() {
    return this.gs.parties[this.gs.pov];
  }
}

export default GamestateManager;
