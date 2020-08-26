// @ts-ignore
const Generator = require('./content-generator');

interface Party {
  name: string,
  abbr: string,
  ready: boolean,
  connected: boolean,
  funds: number,
  votes: number,
  pols: number[],
  sympathetic: number[],
  bribed: number[],
  usedHit: boolean
}

interface HiddenInfo {
  bribed: number[][],
  sympathetic: number[][],
  funds: number[],
  contentGenerator: typeof Generator
}

// @ts-ignore
class GameState {
  started: boolean;
  ended: boolean;
  priority: number;
  pov: number;
  turn: number;
  rounds: number;
  stage: number;
  decline: number;
  
  pols: typeof Generator.Pol[];
  parties: Party[];
  provs: typeof Generator.Prov[];
  officials: number[];
  primeMinister: number;
  suspender: number;
  settings: any;
  contentGenerator: typeof Generator;

  constructor(settings) {
    this.settings = settings;
    this.started = false;
    this.ended = false;
    this.priority = -1;
    this.pov = -1;
    this.turn = -1;
    this.rounds = 0;
    this.stage = 0;
    this.decline = 0;
    
    this.contentGenerator = new Generator.ContentGenerator(settings.nation);
  
    this.pols = [];
    this.parties = [];
    this.provs = this.contentGenerator.provs;
    this.officials = [];
    this.primeMinister = null;
    this.suspender = null;
  }

