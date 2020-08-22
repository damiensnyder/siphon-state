// @ts-ignore
const App = require('./app');
// @ts-ignore
const GameRoom = require('./logic/game-room');

function setAllPartiesToDisconnected(gs) {
  gs.parties.forEach((party) => {
    party.connected = false;
  });
}

function twoPartiesStart(): void {
  const game = new GameRoom(App.gameManager.io, {
    name: "two parties start",
    gameCode: "2ps",
    nation: "Kenderland",
    private: false
  }, () => {});
  
  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);

  App.gameManager.addTestGame(game);
}

function twoPartiesEnd(): void {
  const game = new GameRoom(App.gameManager.io, {
    name: "two parties end",
    gameCode: "2pe",
    nation: "Otria",
    private: false
  }, () => {});

  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);
  game.gs.ended = true;

  App.gameManager.addTestGame(game);
}

function twoPartiesThreeDecline(): void {
  const game = new GameRoom(App.gameManager.io, {
    name: "two parties end",
    gameCode: "2p3d",
    nation: "Kenderland",
    private: false
  }, () => {});

  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);
  game.gs.decline = 3;

  App.gameManager.addTestGame(game);
}

function threePartiesStart(): void {
  const game = new GameRoom(App.gameManager.io, {
    name: "three parties start",
    gameCode: "3ps",
    nation: "Otria",
    private: false
  }, () => {});
  
  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.addParty("party 3", "P3");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);

  App.gameManager.addTestGame(game);
}

function fourPartiesStart(): void {
  const game = new GameRoom(App.gameManager.io, {
    name: "four parties start",
    gameCode: "4ps",
    nation: "Otria",
    private: false
  }, () => {});
  
  game.gs.addParty("party 1", "P1");
  game.gs.addParty("party 2", "P2");
  game.gs.addParty("party 3", "P3");
  game.gs.addParty("party 4", "P4");
  game.gs.commitAll();
  setAllPartiesToDisconnected(game.gs);

  App.gameManager.addTestGame(game);
}

const startTime = (new Date()).getUTCSeconds();
twoPartiesStart();
twoPartiesThreeDecline();
twoPartiesEnd();
threePartiesStart();
fourPartiesStart();
const endTime = (new Date()).getUTCSeconds();
console.log(`Created test games in ${(endTime - startTime) / 1000}s`);
