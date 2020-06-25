const POL_NAMES = [
  "Olive Bass",
  "Amber Melendez",
  "Iyla Conrad",
  "Maleeha Hughes",
  "Pixie Mackenzie",
  "Hareem Worthington",
  "Eliott Kirby",
  "Davey Hogan",
  "Yahya Schaefer",
  "Annaliese Webber",
  "Milana Flowers",
  "Bonita Houston",
  "Hywel Swift",
  "Kynan Skinner",
  "Adela Britton",
  "Sebastien Morrow",
  "Irving Weaver",
  "Johnathon Tait",
  "Willow Rooney",
  "Sahra Huffman",
  "Marlon Howe",
  "Karter Richard",
  "Jimmy Floyd",
  "Eliza Akhtar",
  "Jai Leal",
  "Harriett Cervantes",
  "Sianna Reyes",
  "Rueben Finley",
  "Zion Kemp",
  "Sachin Hirst",
  "Zahid Vaughan",
  "Finn Cole",
  "Dominika Gonzalez",
  "Henley Colon",
  "Lainey Hollis",
  "Isla-Grace Madden",
  "Samera Stephenson",
  "Ayoub Stanley",
  "Esmay Ramirez",
  "Joy Wormald",
  "Veronika Calderon",
  "Jolyon Stafford",
  "Kaif Owens",
  "Skye Norton",
  "Shauna Greaves",
  "Charmaine Phan",
  "Sky Watt",
  "Heath Osborn",
  "Conrad Cortez",
  "Valentino Pena",
  "Tayla Carlson",
  "Beatriz Richardson",
  "Ashlyn English",
  "Arla Baker",
  "Yusha Bailey",
  "Anastasia Elliott",
  "Marjorie Williamson",
  "Tom Esparza",
  "Reid Buckley",
  "Shannon Morse"
];
const PROVINCE_NAMES = ["Jermany 4", "Kanzas", "wilfred", "NO NO NO", "ian"];

class GameState {
  constructor() {
    this.started = false;
    this.ended = false;
    this.activeProvinceId = -1;
    this.priority = -1;
    this.pov = -1;
    this.turn = -1;
    this.votingRounds = 0;
    this.winner = null;

    this.parties = [];
    this.provinces = PROVINCE_NAMES.map((name) => { return {
      name: name,
      stage: -1,
      governors: [],
      officials: [],
      candidates: [],
      dropouts: []
    }});
    shuffle(this.provinces);
  }

  addParty(name, abbr) {
    this.parties.push({
      name: name,
      abbr: abbr,
      ready: false,
      connected: true,
      funds: 5,
      pols: [],
      symps: []
    });
  }

  // Returns true if all parties are ready, false otherwise.
  allReady() {
    for (let i = 0; i < this.parties.length; i++) {
      if (!this.parties[i].ready) {
        return false;
      }
    }

    return true;
  }

  // Begin the game.
  begin() {
    // Create 12 politicians for each party, and randomize the order in which
    // they symp.
    all_pols = POL_NAMES.map((name) => { return {
      name: name,
      party: null,
      runnable: true,
      funded: false
    }});
    shuffle(all_pols);
    this.pols = all_pols.slice(0, 12 * this.parties.length)
    this.sympOrder = this.pols.slice();
    shuffle(this.sympOrder);

    // Distribute an equal number of politicians to each player.
    for (let i = 0; i < this.pols.length; i++) {
      this.pols[i].party = i % this.parties.length;
      this.parties[i % this.parties.length].pols.push(i);
    }

    // Give one symp to each player.
    for (let i = 0; i < this.parties.length; i++) {
      this.giveSymp(i);
    }

    // Begin the nomination stage in the first province.
    this.started = true;
    this.priority = 0;
    this.activeProvinceId = 0;
    this.beginNomination();
  }

  // Advance to the next stage in the active province. Set the turn to the
  // player with priority.
  advanceStage() {
    const stage = (this.activeProvince.stage + 1) % 4;
    this.activeProvince.stage = stage;
    if (stage == 0) {
      this.checkIfGameWon();
    } else if (stage == 1) {
      this.beginFunding();
    } else if (stage == 2) {
      this.removeUnfundedCandidates();
    } else {
      this.tallyVotes();
    }
  }

