// @ts-ignore
var App = require('./app');
// @ts-ignore
var GameRoom = require('./logic/game-room');
// Add the specified number of parties to the game, and set all of them to
// disconnected.
function addParties(gs, numParties) {
    for (var i = 1; i <= numParties; i++) {
        gs.addParty("party " + i, "P" + i);
    }
    gs.commitAll();
    gs.parties.forEach(function (party) {
        party.connected = false;
    });
}
function twoPartiesStart() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties start",
        gameCode: "2ps",
        nation: "Kenderland",
        private: false
    }, function () { });
    addParties(game.gs, 2);
    App.gameManager.addTestGame(game);
}
function twoPartiesEnd() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties end",
        gameCode: "2pe",
        nation: "Otria",
        private: false
    }, function () { });
    addParties(game.gs, 2);
    App.gameManager.addTestGame(game);
}
function twoPartiesVoting() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties voting",
        gameCode: "2pv",
        nation: "Kenderland",
        private: false
    }, function () { });
    addParties(game.gs, 2);
    game.gs.commitAll();
    game.gs.commitAll();
    game.gs.commitAll();
    App.gameManager.addTestGame(game);
}
function twoPartiesTwoDecline() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties two decline",
        gameCode: "2p2d",
        nation: "Kenderland",
        private: false
    }, function () { });
    addParties(game.gs, 2);
    game.gs.decline = 2;
    game.gs.parties.forEach(function (party) {
        party.hitAvailable = true;
    });
    App.gameManager.addTestGame(game);
}
function threePartiesStart() {
    var game = new GameRoom(App.gameManager.io, {
        name: "three parties start",
        gameCode: "3ps",
        nation: "Otria",
        private: false
    }, function () { });
    addParties(game.gs, 3);
    App.gameManager.addTestGame(game);
}
function fourPartiesStart() {
    var game = new GameRoom(App.gameManager.io, {
        name: "four parties start",
        gameCode: "4ps",
        nation: "Otria",
        private: false
    }, function () { });
    addParties(game.gs, 4);
    App.gameManager.addTestGame(game);
}
var startTime = (new Date()).getUTCSeconds();
twoPartiesStart();
twoPartiesVoting();
twoPartiesTwoDecline();
twoPartiesEnd();
threePartiesStart();
fourPartiesStart();
var endTime = (new Date()).getUTCSeconds();
console.log("Created test games in " + (endTime - startTime) / 1000 + "s");
