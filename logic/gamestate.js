// @ts-ignore
var generator = require('./content-generator');
var GameState = /** @class */ (function () {
    function GameState(settings) {
        this.settings = settings;
        this.started = false;
        this.ended = false;
        this.priority = -1;
        this.pov = -1;
        this.turn = -1;
        this.rounds = 0;
        this.stage = 0;
        this.decline = -1;
        this.contentGenerator = new generator.ContentGenerator(settings.nation);
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
            eliminated: false,
            connected: true,
            funds: 0,
            votes: 0,
            pols: [],
            sympathetic: [],
            bribed: [],
            usedHit: false
        });
    };
    // Returns true if all parties are ready, false otherwise.
    GameState.prototype.allReady = function () {
        for (var i = 0; i < this.parties.length; i++) {
            if (!this.parties[i].ready && !this.parties[i].eliminated) {
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
            this.beginNomination();
        }
        else if (this.stage === 0) {
            this.beginRace();
        }
        else if (this.stage === 1) {
            this.advanceRaceStage();
        }
        else if (this.stage === 2) {
            this.tallyVotes();
        }
        else if (this.stage === 3) {
            this.checkIfGameWon();
        }
    };
    // Advance to the next province and begin the nomination stage in the new
    // province.
    GameState.prototype.beginNomination = function () {
        var _this = this;
        // Advance to the next province.
        if (this.primeMinister !== null) {
            this.priority = this.pols[this.primeMinister].party;
        }
        this.priority = (this.priority + 1) % this.parties.length;
        this.stage = 0;
        this.decline += 1;
        // Reset all parties' candidates.
        this.parties.forEach(function (party) {
            party.pols = [];
        });
        this.provs.forEach(function (prov) {
            prov.candidates.forEach(function (polIndex) {
                _this.parties[_this.pols[polIndex].party].pols.push(polIndex);
            });
            prov.candidates = [];
        });
        this.officials.forEach(function (polIndex) {
            _this.parties[_this.pols[polIndex].party].pols.push(polIndex);
        });
        // Give all parties $7.5M and enough candidates to make one per province.
        this.parties.forEach(function (party, partyIndex) {
            party.funds += 75;
            while (party.pols.length < _this.provs.length) {
                _this.pols.push(_this.contentGenerator.newPol(partyIndex));
                party.pols.push(_this.pols.length - 1);
            }
        });
        this.officials = [];
        this.primeMinister = null;
    };
    // The given politician becomes a candidate in the chosen province.
    GameState.prototype.run = function (partyIndex, runInfo) {
        var party = this.parties[partyIndex];
        if (party.pols.length > 0
            && party.funds >= 5
            && runInfo.polIndex < this.parties[partyIndex].pols.length
            && runInfo.polIndex >= 0) {
            this.provs[runInfo.provIndex].candidates.push(party.pols[runInfo.polIndex]);
        }
    };
    GameState.prototype.beginRace = function () {
        var _this = this;
        this.stage = 1;
        this.rounds = 0;
        // Assign each candidate a priority value
        var countSoFar = Array(this.parties.length).fill(0);
        this.provs.forEach(function (prov) {
            prov.candidates.forEach(function (polIndex) {
                var partyIndex = _this.pols[polIndex].party;
                var priority = (partyIndex - _this.priority) % _this.parties.length;
                var supportBonus = (countSoFar[partyIndex] * _this.parties.length +
                    priority) / (_this.provs.length * _this.parties.length + 1);
                _this.pols[polIndex].support = _this.pols[polIndex].baseSupport +
                    supportBonus;
            });
        });
    };
    GameState.prototype.ad = function (partyIndex, polIndex) {
        if (this.pols[polIndex].party === partyIndex
            && this.parties[partyIndex].funds >= (3 + this.rounds)
            && this.stage === 1) {
            this.parties[partyIndex].funds -= (3 + this.rounds);
            this.pols[polIndex].support++;
        }
    };
    GameState.prototype.smear = function (partyIndex, polIndex) {
        if (this.pols[polIndex].party !== partyIndex
            && this.parties[partyIndex].funds >= (2 + this.rounds)
            && this.pols[polIndex].support >= 1
            && this.stage === 1) {
            this.parties[partyIndex].funds -= (2 + this.rounds);
            this.pols[polIndex].support--;
        }
    };
    GameState.prototype.advanceRaceStage = function () {
        this.rounds++;
        if (this.rounds === 3) {
            this.beginVoting();
        }
    };
    GameState.prototype.beginVoting = function () {
        var _this = this;
        this.officials = [];
        // All remaining candidates become officials.
        this.provs.forEach(function (prov) {
            prov.candidates.sort(function (a, b) {
                return _this.pols[b].support - _this.pols[a].support;
            });
            for (var i = 0; i < prov.seats; i++) {
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
    // Assign one vote from the given party to the given politician.
    GameState.prototype.vote = function (partyIndex, polIndex) {
        if (this.parties[partyIndex].votes > 0
            && polIndex < this.officials.length
            && polIndex >= 0
            && this.stage === 2) {
            this.pols[polIndex].support++;
            this.parties[partyIndex].votes--;
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
            }
        }
        else {
            this.primeMinister = maxPolIndices[0];
        }
        this.beginDistribution();
    };
    GameState.prototype.beginDistribution = function () {
        this.stage = 3;
    };
    GameState.prototype.checkIfGameWon = function () {
        for (var i = 0; i < this.provs.length; i++) {
            if (this.primeMinister !== null) {
                var primeMinisterParty = this.pols[this.primeMinister].party;
                this.parties[primeMinisterParty].funds += 10 * this.parties.length;
                if (this.suspender === primeMinisterParty) {
                    this.ended = true;
                }
            }
        }
        // If someone suspended the constitution and failed, they lose the game.
        if (!this.ended && this.suspender !== null) {
            this.parties[this.suspender].eliminated = true;
            var numRemaining_1 = 0;
            var remainingParty_1 = 0;
            // If only one party remains, they win the game.
            this.parties.forEach(function (party, partyIndex) {
                if (!party.eliminated) {
                    numRemaining_1++;
                    remainingParty_1 = partyIndex;
                }
            });
            if (numRemaining_1 === 1) {
                this.ended = true;
            }
        }
        // TODO: add bonuses and decline
        // If there was no winner, advance to the next prov and begin nomination.
        if (!this.ended) {
            this.beginNomination();
        }
    };
    // Pay the given amount of funds from party 1 to party 2.
    GameState.prototype.pay = function (partyIndex, paymentInfo) {
        if (this.parties[partyIndex].funds > paymentInfo.amount
            && paymentInfo.target < this.parties.length
            && paymentInfo.target >= 0
            && !this.parties[paymentInfo.target].eliminated) {
            this.parties[partyIndex].funds -= paymentInfo.amount;
            this.parties[paymentInfo.target].funds += paymentInfo.amount;
        }
    };
    GameState.prototype.bribe = function (partyIndex, polIndex) {
        var party = this.parties[partyIndex];
        if (party.sympathetic.length > 0
            && party.funds >= 25 + 10 * this.rounds
            && party.sympathetic.includes(polIndex)) {
            party.bribed.push(polIndex);
            party.sympathetic.splice(party.sympathetic.indexOf(polIndex), 1);
            party.funds -= 25 + 10 * this.rounds;
        }
    };
    GameState.prototype.hit = function (partyIndex, polIndex) {
        var party = this.parties[partyIndex];
        if (!party.usedHit
            && party.funds >= 25
            && this.stage === 2
            && this.officials.includes(polIndex)
            && this.pols[polIndex].party !== this.suspender) {
            party.funds -= 25;
            party.usedHit = true;
            this.officials.splice(this.officials.indexOf(polIndex), 1);
        }
    };
    // Transfer the symp from their old party to their new party.
    GameState.prototype.flip = function (partyIndex, polIndex) {
        var party = this.parties[partyIndex];
        if (polIndex < this.pols.length && polIndex >= 0
            && this.stage >= 2) {
            // Remove from their old party
            var oldParty = this.parties[this.pols[polIndex].party];
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
        this.pov = -1;
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