  addParty(name: string, abbr: string): void {
    this.parties.push({
      name: name,
      abbr: abbr,
      ready: false,
      connected: true,
      funds: 0,
      votes: 0,
      pols: [],
      sympathetic: [],
      bribed: [],
      usedHit: false
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
      this.beginRace();
    } else if (this.stage === 1) {
      this.advanceRaceStage();
    } else if (this.stage === 2) {
      this.tallyVotes();
    } else if (this.stage === 3) {
      this.checkIfGameWon();
    }
  }

  /*
  ====
  RACE
  ====
  */

  beginRace(): void {
    // Increase decline and give priority to the prime minister's party (if
    // there is one) or party after the last party to have priority.
    if (this.primeMinister != null) {
      this.priority = this.pols[this.primeMinister].party;
    } else {
      this.priority = (this.priority + 1) % this.parties.length;
    }
    this.stage = 0;

    // Put all the officials back as candidates in their province.
    this.provs.forEach((prov: Prov) => {
      const returningCandidates = [];
      let incumbentParty = -1;
      prov.candidates.forEach((polIndex: number) => {
        if (this.officials.includes(polIndex)) {
          returningCandidates.push(polIndex);
          this.pols[polIndex].support = this.pols[polIndex].baseSupport + 1;
          incumbentParty = this.pols[polIndex].party;
        }
      });
      prov.candidates = returningCandidates;

      // Give each party without an incumbent a new pol in the province.
      for (let i = 0; i < this.parties.length; i++) {
        if (i != incumbentParty) {
          const newPol = this.contentGenerator.newPol(i)
          this.pols.push(newPol);
          newPol.support = newPol.baseSupport;
          prov.candidates.push(this.pols.length - 1);
        }
      }
    });
    this.officials = [];

    // Give all parties $7.5M, and bonus money to the prime minister's party.
    this.parties.forEach((party: Party) => {
      party.funds += 75;

      // Give the party with the prime minister an extra bonus.
      if (this.primeMinister != null) {
        const pmParty = this.parties[this.priority];
        pmParty.funds += 5 * this.decline;
      }
    });

    this.updatePriority();

    if (this.decline >= 1) {
      this.giveSympathizers(1);
    }

    this.stage = 1;
    this.rounds = 0;
    this.primeMinister = null;
  }

  // Assign each candidate a priority value, such that the highest-priority
  // parties have the lowest-priority candidates (when it comes to
  // tiebreakers in support).
  updatePriority(): void {
    const countSoFar: number[] = Array(this.parties.length).fill(0);
    this.provs.forEach((prov: Prov) => {
      prov.candidates.forEach((polIndex: number) => {
        const pol: Pol = this.pols[polIndex];
        const partyIndex: number = pol.party;
        const priority = (partyIndex - this.priority) % this.parties.length;
        let supportBonus = (countSoFar[partyIndex] * this.parties.length +
            priority) / (this.provs.length * this.parties.length + 1);

        pol.support += supportBonus;
      });
    });
  }

  // Give the specified number of sympathizers to each player, but don't give
  // any player sympathizers from their own party or the party that suspended
  // the constitution.
  giveSympathizers(amountPerPlayer: number): void {
    // Add all running politicians to the list of possible sympathizers.
    const runningPols = [];
    this.provs.forEach((prov) => {
      prov.candidates.forEach((polIndex) => {
        runningPols.push(polIndex);
      });
    });

    // Remove all candidates who are already bribed from the list of possible
    // sympathizers.
    this.parties.forEach((party: Party) => {
      party.bribed.forEach((polIndex: number) => {
        runningPols.splice(runningPols.indexOf(polIndex), 1);
      });
    });

    // For each party, go down the list of possible sympathizers, skipping any
    // that are disqualified because they are in the same party, until a
    // sufficient number have been given or the end of the list has been
    // reached. Sympathizers are removed from the list when given.
    this.parties.forEach((party: Party, partyIndex: number) => {
      party.sympathetic = [];
      for (let i = 0; i < runningPols.length; i++) {
        const polParty = this.pols[runningPols[i]].party
        if (party.sympathetic.length < amountPerPlayer &&
            (this.primeMinister == null ||
             polParty != this.pols[this.primeMinister].party) &&
            polParty !== partyIndex) {
          party.sympathetic.push(runningPols[i]);
          runningPols.splice(i, 1);
          i--;
        }
      }
    });
  }

  advanceRaceStage(): void {
    this.rounds++;
    if (this.rounds === 3) {
      this.beginVoting();
    }
  }

  /*
  ======
  VOTING
  ======
  */

  beginVoting(): void {
    this.officials = [];
    
    // The leading candidate in each province becomes an official.
    this.provs.forEach((prov) => {
      prov.candidates.sort((a: number, b: number) => {
        return this.pols[b].support - this.pols[a].support;
      });
      for (let i = 0; i < prov.seats && i < prov.candidates.length; i++) {
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

  /*
  ============
  DISTRIBUTION
  ============
  */

  beginDistribution(): void {
    this.stage = 3;
  }

  checkIfGameWon(): void {
    if (this.primeMinister != null &&
        this.suspender === this.pols[this.primeMinister].party) {
      this.ended = true;
    }

    // Advance decline and set suspender after 3 rounds of decline
    this.decline += 1;
    if (this.decline >= 3 && this.primeMinister != null) {
      this.suspender = this.pols[this.primeMinister].party;
    }

    // If there was no winner, advance to the next prov and begin nomination.
    if (!this.ended) {
      this.beginRace();
    }
  }

  /*
  ========================
  ACTIONS PLAYERS CAN TAKE
  ========================
  */

  // Pay the given amount of funds from party 1 to party 2.
  pay(partyIndex: number, paymentInfo): void {
    if (this.parties[partyIndex].funds > paymentInfo.amount && 
        paymentInfo.target < this.parties.length && 
        paymentInfo.target >= 0) {
      this.parties[partyIndex].funds -= paymentInfo.amount;
      this.parties[paymentInfo.target].funds += paymentInfo.amount;
    }
  }

  // Buy an ad for the given politician, increasing their support.
  ad(partyIndex: number, polIndex: number): void {
    if (this.pols[polIndex].party === partyIndex &&
        this.parties[partyIndex].funds >= (3 + this.rounds) &&
        this.stage === 1) {
      this.parties[partyIndex].funds -= (3 + this.rounds);
      this.pols[polIndex].support += 1;
    }
  }

  // Smear the given politician, decreasing their support.
  smear(partyIndex: number, polIndex: number): void {
    if (this.pols[polIndex].party !== partyIndex &&
        this.parties[partyIndex].funds >= 2 + this.rounds &&
        this.pols[polIndex].support >= 1 &&
        this.stage === 1) {
      this.parties[partyIndex].funds -= 2 + this.rounds;
      this.pols[polIndex].support -= 1;
    }
  }

  // Bribe the given politician, making them a member of your party.
  bribe(partyIndex: number, polIndex: number): void {
    const party: Party = this.parties[partyIndex];
    if (party.sympathetic.length > 0 && 
        party.funds >= 25 + 10 * this.rounds && 
        party.sympathetic.includes(polIndex)) {
      party.bribed.push(polIndex);
      party.sympathetic.splice(party.sympathetic.indexOf(polIndex), 1);
      party.funds -= 25 + 10 * this.rounds;
    }
  }

  // Transfer the symp from their old party to their new party.
  flip(partyIndex: number, polIndex: number): void {
    const party = this.parties[partyIndex];
    if (party.bribed.includes(polIndex) && this.stage >= 2) {
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

  // Call a hit the given politician, removing them from the game.
  hit(partyIndex: number, polIndex: number) {
    const cost = this.stage >= 2 ? 50 : 25;
    const party = this.parties[partyIndex]
    if (party.funds >= cost &&
        this.decline >= 2 &&
        !party.usedHit &&
        this.pols[polIndex].party !== this.suspender) {
      if (this.officials.includes(polIndex)) {
        this.officials.splice(this.officials.indexOf(polIndex), 1);
      }
      this.provs.forEach((prov) => {
        if (prov.candidates.includes(polIndex)) {
          prov.candidates.splice(prov.candidates.indexOf(polIndex), 1);
          party.funds -= cost;
          party.usedHit = true;
        }
      })
    }
  }

  // Assign one vote from the given party to the given politician.
  vote(partyIndex: number, polIndex: number): void {
    if (this.parties[partyIndex].votes > 0 &&
        polIndex < this.pols.length &&
        polIndex >= 0 &&
        this.stage === 2) {
      this.pols[polIndex].support += 1;
      this.parties[partyIndex].votes--;
    }
  }

  // Censor secret info so the gamestate can be sent to the client, and return
  // it so it can be retrieved later.
  setPov(pov: number): HiddenInfo {
    this.pov = pov;
    const contentGenerator: typeof Generator = this.contentGenerator;
    delete this.contentGenerator;

    // Delete the hidden information of other players
    const bribed: number[][] = [];
    const sympathetic: number[][] = [];
    const funds: number[] = [];
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
      sympathetic: sympathetic,
      funds: funds,
      contentGenerator: contentGenerator
    }
  }

  // Uncensor stored secret info.
  unsetPov(hiddenInfo: HiddenInfo): void {
    this.pov = undefined;
    this.contentGenerator = hiddenInfo.contentGenerator;

    for (let i = 0; i < this.parties.length; i++) {
      this.parties[i].bribed = hiddenInfo.bribed[i];
      this.parties[i].sympathetic = hiddenInfo.sympathetic[i];
      this.parties[i].funds = hiddenInfo.funds[i];
    }
  }
}

module.exports = {
  GameState: GameState,
  HiddenInfo: this.HiddenInfo
};