  // Begin the nomination stage in the new province.
  beginNomination() {
    // Give all parties $5.
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].funds += 5;
    }

    // Remove all politicians from the province and make them runnable again.
    for (let i = 0; i < this.activeProvince.dropouts.length; i++) {
      this.pols[this.activeProvince.dropouts[i]].runnable = true;
    }
    for (let i = 0; i < this.activeProvince.officials.length; i++) {
      this.pols[this.activeProvince.officials[i]].runnable = true;
    }
    this.activeProvince.dropouts = [];
    this.activeProvince.officials = [];
    this.activeProvince.governors = [];

    this.flipQueue = [];
    this.buyQueue = [];
    this.payQueue = [];
    this.runQueue = [];
  }

  enqueueRun(party, pol) {
    this.runQueue.push(pol);
  }

  executeRuns() {
    for (let i = 0; i < this.runQueue.length; i++) {
      this.run(this.runQueue[i]);
    }
    this.runQueue = [];
  }

  // The given politician becomes a candidate in the active province, and they
  // cannot be run until the next time that province becomes active.
  run(pol) {
    this.activeProvince.candidates.push(pol);
    this.pols[pol].runnable = false;
  }

  beginFunding() {
    // All candidates begin un-funded.
    for (let i = 0; i < this.activeProvince.candidates.length; i++) {
      this.pols[this.activeProvince.candidates[i]].funded = false;
    }

    // If there are 5 or fewer candidates, begin voting immediately.
    if (this.activeProvince.candidates.length <= 5) {
      this.beginVoting();
    }

    this.flipQueue = [];
    this.buyQueue = [];
    this.payQueue = [];
    this.fundQueue = [];
  }

  // The given politician becomes funded for the turn, and their party loses $1.
  enqueueFund(party, pol) {
    this.fundQueue.push(pol);
  }

  executeFunds() {
    for (let i = 0; i < this.fundQueue.length; i++) {
      this.fund(this.fundQueue[i]);
    }
    this.fundQueue = [];
  }

  fund(party, pol) {
    this.parties[this.pols[pol].party].funds--;
    this.pols[pol].funded = true;
  }

  removeUnfundedCandidates() {
    for (let i = 0; i < this.activeProvince.candidates.length; i++) {
      let candidate = this.pols[this.activeProvince.candidates[i]];

      // If the candidate is unfunded and a member of the party whose turn just
      // ended, they become a dropout. Otherwise, reset them to un-funded.
      if (!candidate.funded) {
        this.activeProvince.dropouts.push(this.activeProvince.candidates[i]);
        this.activeProvince.candidates.splice(i, 1);
        i--;
      }
      candidate.funded = false;

      // If there are 5 or fewer candidates remaining, begin voting.
      if (this.activeProvince.candidates.length <= 5) {
        this.beginVoting();
      }
    }
  }

  beginVoting() {
    // All remaining candidates become officials.
    this.activeProvince.officials = this.activeProvince.candidates;
    this.activeProvince.candidates = [];

    this.votingRounds = 0;
    this.resetVotes();

    // If there are no officials, skip to the next stage.
    if (activeProvince.officials.length == 0) {
      this.advanceStage();
    }
  }

  enqueueVote(party, pol) {
    this.voteQueue.push([party, pol]);
  }

  executeVotes(party, pol) {
    for (let i = 0; i < this.voteQueue.length; i++) {
      this.vote(this.voteQueue[i][0], this.voteQueue[i][1]);
    }
    this.voteQueue = [];
  }

  // Assign one vote from the given party to the given politician.
  vote(party, pol) {
    this.votes[this.provinces[this.activeProvinceId].officials.indexOf(pol)]++;
    this.parties[party].votes--;
  }

  commitVoting() {
    this.executeFlips();
    this.executePays();
    this.executeBuys();
    this.tallyVotes();
  }

  // Reset all officials' vote totals and parties' usable votes to 0, then give
  // all parties votes equal to the number of officials they have in the
  // province.
  resetVotes() {
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].votes = 0;
    }

    this.votes = Array(this.activeProvince.officials.length);
    for (let i = 0; i < this.votes.length; i++) {
      this.votes[i] = 0;
      this.parties[this.pols[this.activeProvince.officials[i]].party].votes++;
    }
  }

  // Coutn each official's votes. If there is a winner, elect them and begin
  // distribution. Otherwise, start the voting again.
  tallyVotes() {
    var disputed = false;
    var maxVotes = -1;
    var maxPol = -1;
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i] > maxVotes) {
        maxPol = this.activeProvince.officials[i];
        maxVotes = this.votes[i];
        disputed = false;
      } else if (this.votes[i] == maxVotes) {
        disputed = true;
      }
    }

    if (disputed) {
      // If this was the third voting round, elect the official belonging to the
      // highest-priority party. Otherwise, reset every politician's votes and
      // start again.
      this.votingRounds++;
      if (this.votingRounds < 3) {
        this.resetVotes();
      } else {
        maxPol = this.activeProvince.officials[0];
        maxPriority = (this.pols[maxPol].party - this.priority) %
                      this.players.length;
        for (let i = 1; i < this.activeProvince.officials.length; i++) {
          let priority = (this.pols[this.activeProvince.officials[i]].party -
                         this.priority) % this.players.length;
          if (priority < maxPriority) {
            maxPol = this.activeProvince.officials[i];
            maxPriority = priority;
          }
        }
        this.declareWinner(maxPol);
      }
    } else {
      this.declareWinner(maxPol);
    }
  }

  // Promote the winning politician to governor and give their part $10, then
  // advance to the next stage.
  declareWinner(pol) {
    this.activeProvince.governors.push(pol);
    this.advanceStage();
  }

  commitDistribution() {
    this.executeFlips();
    this.executePays();
    this.executeBuys();
    this.checkIfGameWon();
  }

  checkIfGameWon() {
    // If any player has more than half the governors, they win the game.
    var governorCounts = Array(this.parties.length);
    for (let i = 0; i < this.parties.length; i++) {
      governorCounts[i] = 0;
    }
    for (let i = 0; i < this.provinces.length; i++) {
      let provinceGovernors = this.provinces[i].governors;
      for (let j = 0; j < provinceGovernors.length; j++) {
        const governorParty = this.pols[provinceGovernors[j]].party;
        governorCounts[governorParty]++;
        if (governorCounts[governorParty] > this.provinces.length / 2) {
          this.winner = governorParty;
          this.ended = true;
        }
      }
    }

    // If there was no winner, advance to the next province and player with
    // priority and begin nomination.
    if (this.winner === null) {
      const governors = this.activeProvince.governors;
      for (let i = 0; i < governors.length; i++) {
        this.parties[this.pols[governors[i]].party].funds +=
            3 * this.parties.length;
      }

      this.activeProvinceId = (this.activeProvinceId + 1) %
                              this.provinces.length;
      this.activeProvince = this.provinces[this.activeProvinceId];
      this.priority = (this.priority + 1) % this.parties.length;
      this.beginNomination();
    }
  }

  enqueuePay(p1Index, p2Index, amount) {
    this.payQueue.push([p1Index, p2Index, amount])
  }

  executePays() {
    for (let i = 0; i < this.payQueue.length; i++) {
      this.pay(this.payQueue[i][0], this.payQueue[i][1], this.payQueue[i][2]);
    }
    this.payQueue = [];
  }

  // Pay the given amount of funds from party 1 to party 2.
  pay(p1Index, p2Index, amount) {
    this.parties[p1Index].funds -= amount;
    this.parties[p2Index].funds += amount;
  }

  enqueueBuy(party) {
    this.buyQueue.push(party);
  }

  executeBuys() {
    for (let i = 0; i < this.buyQueue.length; i++) {
      this.buySymp(this.buyQueue[i]);
    }
  }

  // Remove $5 from the given party's funds, then give a symp to that party.
  buySymp(party) {
    this.parties[party].funds -= 5;
    this.giveSymp(party);
  }

  // Give a symp to the given party.
  giveSymp(party) {
    var i = 0;
    while(this.sympOrder[i].party === party) {
      i++;
    }
    const polIndex = this.pols.indexOf(this.sympOrder[i]);
    this.parties[party].symps.push(polIndex);
    this.sympOrder.splice(i, 1);
  }

  enqueueFlip(pol) {
    this.flipQueue.push(pol);
  }

  executeFlips() {
    for (let i = 0; i < this.flipQueue.length; i++) {
      this.flipSymp(this.flipQueue[i]);
    }
    this.flipQueue = [];
  }

  // Transfer the symp from their old party to their new party and add them
  // back into the symp order.
  flipSymp(pol) {
    const partyIndex = this.pols[pol].party;
    const oldParty = this.parties[this.pols[pol].party];
    const newParty = this.parties[party];
    newParty.pols.push(pol);
    newParty.symps.splice(newParty.symps.indexOf(pol), 1);
    oldParty.pols.splice(oldParty.pols.indexOf(pol), 1);
    this.pols[pol].party = party;
    this.sympOrder.push(pol);
    shuffle(this.sympOrder);
  }

  // Censor secret info so the gamestate can be sent to the client, and return
  // it so it can be retrieved later.
  setPov(pov) {
    this.pov = pov;
    const symps = [];

    for (let i = 0; i < this.parties.length; i++) {
      symps.push(this.parties[i].symps);
      if (i !== pov) {
        this.parties[i].symps = [];
      }
    }

    const sympOrder = this.sympOrder;
    this.sympOrder = [];
    const votes = this.votes;
    this.votes = [];
    delete this.activeProvince;

    return {
      symps: symps,
      sympOrder: sympOrder,
      votes: votes
    }
  }

  // Uncensor stored secret info.
  unsetPov(hiddenInfo) {
    this.pov = -1;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].symps = hiddenInfo.symps[i];
    }

    this.sympOrder = hiddenInfo.sympOrder;
    this.votes = hiddenInfo.votes;
    this.activeProvince = this.provinces[this.activeProvinceId];
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = GameState;
