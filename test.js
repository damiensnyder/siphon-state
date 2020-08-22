// @ts-ignore
var App = require('./app');
// @ts-ignore
var GameRoom = require('./logic/game-room');
function setAllPartiesToDisconnected(gs) {
    gs.parties.forEach(function (party) {
        party.connected = false;
    });
}
function twoPartiesStart() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties start",
        gameCode: "2ps",
        nation: "Kallavur",
        private: false
    }, function () { });
    game.gs.addParty("party 1", "P1");
    game.gs.addParty("party 2", "P2");
    game.gs.commitAll();
    setAllPartiesToDisconnected(game.gs);
    App.gameManager.addTestGame(game);
}
function twoPartiesEnd() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties end",
        gameCode: "2pe",
        nation: "Kallavur",
        private: false
    }, function () { });
    game.gs.addParty("party 1", "P1");
    game.gs.addParty("party 2", "P2");
    game.gs.commitAll();
    setAllPartiesToDisconnected(game.gs);
    game.gs.ended = true;
    App.gameManager.addTestGame(game);
}
function twoPartiesThreeDecline() {
    var game = new GameRoom(App.gameManager.io, {
        name: "two parties end",
        gameCode: "2p3d",
        nation: "Kallavur",
        private: false
    }, function () { });
    game.gs.addParty("party 1", "P1");
    game.gs.addParty("party 2", "P2");
    game.gs.commitAll();
    setAllPartiesToDisconnected(game.gs);
    game.gs.decline = 3;
    App.gameManager.addTestGame(game);
}
function threePartiesStart() {
    var game = new GameRoom(App.gameManager.io, {
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
    App.gameManager.addTestGame(game);
}
function fourPartiesStart() {
    var game = new GameRoom(App.gameManager.io, {
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
    App.gameManager.addTestGame(game);
}
var startTime = (new Date()).getUTCSeconds();
twoPartiesStart();
twoPartiesThreeDecline();
twoPartiesEnd();
threePartiesStart();
fourPartiesStart();
var endTime = (new Date()).getUTCSeconds();
console.log("Created test games in " + (endTime - startTime) / 1000 + "s");
