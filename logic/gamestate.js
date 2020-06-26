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
    this.activeProvId = -1;
    this.priority = -1;
    this.pov = -1;
    this.turn = -1;
    this.votingRounds = 0;
    this.winner = null;

    this.parties = [];
    this.provs = PROVINCE_NAMES.map((name) => { return {
      name: name,
      stage: -1,
      governors: [],
      officials: [],
      candidates: [],
      dropouts: []
    }});
    shuffle(this.provs);
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

    // Begin the nomination stage in the first prov.
    this.started = true;
    this.beginNomination();
  }

  // Advance to the next province and begin the nomination stage in the new
  // province.
  beginNomination() {
    // Advance to the next prov.
    this.activeProvId = (this.activeProvId + 1) %
                            this.provs.length;
    this.activeProv = this.provs[this.activeProvId];
    this.priority = (this.priority + 1) % this.parties.length;
    this.activeProv.stage = 0;

    // Give all parties $5.
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].funds += 5;
    }

    // Remove all politicians from the prov and make them runnable again.
    for (let i = 0; i < this.activeProv.dropouts.length; i++) {
      this.pols[this.activeProv.dropouts[i]].runnable = true;
    }
    for (let i = 0; i < this.activeProv.officials.length; i++) {
      this.pols[this.activeProv.officials[i]].runnable = true;
    }
    this.activeProv.dropouts = [];
    this.activeProv.officials = [];
    this.activeProv.governors = [];

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
    this.activeProv.candidates.push(pol);
    this.pols[pol].runnable = false;
  }

  commitNomination() {
    executeFlips();
    executePays();
    executeBuys();
    executeRuns();
    beginFunding();
  }

  beginFunding() {
    this.activeProv.stage = 1;
    this.resetFunds();

    // If there are 5 or fewer candidates, begin voting immediately.
    if (this.activeProv.candidates.length <= 5) {
      this.beginVoting();
    }
  }

  resetFunds() {
    for (let i = 0; i < this.activeProv.candidates.length; i++) {
      this.pols[this.activeProv.candidates[i]].funded = false;
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

  // Remove one unfunded candidate from the party with priority, then one from
  // the next-highest priority party, and so on, and repeat until there are
  // five or fewer candidates or all remaining candidates are funded.
  removeUnfundedCandidates() {
    var allFunded = false;

    while (!allFunded) {
      allFunded = true;
      for (let i = 0; i < this.parties.length; i++) {
        for (let j = this.activeProv.candidates.length - 1; j >= 0 j--) {
          let candidate = this.pols[this.activeProv.candidates[j]];

          // If the candidate is unfunded and a member of the party to remove
          // from, and there are still more than 5 candidates remaining, they
          // become a dropout.
          if (!candidate.funded &&
              candidate.party == (i + this.priority) % 5 &&
              this.activeProv.candidates.length > 5) {
            this.activeProv.dropouts.push(this.activeProv.candidates[j]);
            this.activeProv.candidates.splice(j, 1);
            allFunded = false;
          }
        }
      }
    }

    // If there are 5 or fewer candidates remaining, begin voting.
    if (this.activeProv.candidates.length <= 5) {
      this.beginVoting();
    } else {
      this.resetFunds();
    }
  }

  commitFunding() {
    executeFlips();
    executePays();
    executeBuys();
    executeFunds();
    removeUnfundedCandidates();
  }

  beginVoting() {
    // All remaining candidates become officials.
    this.activeProv.officials = this.activeProv.candidates;
    this.activeProv.candidates = [];
    this.activeProv.stage = 2;

    this.votingRounds = 0;
    this.resetVotes();

    // If there are no officials, skip to the next stage.
    if (activeProv.officials.length == 0) {
      this.beginDistribution();
    } else if (activeProv.officials.length == 1) {
      this.activeProv.governors.push(activeProv.officials[0]);
      this.beginDistribution();
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
    this.votes[this.provs[this.activeProvId].officials.indexOf(pol)]++;
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
  // prov.
  resetVotes() {
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].votes = 0;
    }

    this.votes = Array(this.activeProv.officials.length);
    for (let i = 0; i < this.votes.length; i++) {
      this.votes[i] = 0;
      this.parties[this.pols[this.activeProv.officials[i]].party].votes++;
    }
  }

  // Coutn each official's votes. If there is a winner, elect them and begin
  // distribution. Otherwise, start the voting again.
  tallyVotes() {
    var maxVotes = -1;
    var maxPols = [];
    for (let i = 0; i < this.votes.length; i++) {
      if (this.votes[i] > maxVotes) {
        maxPols = [this.activeProv.officials[i]];
        maxVotes = this.votes[i];
      } else if (this.votes[i] == maxVotes) {
        maxPols.push(this.activeProv.officials[i]);
      }
    }

    // If the election was not disputed, elect the winner. If it was disputed
    // and this was the third voting round, elect the official belonging to the
    // highest-priority party. Otherwise, reset every politician's votes and
    // start again.
    if (maxPols.length > 1) {
      this.votingRounds++;
      if (this.votingRounds < 3) {
        this.resetVotes();
      } else {
        var maxPol = maxPols[0];
        var maxPriority = (this.pols[maxPol].party - this.priority) %
                          this.players.length;
        for (let i = 1; i < maxPols.length; i++) {
          let priority = (this.pols[maxPols[i]].party - this.priority) %
                         this.players.length;
          if (priority < maxPriority) {
            maxPol = maxPols[i];
            maxPriority = priority;
          }
        }
        this.activeProv.governors.push(maxPol);
        this.beginDistribution();
      }
    } else {
      this.activeProv.governors.push(maxPols[0]);
      this.beginDistribution();
    }
  }

  beginDistribution() {
    this.activeProv.stage = 3;
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
    for (let i = 0; i < this.provs.length; i++) {
      let provGovernors = this.provs[i].governors;
      for (let j = 0; j < provGovernors.length; j++) {
        const governorParty = this.pols[provGovernors[j]].party;
        governorCounts[governorParty]++;
        if (governorCounts[governorParty] > this.provs.length / 2) {
          this.winner = governorParty;
          this.ended = true;
        }
      }
    }

    // If there was no winner, advance to the next prov and begin
    // nomination.
    if (!this.ended) {
      const governors = this.activeProv.governors;
      if (governors.length > 0) {
        this.parties[this.pols[governors[0]].party].funds +=
            3 * this.parties.length;
      }
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
    delete this.activeProv;   // no need to send

    // Delete other players' symps
    const symps = [];
    for (let i = 0; i < this.parties.length; i++) {
      symps.push(this.parties[i].symps);
      if (i !== pov) {
        delete this.parties[i].symps;
      }
    }

    const sympOrder = this.sympOrder;
    const votes = this.votes;
    delete this.sympOrder;
    delete this.votes;

    const flipQueue = this.flipQueue;
    const payQueue = this.payQueue;
    const buyQueue = this.buyQueue;
    const runQueue = this.runQueue;
    const fundQueue = this.fundQueue;
    const voteQueue = this.voteQueue;
    delete this.flipQueue;
    delete this.payQueue;
    delete this.buyQueue;
    delete this.runQueue;
    delete this.fundQueue;
    delete this.voteQueue;

    return {
      symps: symps,
      sympOrder: sympOrder,
      votes: votes,
      flipQueue: flipQueue,
      payQueue: payQueue,
      buyQueue: buyQueue,
      runQueue: runQueue,
      fundQueue: fundQueue,
      voteQueue: voteQueue
    }
  }

  // Uncensor stored secret info.
  unsetPov(hiddenInfo) {
    this.pov = -1;
    this.activeProv = this.provs[this.activeProvId];

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].symps = hiddenInfo.symps[i];
    }

    this.sympOrder = hiddenInfo.sympOrder;
    this.votes = hiddenInfo.votes;

    this.flipQueue = hiddenInfo.flipQueue;
    this.payQueue = hiddenInfo.payQueue;
    this.buyQueue = hiddenInfo.buyQueue;
    this.runQueue = hiddenInfo.runQueue;
    this.fundQueue = hiddenInfo.fundQueue;
    this.voteQueue = hiddenInfo.voteQueue;
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
