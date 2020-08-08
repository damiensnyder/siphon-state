import {Pol, Prov, NameGenerator} from "./generator";

interface Party {
  name: string,
  abbr: string,
  ready: boolean,
  eliminated: boolean,
  connected: boolean,
  funds: number,
  votes: number,
  pols: number[],
  sympathetic: number[],
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
  suspender: number | void;
  
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
    this.suspender = null;
  }

  addParty(name: string, abbr: string): void {
    this.parties.push({
      name: name,
      abbr: abbr,
      ready: false,
      eliminated: false,
      connected: true,
      funds: 0,
      votes: 0,
      candidates: [],
      sympathetic: [],
      bribed: []
    });
  }

  // Returns true if all parties are ready, false otherwise.
  allReady(): boolean {
    for (let i = 0; i < this.parties.length; i++) {
      if (!this.parties[i].ready && !this.parties[i].eliminated) {
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
    });
    this.officials.forEach((pol) => {
      this.parties[this.pols[pol].party].push(this.pols[pol].id);
    })

    // Give all parties $7.5M and enough candidates to make one per province.
    this.parties.forEach((party, partyIndex) => {
      party.funds += 75;
      while (party.pols.length < this.provs.length) {
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
        const priority = (partyIndex - this.priority) % this.parties.length;
        const supportBonus = (countSoFar * this.parties.length + priority) /
            (this.provs.length * this.parties.length + 1);
        this.pols[polIndex].support = this.pols[polIndex].baseSupport +
            supportBonus;
      });
    });
  }

  ad(partyIndex: number, polIndex: number, provIndex: number): void {
    if (this.pols[polIndex].party === partyIndex
        && this.provs[provIndex].candidates.includes(polIndex)
        && this.parties[partyIndex].funds >= (3 + this.rounds)
        && this.stage === 1) {
      this.parties[partyIndex].funds -= (3 + this.rounds);
      this.pols[polIndex].support++;
    }
  }

  smear(partyIndex: number, polIndex: number, provIndex: number): void {
    if (this.pols[polIndex].party !== partyIndex
        && this.provs[provIndex].candidates.includes(polIndex)
        && this.parties[partyIndex].funds >= (2 + this.rounds)
        && this.pols[polIndex].support >= 1
        && this.stage === 1) {
      this.parties[partyIndex].funds -= (2 + this.rounds);
      this.pols[polIndex].support--;
    }
  }

  advanceRaceStage(): void {
    this.rounds++;
    if (this.rounds === 3) {
      this.beginVoting();
    }
  }

  beginVoting(): void {
    this.officials = [];
    
    // All remaining candidates become officials.
    this.provs.forEach((prov: Prov) => {
      prov.candidates.sort((a: number, b: number) => {
        return this.pols[b].support - this.pols[a].support;
      });
      for (let i = 0; i < prov.seats; i++) {
        this.officials.push(prov.candidates[i]);
      }
    });
    
    this.stage = 2;
    this.rounds = 0;
    this.resetVotes();

    // If there are no officials, skip to the next stage.
    if (this.officials.length === 0) {
      this.beginDistribution();
    } else if (this.officials.length === 1) {
      this.primeMinister = this.officials[0];
      this.beginDistribution();
    }
  }

  // Assign one vote from the given party to the given politician.
  vote(partyIndex: number, polIndex: number): void {
    if (this.parties[partyIndex].votes > 0
        && polIndex < this.officials.length
        && polIndex >= 0
        && this.stage === 2) {
      this.activeProv.officials[polIndex].votes++;
      this.parties[partyIndex].votes--;
    }
  }

  // Reset all officials' vote totals and parties' usable votes to 0, then give
  // all parties votes equal to the number of officials they have in the
  // prov.
  resetVotes(): void {
    this.parties.forEach((party)=> {
      party.votes = 0;
      party.sympathetic = [];
    });
    this.officials.forEach((polIndex) => {
      this.pols[polIndex].support = 0;
      this.parties[this.pols[polIndex].party].votes++;
    });
  }

  // Count each official's votes. If there is a winner, elect them and begin
  // distribution. Otherwise, start the voting again.
  tallyVotes(): void {
    let maxVotes: number = -1;
    let maxPolIndices: number[] = [];
    this.officials.forEach((polIndex) => {
      if (this.pols[polIndex].support > maxVotes) {
        maxPolIndices = [polIndex];
        maxVotes = this.pols[polIndex].support;
      } else if (this.pols[polIndex].support === maxVotes) {
        maxPolIndices.push(polIndex);
      }
    });

    // If the election was not disputed, elect the winner. If it was disputed
    // and this was the third voting round, elect the official belonging to the
    // highest-priority party. Otherwise, reset every politician's votes and
    // start again.
    if (maxPolIndices.length > 1) {
      this.rounds++;
      if (this.rounds < 3) {
        this.resetVotes();
      } else {
        let maxPol: number = maxPolIndices[0];
        let maxPriority: number = (this.pols[maxPol].party - this.priority) %
            this.parties.length;
        for (let i = 1; i < maxPolIndices.length; i++) {
          let priority = (this.pols[maxPolIndices[i]].party - this.priority) %
              this.parties.length;
          if (priority < maxPriority) {
            maxPol = maxPolIndices[i];
            maxPriority = priority;
          }
        }
        this.primeMinister = maxPol;
        this.beginDistribution();
      }
    } else {
      this.primeMinister = maxPolIndices[0];
      this.beginDistribution();
    }
  }

  beginDistribution(): void {
    this.activeProv.stage = 3;
  }

  checkIfGameWon(): void {
    for (let i = 0; i < this.provs.length; i++) {
      if (this.primeMinister !== null) {
        let primeMinisterParty: number = this.pols[this.primeMinister].party;
        this.parties[primeMinisterParty].funds += 10 * this.parties.length;
  
        if (this.suspender === primeMinisterParty) {
          this.ended = true;
        }
      }
    }
    
    // If someone suspended the constitution and failed, they lose the game.
    if (!this.ended && this.suspender !== null) {
      this.parties[this.suspender].eliminated = true;
      let numRemaining: number = 0;
      let remainingParty: number = 0;
      
      // If only one party remains, they win the game.
      this.parties.forEach((party, partyIndex) => {
        if (!party.eliminated) {
          numRemaining++;
          remainingParty = partyIndex;
        }
      });
      if (numRemaining === 1) {
        this.ended = true;
      }
    }
    
    // TODO: add bonuses and decline

    // If there was no winner, advance to the next prov and begin nomination.
    if (!this.ended) {
      this.beginNomination();
    }
  }

  // Pay the given amount of funds from party 1 to party 2.
  pay(partyIndex: number, paymentInfo): void {
    if (this.parties[partyIndex].funds > paymentInfo.amount
        && paymentInfo.target < this.parties.length
        && paymentInfo.target >= 0
        && !this.parties[paymentInfo.target].eliminated) {
      this.parties[partyIndex].funds -= paymentInfo.amount;
      this.parties[paymentInfo.target].funds += paymentInfo.amount;
    }
  }

  bribe(partyIndex: number, polIndex: number): void {
    const party = this.parties[partyIndex];
    if (party.sympathetic.length > 0
        && party.funds >= (2 + this.rounds) * 10
        && party.sympathetic.includes(polIndex)) {
      party.bribed.push(polIndex);
      party.sympathetic.splice(party.sympathetic.indexOf(polIndex), 1);
      party.funds -= (2 + this.rounds) * 10;
    }
  }

  // Transfer the symp from their old party to their new party.
  flip(partyIndex: number, polIndex: number): void {
    const party = this.parties[partyIndex];
    if (polIndex < this.pols.length && polIndex >= 0) {
      // Remove from their old party
      const oldParty = this.parties[this.pols[polIndex].party];
      oldParty.pols.splice(oldParty.pols.indexOf(polIndex), 1);
      
      // If they were an official, transfer their vote from their old party to
      // their new party
      if (this.officials.includes(polIndex) && this.stage === 2) {
        this.parties[this.pols[polIndex].party].votes--;
        party.votes++;
      }
      
      this.pols[polIndex].party = partyIndex;
      party.pols.push(polIndex);
      party.bribed.splice(party.bribed.indexOf(polIndex), 1);
    }
  }

  // Censor secret info so the gamestate can be sent to the client, and return
  // it so it can be retrieved later.
  setPov(pov: number): void {
    this.pov = pov;
    delete this.activeProv;   // no need to send
    const generator = this.generator;
    delete this.generator;

    // Delete the hidden information of other players
    const bribed = [];
    const sympathetic = [];
    const funds = [];
    for (let i = 0; i < this.parties.length; i++) {
      bribed.push(this.parties[i].bribed);
      sympathetic.push(this.parties[i].sympathetic);
      funds.push(this.parties[i].funds);
      if (i !== pov) {
        delete this.parties[i].bribed;
        delete this.parties[i].sympathetic;
        delete this.parties[i].funds;
      }
    }

    return {
      bribed: bribed,
      symps: sympathetic,
      funds: funds,
      generator: generator
    }
  }

  // Uncensor stored secret info.
  unsetPov(hiddenInfo): void {
    this.pov = -1;
    this.activeProv = this.provs[this.activeProvId];
    this.generator = hiddenInfo.generator;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].bribed = hiddenInfo.bribed[i];
      this.parties[i].sympathetic = hiddenInfo.symps[i];
      this.parties[i].funds = hiddenInfo.funds[i];
    }
  }
}

module.exports = GameState;
