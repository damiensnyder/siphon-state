var app = require('./app');
var GameRoom = require('./logic/game-room');
function setAllPartiesToDisconnected(gs) {
    gs.parties.forEach(function (party) {
        party.connected = false;
    });
}
function twoPartiesStart() {
    var game = new GameRoom(app.gameManager.io, {
        name: "two parties start",
        gameCode: "2ps",
        nation: "Kallavur",
        private: false
    }, function () { });
    game.gs.addParty("party 1", "P1");
    game.gs.addParty("party 2", "P2");
    game.gs.commitAll();
    setAllPartiesToDisconnected(game.gs);
    app.gameManager.addTestGame('2ps', game);
}
function threePartiesStart() {
    var game = new GameRoom(app.gameManager.io, {
        name: "three parties start",
        gameCode: "3ps",
        nation: "Kallavur",
        private: false
    }, function () { });
    game.gs.addParty("party 1", "P1");
    game.gs.addParty("party 2", "P2");
    game.gs.addParty("party 3", "P3");
    game.gs.commitAll();
    setAllPartiesToDisconnected(game.gs);
    app.gameManager.addTestGame('3ps', game);
}
function fourPartiesStart() {
    var game = new GameRoom(app.gameManager.io, {
        name: "four parties start",
        gameCode: "4ps",
        nation: "Kallavur",
        private: false
    }, function () { });
    game.gs.addParty("party 1", "P1");
    game.gs.addParty("party 2", "P2");
    game.gs.addParty("party 3", "P3");
    game.gs.addParty("party 4", "P4");
    game.gs.commitAll();
    setAllPartiesToDisconnected(game.gs);
    app.gameManager.addTestGame('4ps', game);
}
var startTime = (new Date()).getUTCSeconds();
(new Date()).getUTCSeconds();
twoPartiesStart();
threePartiesStart();
fourPartiesStart();
var endTime = (new Date()).getUTCSeconds();
console.log("Created test games in " + (endTime - startTime) / 1000 + "s");
