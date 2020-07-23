const PolGenerator = require('./pol-generator');
const generator = new PolGenerator();
const PROVINCE_NAMES = ["Germany 5", "Arkanzas", "wilfreed", "NONONONO", "ian"];

class GameState {
  constructor(settings) {
    this.started = false;
    this.ended = false;
    this.activeProvId = 4;
    this.priority = -1;
    this.pov = -1;
    this.turn = -1;
    this.rounds = 0;

    this.parties = [];
    this.provs = PROVINCE_NAMES.map((name) => { return {
      name: name,
      stage: 3,
      governor: null,
      officials: [],
      candidates: []
    }});
    generator.shuffle(this.provs);
    this.activeProv = this.provs[4];
  }

  addParty(name, abbr) {
    this.parties.push({
      name: name,
      abbr: abbr,
      ready: false,
      connected: true,
      funds: 25,
      candidates: [],
      symps: [],
      bribed: []
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

  commitAll() {
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].ready = false;
    }

    if (!this.started) {
      this.started = true;
      this.beginNomination();
    } else if (this.activeProv.stage == 0) {
      this.beginRace();
    } else if (this.activeProv.stage == 1) {
      this.advanceRaceStage();
    } else if (this.activeProv.stage == 2) {
      this.tallyVotes();
    } else if (this.activeProv.stage == 3) {
      this.checkIfGameWon();
    }
  }

  // Advance to the next province and begin the nomination stage in the new
  // province.
  beginNomination() {
    // Advance to the next province.
    this.activeProvId = (this.activeProvId + 1) % this.provs.length;
    this.activeProv = this.provs[this.activeProvId];
    this.priority = (this.priority + 1) % this.parties.length;
    this.activeProv.stage = 0;

    for (let i = 0; i < this.activeProv.candidates.length) {
      let pol = this.activeProv.candidates[i];
      this.parties[pol.party].candidates.push(pol);
    }
    for (let i = 0; i < this.activeProv.officials.length) {
      let pol = this.activeProv.officials[i];
      this.parties[pol.party].candidates.push(pol);
    }

    // Give all parties $25 and enough candidates to make 5 total.
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].funds += 25;
      for (let j = this.parties[i].pols.length; j < 5; j++) {
        this.parties[i].push(generator.newPol(j));
      }
    }

