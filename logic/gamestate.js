// @ts-ignore
var Generator = require('./content-generator');
// @ts-ignore
var GameState = /** @class */ (function () {
    function GameState(settings) {
        this.settings = settings;
        this.started = false;
        this.ended = false;
        this.priority = -1;
        this.pov = -1;
        this.turn = -1;
        this.rounds = -1;
        this.stage = 1;
        this.decline = -1;
        this.contentGenerator = new Generator.ContentGenerator(settings.nation);
        this.pols = [];
        this.parties = [];
        this.provs = this.contentGenerator.provs;
        this.officials = [];
        this.primeMinister = null;
        this.suspender = null;
    }
    GameState.prototype.addParty = function (name, abbr) {
        this.parties.push({
            name: name,
            abbr: abbr,
            ready: false,
            connected: true,
            funds: 0,
            votes: 0,
            baseSupport: 5,
            sympathetic: [],
            bribed: [],
            usedHit: false,
            pmChoice: false
        });
    };
    // Returns true if all parties are ready, false otherwise.
    GameState.prototype.allReady = function () {
        for (var i = 0; i < this.parties.length; i++) {
            if (!this.parties[i].ready) {
                return false;
            }
        }
        return true;
    };
    GameState.prototype.commitAll = function () {
        this.parties.forEach(function (party) {
            party.ready = false;
        });
        if (!this.started) {
            this.started = true;
            this.beginRace();
        }
        else if (this.stage === 1) {
            this.advanceRaceRound();
        }
        else if (this.stage === 2) {
            this.tallyVotes();
        }
        else if (this.stage === 3) {
            this.checkIfGameWon();
        }
    };
    /*
    ====
    RACE
    ====
    */
    GameState.prototype.beginRace = function () {
        // Increase decline and give priority to the prime minister's party (if
        // there is one) or party after the last party to have priority.
        if (this.primeMinister != null) {
            this.priority = this.pols[this.primeMinister].party;
        }
        else {
            this.priority = (this.priority + 1) % this.parties.length;
        }
        this.stage = 1;
        this.rounds = 0;
        this.decline += 1;
        // Give all parties $7.5M, and bonus money to the prime minister's party.
        this.parties.forEach(function (party) {
            party.funds += 75;
        });
        this.updateBaseSupport();
        this.givePmBonus();
        this.replenishCandidates();
        if (this.decline >= 1) {
            this.giveSympathizers(1);
        }
        this.officials = [];
        this.primeMinister = null;
    };
    // Return all officials to be candidates in their province with a +1 bonus to
    // support, then refill the province with candidates until each party has one
    // per seat.
    GameState.prototype.replenishCandidates = function () {
        var _this = this;
        this.provs.forEach(function (prov) {
            // Put all the officials back as candidates in their province.
            var returningCandidates = [];
            var returningPerParty = Array(_this.parties.length).fill(0);
            prov.candidates.forEach(function (polIndex) {
                if (_this.officials.includes(polIndex)) {
                    returningCandidates.push(polIndex);
                    var polParty = _this.pols[polIndex].party;
                    _this.pols[polIndex].support = _this.parties[polParty].baseSupport + 1;
                    returningPerParty[polParty] += 1;
                }
            });
            prov.candidates = returningCandidates;
            // Give each party news politician in the province until they have one
            // per seat.
            _this.parties.forEach(function (party, partyIndex) {
                while (returningPerParty[partyIndex] < prov.seats) {
                    var newPol = _this.contentGenerator.newPol(partyIndex);
                    var priorityNudge = returningPerParty[partyIndex] /
                        (_this.parties.length * prov.seats);
                    newPol.support = party.baseSupport + priorityNudge;
                    _this.pols.push(newPol);
                    prov.candidates.push(_this.pols.length - 1);
                    returningPerParty[partyIndex]++;
                }
            });
        });
    };
    // Assign each party a base support value, such that the highest-priority
    // parties have the lowest-priority candidates (when it comes to
    // tiebreakers in support). Regress parties with base support higher or lower
    // than 5 back to 5 by one.
    GameState.prototype.updateBaseSupport = function () {
        var _this = this;
        this.parties.forEach(function (party, partyIndex) {
            var previousSupport = Math.round(party.baseSupport);
            var partyPriority = (partyIndex - _this.priority +
                _this.parties.length) % _this.parties.length;
            if (previousSupport < 5) {
                previousSupport++;
            }
            else if (previousSupport > 5) {
                previousSupport--;
            }
            party.baseSupport = previousSupport +
                partyPriority / (_this.parties.length * 2);
        });
    };
    // Give a bonus to the party with the prime minister, if there is one,
    // depending on the amount of decline and the choice the player made.
    GameState.prototype.givePmBonus = function () {
        var numOtherParties = this.parties.length - 1;
        if (this.primeMinister != null) {
            var pmParty = this.parties[this.priority];
            if (this.decline == 0) {
                if (pmParty.pmChoice) {
                    pmParty.funds += 10 * numOtherParties;
                }
                else {
                    pmParty.baseSupport += 1;
                }
            }
            else if (this.decline == 1) {
                if (pmParty.pmChoice) {
                    pmParty.funds += 20 * numOtherParties;
                }
                else {
                    pmParty.baseSupport += 2;
                }
            }
            else if (pmParty.pmChoice) {
                pmParty.baseSupport += this.decline - 2;
                pmParty.funds += 30 * numOtherParties;
                this.suspender = this.priority;
            }
            else {
                this.suspender = null;
            }
        }
    };
    // Give the specified number of sympathizers to each player, but don't give
    // any player sympathizers from their own party or the party that suspended
    // the constitution.
    GameState.prototype.giveSympathizers = function (amountPerPlayer) {
        var _this = this;
        // Add all running politicians to the list of possible sympathizers.
        var runningPols = [];
        this.provs.forEach(function (prov) {
            prov.candidates.forEach(function (polIndex) {
                runningPols.push(polIndex);
            });
        });
        // Remove all candidates who are already bribed from the list of possible
        // sympathizers.
        this.parties.forEach(function (party) {
            party.bribed.forEach(function (polIndex) {
                runningPols.splice(runningPols.indexOf(polIndex), 1);
            });
        });
        // For each party, go down the list of possible sympathizers, skipping any
        // that are disqualified because they are in the same party, until a
        // sufficient number have been given or the end of the list has been
        // reached. Sympathizers are removed from the list when given.
        this.parties.forEach(function (party, partyIndex) {
            party.sympathetic = [];
            for (var i = 0; i < runningPols.length; i++) {
                var polParty = _this.pols[runningPols[i]].party;
                if (party.sympathetic.length < amountPerPlayer &&
                    (_this.primeMinister == null || polParty != _this.priority) &&
                    polParty !== partyIndex) {
                    party.sympathetic.push(runningPols[i]);
                    runningPols.splice(i, 1);
                    i--;
                }
            }
        });
    };
    // Advance to the next round of the race. If it has been 3 rounds, advance to
    // the voting stage.
    GameState.prototype.advanceRaceRound = function () {
        this.rounds++;
        if (this.rounds === 3) {
            this.beginVoting();
        }
    };
    /*
    ======
    VOTING
    ======
    */
    GameState.prototype.beginVoting = function () {
        var _this = this;
        this.officials = [];
        // The leading candidate in each province becomes an official.
        this.provs.forEach(function (prov) {
            prov.candidates.sort(function (a, b) {
                return _this.pols[b].support - _this.pols[a].support;
            });
            for (var i = 0; i < prov.seats && i < prov.candidates.length; i++) {
                _this.officials.push(prov.candidates[i]);
            }
        });
        this.stage = 2;
        this.rounds = 0;
        this.resetVotes();
        // If there are no officials, skip to the next stage.
        if (this.officials.length === 0) {
            this.beginDistribution();
        }
        else if (this.officials.length === 1) {
            this.primeMinister = this.officials[0];
            this.beginDistribution();
        }
    };
    // Reset all officials' vote totals and parties' usable votes to 0, then give
    // all parties votes equal to the number of officials they have in the
    // prov.
    GameState.prototype.resetVotes = function () {
        var _this = this;
        this.parties.forEach(function (party) {
            party.votes = 0;
            party.sympathetic = [];
        });
        this.officials.forEach(function (polIndex) {
            _this.pols[polIndex].support = 0;
            _this.parties[_this.pols[polIndex].party].votes++;
        });
    };
    // Count each official's votes. If there is a winner, elect them and begin
    // distribution. Otherwise, start the voting again.
    GameState.prototype.tallyVotes = function () {
        var _this = this;
        var maxVotes = -1;
        var maxPolIndices = [];
        this.officials.forEach(function (polIndex) {
            if (_this.pols[polIndex].support > maxVotes) {
                maxPolIndices = [polIndex];
                maxVotes = _this.pols[polIndex].support;
            }
            else if (_this.pols[polIndex].support === maxVotes) {
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
            }
            else {
                var maxPol = maxPolIndices[0];
                var maxPriority = (this.pols[maxPol].party - this.priority) %
                    this.parties.length;
                for (var i = 1; i < maxPolIndices.length; i++) {
                    var priority = (this.pols[maxPolIndices[i]].party - this.priority) %
                        this.parties.length;
                    if (priority < maxPriority) {
                        maxPol = maxPolIndices[i];
                        maxPriority = priority;
                    }
                }
                this.primeMinister = maxPol;
                this.beginDistribution();
            }
        }
        else {
            this.primeMinister = maxPolIndices[0];
            this.beginDistribution();
        }
    };
    /*
    ============
    DISTRIBUTION
    ============
    */
    GameState.prototype.beginDistribution = function () {
        this.stage = 3;
        this.parties.forEach(function (party) {
            party.pmChoice = false;
        });
    };
    // End the game if a player suspended the constitution and won prime minister
    // in the next race. If a player suspended the constitution and did not win,
    // remove all their funds and give them a penalty to support. If the game has
    // not ended, begin a new race.
    GameState.prototype.checkIfGameWon = function () {
        if (this.suspender === this.priority) {
            this.ended = true;
        }
        else if (this.suspender !== null) {
            this.parties[this.suspender].baseSupport = 2; // becomes 3 before race
            this.parties[this.suspender].funds = 0;
        }
        // If there was no winner, advance to the next prov and begin nomination.
        if (!this.ended) {
            this.beginRace();
        }
    };
    /*
    ========================
    ACTIONS PLAYERS CAN TAKE
    ========================
    */
    // Pay the given amount of funds from party 1 to party 2.
    GameState.prototype.pay = function (partyIndex, paymentInfo) {
        if (this.parties[partyIndex].funds > paymentInfo.amount &&
            paymentInfo.target < this.parties.length &&
            paymentInfo.target >= 0) {
            this.parties[partyIndex].funds -= paymentInfo.amount;
            this.parties[paymentInfo.target].funds += paymentInfo.amount;
        }
    };
    // Buy an ad for the given politician, increasing their support.
    GameState.prototype.ad = function (partyIndex, polIndex) {
        if (this.pols[polIndex].party === partyIndex &&
            this.parties[partyIndex].funds >= (3 + this.rounds) &&
            this.stage === 1) {
            this.parties[partyIndex].funds -= (3 + this.rounds);
            this.pols[polIndex].support += 1;
        }
    };
    // Smear the given politician, decreasing their support.
    GameState.prototype.smear = function (partyIndex, polIndex) {
        if (this.pols[polIndex].party !== partyIndex &&
            this.parties[partyIndex].funds >= 2 + this.rounds &&
            this.pols[polIndex].support >= 1 &&
            this.stage === 1) {
            this.parties[partyIndex].funds -= 2 + this.rounds;
            this.pols[polIndex].support -= 1;
        }
    };
    // Bribe the given politician, making them a member of your party.
    GameState.prototype.bribe = function (partyIndex, polIndex) {
        var party = this.parties[partyIndex];
        if (party.sympathetic.length > 0 &&
            party.funds >= 25 + 10 * this.rounds &&
            party.sympathetic.includes(polIndex)) {
            party.bribed.push(polIndex);
            party.sympathetic.splice(party.sympathetic.indexOf(polIndex), 1);
            party.funds -= 25 + 10 * this.rounds;
        }
    };
    // Transfer the symp from their old party to their new party.
    GameState.prototype.flip = function (partyIndex, polIndex) {
        var party = this.parties[partyIndex];
        if (party.bribed.includes(polIndex) && this.stage >= 2) {
            // If they were an official, transfer their vote from their old party to
            // their new party
            if (this.officials.includes(polIndex) && this.stage === 2) {
                this.parties[this.pols[polIndex].party].votes--;
                party.votes++;
            }
            this.pols[polIndex].party = partyIndex;
            party.bribed.splice(party.bribed.indexOf(polIndex), 1);
        }
    };
    // Call a hit the given politician, removing them from the game.
    GameState.prototype.hit = function (partyIndex, polIndex) {
        var cost = this.stage >= 2 ? 50 : 25;
        var party = this.parties[partyIndex];
        if (party.funds >= cost &&
            this.decline >= 2 &&
            !party.usedHit &&
            this.pols[polIndex].party !== this.suspender) {
            if (this.officials.includes(polIndex)) {
                this.officials.splice(this.officials.indexOf(polIndex), 1);
            }
            this.provs.forEach(function (prov) {
                if (prov.candidates.includes(polIndex)) {
                    prov.candidates.splice(prov.candidates.indexOf(polIndex), 1);
                    party.funds -= cost;
                    party.usedHit = true;
                }
            });
        }
    };
    // Assign one vote from the given party to the given politician.
    GameState.prototype.vote = function (partyIndex, polIndex) {
        if (this.parties[partyIndex].votes > 0 &&
            polIndex < this.pols.length &&
            polIndex >= 0 &&
            this.stage === 2) {
            this.pols[polIndex].support += 1;
            this.parties[partyIndex].votes--;
        }
    };
    // Choose between the two prime minister options.
    GameState.prototype.choose = function (partyIndex, choice) {
        this.parties[partyIndex].pmChoice = choice;
    };
    // Censor secret info so the gamestate can be sent to the client, and return
    // it so it can be retrieved later.
    GameState.prototype.setPov = function (pov) {
        this.pov = pov;
        var contentGenerator = this.contentGenerator;
        delete this.contentGenerator;
        // Delete the hidden information of other players
        var bribed = [];
        var sympathetic = [];
        var funds = [];
        for (var i = 0; i < this.parties.length; i++) {
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
        };
    };
    // Uncensor stored secret info.
    GameState.prototype.unsetPov = function (hiddenInfo) {
        this.pov = undefined;
        this.contentGenerator = hiddenInfo.contentGenerator;
        for (var i = 0; i < this.parties.length; i++) {
            this.parties[i].bribed = hiddenInfo.bribed[i];
            this.parties[i].sympathetic = hiddenInfo.sympathetic[i];
            this.parties[i].funds = hiddenInfo.funds[i];
        }
    };
    return GameState;
}());
module.exports = {
    GameState: GameState,
    HiddenInfo: this.HiddenInfo
};
