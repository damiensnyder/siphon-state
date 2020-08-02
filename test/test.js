const gm = require('./app.js');
const Game = require('../logic/game-room.js');

function setAllPartiesToDisconnected(gs) {
  for (let i = 0; i < gs.parties.length; i++) {
    gs.parties[i].connected = false;
  }
}

function twoPartiesStart() {
  const game = new Game(gm.io, {
    name: "two parties start",
    gameCode: "2ps",
    private: false
  }, () => {});
  
  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);
  
  gm.addTestGame('2ps', game);
}

function threePartiesStart() {
  const game = new Game(gm.io, {
    name: "three parties start",
    gameCode: "3ps",
    private: false
  }, () => {});
  
  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.addParty("party 3", "P3");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);
  
  gm.addTestGame('3ps', game);
}

function fourPartiesStart() {
  const game = new Game(gm.io, {
    name: "four parties start",
    gameCode: "4ps",
    private: false
  }, () => {});
  
  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.addParty("party 3", "P3");
  game.gs.addParty("party 4", "P4");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);
  
  gm.addTestGame('4ps', game);
}

const startTime = new Date();
twoPartiesStart();
threePartiesStart();
fourPartiesStart();
console.log("Time to create test games: " + ((new Date() - startTime) / 1000));
