import {Pol, Prov, NameGenerator} from "./generator";

interface Party {
  name: string,
  abbr: string,
  ready: boolean,
  connected: boolean,
  funds: number,
  pols: number[],
  bribable: number[],
  bribed: number[]
}

class GameState {
  started: boolean;
  ended: boolean;
  activeProvId: number;
  priority: number;
  pov: number;
  turn: number;
  rounds: number;
  stage: number;
  decline: number;
  
  pols: Pol[];
  parties: Party[];
  provs: Prov[];
  officials: number[];
  primeMinister: number | void;
  
  constructor(settings) {
    this.settings = settings;
    this.started = false;
    this.ended = false;
    this.activeProvId = 4;
    this.priority = -1;
    this.pov = -1;
    this.turn = -1;
    this.rounds = 0;
    this.stage = 0;
    this.decline = -1;
    
    this.generator = new NameGenerator(settings.nation);
  
    this.pols = [];
    this.parties = [];
    this.provs = this.generator.provs;
    this.officials = [];
    this.primeMinister = null;
  }

  addParty(name: string, abbr: string): void {
    this.parties.push({
      name: name,
      abbr: abbr,
      ready: false,
      connected: true,
      funds: 0,
      candidates: [],
      bribable: [],
      bribed: []
    });
  }

  // Returns true if all parties are ready, false otherwise.
  allReady(): boolean {
    for (let i = 0; i < this.parties.length; i++) {
      if (!this.parties[i].ready) {
        return false;
      }
    }
    return true;
  }

  commitAll(): void {
    this.parties.forEach((party) => {
      party.ready = false;
    });

    if (!this.started) {
      this.started = true;
      this.beginNomination();
    } else if (this.stage === 0) {
      this.beginRace();
    } else if (this.stage === 1) {
      this.advanceRaceStage();
    } else if (this.stage === 2) {
      this.tallyVotes();
    } else if (this.stage === 3) {
      this.checkIfGameWon();
    }
  }

  // Advance to the next province and begin the nomination stage in the new
  // province.
  beginNomination(): void {
    // Advance to the next province.
    if (this.primeMinister !== null) {
      this.priority = this.pols[this.primeMinister].party;
    }
    this.priority = (this.priority + 1) % this.parties.length;
    this.stage = 0;
    this.decline += 1;

    // Reset all parties' candidates.
    this.parties.forEach((party) => {
      party.pols = [];
    });
    
    this.provs.forEach((prov) => {
      prov.candidates.forEach((pol) => {
        this.parties[this.pols[pol].party].push(this.pols[pol].id);
      });
      prov.officials.forEach((pol) => {
        this.parties[this.pols[pol].party].push(this.pols[pol].id);
      });
    });

    // Give all parties $10M and enough candidates to make 5 total.
    this.parties.forEach((party, partyIndex) => {
      party.funds += 100;
      while (party.pols.length < 5) {
        this.pols.push(this.generator.newPol(partyIndex));
        party.pols.push(this.pols.length - 1);
      }
    });

    this.candidates = [];
    this.officials = [];
    this.primeMinister = null;
  }

  // The given politician becomes a candidate in the active province.
  run(partyIndex: number, polIndex: number, provIndex: number): void {
    let party: Party = this.parties[partyIndex];
    if (party.pols.length > 0
        && party.funds >= 5
        && polIndex < this.parties[partyIndex].pols.length
        && polIndex >= 0) {
      this.provs[provIndex].candidates.push(party.pols[polIndex]);
    }
  }

  beginRace(): void {
    this.stage = 1;
    this.rounds = 0;

    // Assign each candidate a priority value
    const countSoFar: number[] = Array(this.parties.length).fill(0);
    this.provs.forEach((prov, provIndex) => {
      prov.candidates.forEach((polIndex) => {
        const partyIndex = this.pols[polIndex].party;
        const priority = (partyIndex + this.priority) % this.parties.length;
        const supportBonus = (countSoFar * this.parties.length + priority) /
            (5 * this.parties.length + 1);
        this.pols[polIndex].support = this.pols[polIndex].baseSupport +
            supportBonus;
      });
    });
  }

  ad(partyIndex: number, polIndex: number, provIndex: number): void {
    if (this.pols[polIndex].party === partyIndex
        && this.provs[provIndex].candidates.includes(polIndex)
        && this.parties[partyIndex].funds >= (3 + this.rounds)) {
      this.parties[partyIndex].funds -= (3 + this.rounds);
      this.pols[polIndex].support++;
    }
  }

