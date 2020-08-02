const gm = require('./app.js');
const Game = require('../logic/game-room.js');

function twoPartiesStart() {
  const game = new Game(gm.io, {
    name: "two parties start",
    gameCode: "2ps",
    private: false
  }, () => {});
  
  game.gs.addParty()
}