    this.activeProv.candidates = [];
    this.activeProv.officials = [];
    this.activeProv.governor = null;
  }

  // The given politician becomes a candidate in the active province.
  run(party, polIndex) {
    if (this.parties[party].candidates.length > 2
        && polIndex < this.parties[party].candidates.length
        && polIndex >= 0) {
      this.activeProv.candidates.push(this.parties[party].candidates[polIndex]);
      this.parties[party].candidates.splice(polIndex, 1);
    }
  }

  beginRace() {
    this.activeProv.stage = 1;
    this.rounds = 0;

    // If there are 5 or fewer candidates, begin voting immediately.
    if (this.activeProv.candidates.length <= 5) {
      this.beginVoting();
    } else {
      for (let i = 0; i < this.activeProv.candidates.length; i++) {
        this.activeProv.candidates[i].support = 0;
      }

      // Give a symp to each party with at least one candidate in the race.
      let sympOrder = this.activeProv.candidates.slice();
      generator.shuffle(sympOrder);
      for (let i = 0; i < this.parties.length; i++) {
        for (let j = 0; j < this.activeProv.candidates.length; j++) {
          let givenSymp = false;
          if (this.activeProv.candidates[j].party != j
              && !givenSymp)
              && this.parties[i].pols.length > 0) {
            this.parties[i].symps.push(this.activeProv.candidates[j]);
            sympOrder.splice(j, 1);
            givenSymp = true;
          }
        }
        this.parties[i].candidates = [];
      }
    }
  }

  ad(party, polIndex) {
    if (this.activeProv.candidates[polIndex].party == party
        && this.parties[party].funds > (3 + this.rounds)) {
      this.parties[party].funds -= (3 + this.rounds);
      this.activeProv.candidates[polIndex].support++;
    }
  }

  smear(party, polIndex) {
    if (this.activeProv.candidates[polIndex].party != party
        && this.parties[party].funds > (2 + this.rounds)
        && this.activeProv.candidates[polIndex].support > 0) {
      this.parties[party].funds -= (2 + this.rounds);
      this.activeProv.candidates[polIndex].support--;
    }
  }

  advanceRaceStage() {
    this.rounds++;
    if (this.rounds == 3) {
      this.beginVoting();
    }
  }

  beginVoting() {
    // All remaining candidates become officials.
    this.activeProv.officials = this.activeProv.candidates;
    this.activeProv.candidates = [];
    this.activeProv.stage = 2;

    this.rounds = 0;
    this.resetVotes();

    // If there are no officials, skip to the next stage.
    if (this.activeProv.officials.length == 0) {
      this.beginDistribution();
    } else if (this.activeProv.officials.length == 1) {
      this.activeProv.governors.push(this.activeProv.officials[0]);
      this.beginDistribution();
    }
  }

  // Assign one vote from the given party to the given politician.
  vote(party, polIndex) {
    if (this.parties[party].votes > 0
        && polIndex < this.activeProv.officials.length
        && polIndex >= 0) {
      this.activeProv.officials[polIndex]].votes++;
      this.parties[party].votes--;
    }
  }

  // Reset all officials' vote totals and parties' usable votes to 0, then give
  // all parties votes equal to the number of officials they have in the
  // prov.
  resetVotes() {
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].votes = 0;
      this.parties[i].symps = [];
    }
    for (let i = 0; i < this.activeProv.officials.length; i++) {
      this.activeProv.officials[i].votes = 0;
      this.parties[this.activeProv.officials[i].party].votes++;
    }
  }

  // Coutn each official's votes. If there is a winner, elect them and begin
  // distribution. Otherwise, start the voting again.
  tallyVotes() {
    var maxVotes = -1;
    var maxPols = [];
    for (let i = 0; i < this.activeProv.officials.length; i++) {
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
      this.rounds++;
      if (this.rounds < 3) {
        this.resetVotes();
      } else {
        var maxPol = maxPols[0];
        var maxPriority = (maxPol.party - this.priority) % this.parties.length;
        for (let i = 1; i < maxPols.length; i++) {
          let priority = (maxPols[i].party - this.priority) % this.parties.length;
          if (priority < maxPriority) {
            maxPol = maxPols[i];
            maxPriority = priority;
          }
        }
        this.activeProv.governor = maxPol;
        this.activeProv.officials.splice(
            this.activeProv.officials.indexOf(maxPol), 1);
        this.beginDistribution();
      }
    } else {
      this.activeProv.governor = maxPols[0];
      this.activeProv.officials.splice(
          this.activeProv.officials.indexOf(maxPols[0]), 1);
      this.beginDistribution();
    }
  }

  beginDistribution() {
    this.activeProv.stage = 3;
  }

  checkIfGameWon() {
    // If any player has more than half the governors, they win the game.
    var governorCounts = Array(this.parties.length).fill(0);
    for (let i = 0; i < this.provs.length; i++) {
      let governor = this.provs[i].governor;
      if (governor !== null) {
        governorCounts[governor.party]++;
        if (governorCounts[governor.party] > this.provs.length / 2) {
          this.winner = governor.party;
          this.ended = true;
        }
      }
    }

    // If there was no winner, give the new governor's party $10 per player in
    // the game, advance to the next prov, and begin nomination.
    if (!this.ended) {
      const governor = this.activeProv.governor;
      if (this.activeProv.governor != null) {
        this.parties[governor.party].funds += 10 * this.parties.length;
      }
      this.beginNomination();
    }
  }

  // Pay the given amount of funds from party 1 to party 2.
  pay(party, paymentInfo) {
    if (this.parties[party].funds > paymentInfo.amount
        && paymentInfo.target < this.parties.length
        && paymentInfo.target >= 0) {
      this.parties[party].funds -= paymentInfo.amount;
      this.parties[paymentInfo.target].funds += paymentInfo.amount;
    }
  }

  bribe(partyIndex) {
    const party = this.parties[partyIndex];
    if (party.symps.length > 0 && party.funds >= (2 + this.rounds) * 10) {
      party.bribed.push(party.symps[sympIndex]);
      party.symps.splice(sympIndex, 1);
      party.funds -= (2 + this.rounds) * 10;
    }
  }

  // Transfer the symp from their old party to their new party.
  flip(partyIndex, sympIndex) {
    const party = this.parties[partyIndex];
    if (sympIndex < party.bribed.length && sympIndex >= 0) {
      const pol = party.bribed[sympIndex];
      if (this.activeProv.officials.includes(pol)
          && this.activeProv.stage == 2) {
        this.parties[pol.party].votes--;
        party.votes++;
      }
      pol.party = partyIndex;
      party.bribed.splice(sympIndex, 1);
    }
  }

  // Censor secret info so the gamestate can be sent to the client, and return
  // it so it can be retrieved later.
  setPov(pov) {
    this.pov = pov;
    delete this.activeProv;   // no need to send

    // Delete other players' symps
    const bribed = [];
    const symps = [];
    const funds = []
    for (let i = 0; i < this.parties.length; i++) {
      bribed.push(this.parties[i].bribed);
      symps.push(this.parties[i].symps);
      funds.push(this.parties[i].funds);
      if (i !== pov) {
        delete this.parties[i].bribed;
        delete this.parties[i].symps;
        delete this.parties[i].funds;
      }
    }

    return {
      bribed: bribed,
      symps: symps,
      funds: funds
    }
  }

  // Uncensor stored secret info.
  unsetPov(hiddenInfo) {
    this.pov = -1;
    this.activeProv = this.provs[this.activeProvId];

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].bribed = hiddenInfo.bribed[i];
      this.parties[i].symps = hiddenInfo.symps[i];
      this.parties[i].funds = hiddenInfo.funds[i];
    }
  }
}

module.exports = GameState;