  smear(party, polIndex) {
    if (this.activeProv.candidates[polIndex].party !== party
        && this.parties[party].funds >= (2 + this.rounds)
        && this.activeProv.candidates[polIndex].support > 0) {
      this.parties[party].funds -= (2 + this.rounds);
      this.activeProv.candidates[polIndex].support--;
    }
  }

  advanceRaceStage() {
    this.rounds++;
    this.activeProv.candidates.sort((a, b) => {
      return b.support - a.support;
    });
    if (this.rounds === 3) {
      this.beginVoting();
    }
  }

  beginVoting() {
    // All remaining candidates become officials.
    this.activeProv.candidates.sort((a, b) => {
      return b.support - a.support;
    });

    this.activeProv.officials = this.activeProv.candidates.splice(0, 5);
    this.activeProv.stage = 2;
    this.rounds = 0;
    this.resetVotes();

    // If there are no officials, skip to the next stage.
    if (this.activeProv.officials.length === 0) {
      this.beginDistribution();
    } else if (this.activeProv.officials.length === 1) {
      this.activeProv.governor = this.activeProv.officials[0];
      this.beginDistribution();
    }
  }

  // Assign one vote from the given party to the given politician.
  vote(party, polIndex) {
    if (this.parties[party].votes > 0
        && polIndex < this.activeProv.officials.length
        && polIndex >= 0) {
      this.activeProv.officials[polIndex].votes++;
      this.parties[party].votes--;
    }
  }

  // Reset all officials' vote totals and parties' usable votes to 0, then give
  // all parties votes equal to the number of officials they have in the
  // prov.
  resetVotes() {
    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].votes = 0;
      this.parties[i].bribable = [];
    }
    for (let i = 0; i < this.activeProv.officials.length; i++) {
      this.activeProv.officials[i].votes = 0;
      this.parties[this.activeProv.officials[i].party].votes++;
    }
  }

  // Count each official's votes. If there is a winner, elect them and begin
  // distribution. Otherwise, start the voting again.
  tallyVotes() {
    let maxVotes = -1;
    let maxPols = [];
    for (let i = 0; i < this.activeProv.officials.length; i++) {
      if (this.activeProv.officials[i].votes > maxVotes) {
        maxPols = [this.activeProv.officials[i]];
        maxVotes = this.activeProv.officials[i].votes;
      } else if (this.activeProv.officials[i].votes === maxVotes) {
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
        let maxPol = maxPols[0];
        let maxPriority = (maxPol.party - this.priority) % this.parties.length;
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
      this.beginDistribution();
    }
  }

  beginDistribution() {
    this.activeProv.stage = 3;
  }

  checkIfGameWon() {
    // If any player has more than half the governors, they win the game.
    let governorCounts = Array(this.parties.length).fill(0);
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
    if (party.bribable.length > 0 && party.funds >= (2 + this.rounds) * 10) {
      party.bribed.push(party.bribable[0]);
      party.bribable = [];
      party.funds -= (2 + this.rounds) * 10;
    }
  }

  // Transfer the symp from their old party to their new party.
  flip(partyIndex, sympIndex) {
    const party = this.parties[partyIndex];
    if (sympIndex < party.bribed.length && sympIndex >= 0) {
      const pol = party.bribed[sympIndex];
      if (this.activeProv.officials.includes(pol)
          && this.activeProv.stage === 2) {
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
    const generator = this.generator;
    delete this.generator;

    // Delete other players' symps
    const bribed = [];
    const symps = [];
    const funds = []
    for (let i = 0; i < this.parties.length; i++) {
      bribed.push(this.parties[i].bribed);
      symps.push(this.parties[i].bribable);
      funds.push(this.parties[i].funds);
      if (i !== pov) {
        delete this.parties[i].bribed;
        delete this.parties[i].bribable;
        delete this.parties[i].funds;
      }
    }

    return {
      bribed: bribed,
      symps: symps,
      funds: funds,
      generator: generator
    }
  }

  // Uncensor stored secret info.
  unsetPov(hiddenInfo) {
    this.pov = -1;
    this.activeProv = this.provs[this.activeProvId];
    this.generator = hiddenInfo.generator;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].bribed = hiddenInfo.bribed[i];
      this.parties[i].bribable = hiddenInfo.symps[i];
      this.parties[i].funds = hiddenInfo.funds[i];
    }
  }
}

module.exports = GameState;
