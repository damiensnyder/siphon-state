class GamestateManager {
  constructor() {
    this.gs = {
      parties: [],
      pov: -1,
      started: false,
      ended: false
    };
    this.actionQueue = [];
  }

  setGs(gs) {
    this.gs = gs;
    this.actionQueue = [];
  }

  updateAfter(type, actionInfo) {
    
  }
}

export default GamestateManager;
