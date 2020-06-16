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
    this.activeProvince = -1;
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

  allReady() {
    if (this.parties.length < 2) {
      return false;
    }

    for (let i = 0; i < this.parties.length; i++) {
      if (!this.parties[i].ready) {
        return false;
      }
    }

    return true;
  }

  begin() {
    this.pols = POL_NAMES.map((name) => { return {
      name: name,
      party: null,
      runnable: true,
      funded: false,
      votable: false,
      votes: 0
    }});
    this.sympOrder = this.pols.slice();
    shuffle(this.pols);
    shuffle(this.sympOrder);

    for (let i = 0; i < this.pols.length; i++) {
      this.pols[i].party = i % this.parties.length;
      this.parties[i % this.parties.length].pols.push(i);
    }

    for (let i = 0; i < this.parties.length; i++) {
      this.giveSymp(i);
    }

    this.started = true;
    this.priority = 0;
    this.activeProvince = 0;

    this.beginNomination();
  }

  // Advance to the next stage in the active province. If the governor has been
  // elected in the province, move on to the next province.
  advanceStage() {
    const activeProvince = this.provinces[this.activeProvince];
    activeProvince.stage = (activeProvince.stage + 1) % this.provinces.length;
    this.turn = this.priority;
  }

  // Advance to the next player's turn.
  advanceTurn() {
    const stage = this.provinces[this.activeProvince].stage;
    if (stage == 1) {
      this.removeUnfundedCandidates();
    } else if (this.turn == this.priority) {
      if (this.stage == 0) {
        this.beginFunding();
      } else if (this.stage == 2) {
        this.tallyVotes();
      } else {
        this.checkIfGameWon();
      }
    }
  }

  // Begin the nomination stage in the new province.
  beginNomination() {
    this.advanceStage();

    // Give all parties $5.
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].funds += 5;
    }

    // Remove all politicians from the province and make them runnable again.
    const activeProvince = this.provinces[this.activeProvince];
    for (let i = 0; i < activeProvince.dropouts.length; i++) {
      this.pols[activeProvince.dropouts[i]].runnable = true;
    }
    for (let i = 0; i < activeProvince.officials.length; i++) {
      this.pols[activeProvince.officials[i]].runnable = true;
    }
    activeProvince.dropouts = [];
    activeProvince.officials = [];
    activeProvince.governors = [];
  }

  // The given politician becomes a candidate in the active province, and they
  // cannot be run until the next time that province becomes active.
  run(pol) {
    this.pols[pol].runnable = false;
    this.provinces[this.activeProvince].candidates.push(pol);
  }

  beginFunding() {
    this.advanceStage();

    // All candidates begin un-funded.
    for (let i = 0; i < activeProvince.candidates.length; i++) {
      this.pols[activeProvince.candidates[i]].funded = false;
    }
  }

  // The given politician becomes funded for the turn, and their party loses $1.
  fund(party, pol) {
    this.pols[pol].funded = true;
    this.parties[party].funds--;
  }

  removeUnfundedCandidates() {
    const activeProvince = this.provinces[this.activeProvince];
    for (let i = 0; i < activeProvince.candidates; i++) {
      let candidate = this.pols[activeProvince.candidates[i]];

      // If there are 5 or fewer candidates remaining, begin voting. Otherwise,
      // if the candidate is unfunded and a member of the curren player's party,
      // they become a dropout.
      if (activeProvince.candidates.length <= 5) {
        this.beginVoting();
      } else if (candidate.party == this.turn && !candidate.funded) {
        activeProvince.dropouts.push(activeProvince.candidates[i]);
        activeProvince.candidates.splice(i, 1);
        i--;
      }
    }

    // If there are 5 or fewer candidates remaining, begin voting. Otherwise,
    // advance to the next player's turn and reset all of their candidates to
    // be un-funded.
    if (activeProvince.candidates.length <= 5) {
      this.beginVoting();
    } else {
      this.turn = (this.turn + 1) % this.parties.length;
      for (let i = 0; i < activeProvince.candidates; i++) {
        let candidate = this.pols[activeProvince.candidates[i]];
        if (candidate.party == this.turn) {
          candidate.funded = false;
        }
      }
    }
  }

  beginVoting() {
    this.advanceStage();
    const activeProvince = this.provinces[this.activeProvince];

    // All remaining candidates become officials.
    activeProvince.officials = activeProvince.candidates;
    activeProvince.candidates = [];

    this.votingRounds = 0;
    this.resetVotes();
  }

  // Coutn each official's votes. If there is a winner, elect them and begin
  // distribution. Otherwise, start the voting again.
  tallyVotes() {
    const activeProvince = this.provinces[this.activeProvince];
    var disputed = false;
    var maxVotes = -1;
    var maxPol = -1;
    for (let i = 0; i < activeProvince.officials.length; i++) {
      if (activeProvince.officials[i].votes > maxVotes) {
        maxPol = activeProvince.officials[i];
        maxVotes = activeProvince.officials[i].votes;
        disputed = false;
      } else if (activeProvince.officials[i].votes == maxVotes) {
        disputed = true;
      }
    }

    if (disputed) {
      // If this was the third voting round, elect the official belonging to the
      // highest-priority party. Otherwise, reset every politician's votes and
      // start again.
      this.votingRounds++;
      if (this.votingRounds < 3) {
        this.turn = (this.turn + 1) % this.players.length;
        this.resetVotes();
      } else {
        maxPol = activeProvince.officials[0];
        maxPriority = (this.pols[maxPol].party - this.priority) %
                          this.players.length;
        for (let i = 1; i < activeProvince.officials.length; i++) {
          let priority = (this.pols[activeProvince.officials[i]].party -
                         this.priority) % this.players.length;
          if (priority < maxPriority) {
            maxPol = activeProvince.officials[i];
            maxPriority = priority;
          }
        }
        activeProvince.governors.push(maxPol);
        advanceStage();
      }
    } else {
      // If undisputed, elect the winner and begin distribution.
      activeProvince.governors.push(maxPol);
      advanceStage();
    }
  }

  // Reset all officials' vote totals and parties' usable votes to 0, then give
  // all parties votes equal to the number of officials they have in the
  // province.
  resetVotes() {
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].votes = 0;
    }
    for (let i = 0; i < activeProvince.officials.length; i++) {
      this.pols[activeProvince.officials[i]].votes = 0;
      this.parties[this.pols[activeProvince.officials[i]].party].votes++;
    }
  }

  checkIfGameWon() {
    // If any player has more than half the governors, they win the game.
    var governorCounts = Array(this.parties.length);
    for (let i = 0; i < this.parties.length; i++) {
      governorCounts[i] = 0;
    }
    for (let i = 0; i < this.provinces.length; i++) {
      let provinceGovernors = this.provinces[i].governors;
      for (let j = 0; j < provinceGovernors.length) {
        governorCounts[provinceGovernors[j]]++;
        if (governorCounts[provinceGovernors[j]] > this.provinces.length / 2) {
          this.winner = provinceGovernors[j];
          this.ended = true;
        }
      }
    }

    // If there was no winner, advance to the next province and player with
    // priority and begin nomination.
    if (this.winner === null) {
      this.activeProvince = (this.activeProvince + 1) % this.provinces.length;
      this.priority = (this.priority + 1) % this.parties.length;
      this.beginNomination();
    }
  }

  // Assign one vote from the given party to the given politician.
  vote(party, pol) {
    this.pols[pol].votes++;
    this.parties[party].votes--;
  }

  // Pay the given amount of funds from party 1 to party 2.
  pay(p1Index, p2Index, amount) {
    this.parties[p1Index].funds -= amount;
    this.parties[p2Index].funds += amount;
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

  // Transfer the symp from their old party to their new party and add them
  // back into the symp order.
  flipSymp(party, pol) {
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

    return {
      symps: symps,
      sympOrder: sympOrder
    }
  }

  // Uncensor stored secret info.
  unsetPov(sympInfo) {
    this.pov = -1;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].symps = sympInfo.symps[i];
    }

    this.sympOrder = sympInfo.sympOrder;
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
