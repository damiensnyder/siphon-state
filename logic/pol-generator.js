const fs = require('fs');
const path = require('path');
const polsPath = path.resolve(__dirname, 'pols.json');
const pols = JSON.parse(fs.readFileSync(polsPath)).pols;

class PolGenerator {
  constructor() {
    this.unused = pols.slice();
    this.shuffle(this.unused);
    this.resets = 0;
  }

  newPol(party) {
    if (this.unused.length == 0) {
      this.redeal();
    }
    const newPol = this.unused.pop();
    newPol.party = party;
    return newPol;
  }

  redeal() {
    this.unused = info.pols.slice();
    this.shuffle(this.unused);
    this.resets++;
    for (let i = 0; i < this.unused.length; i++) {
      const repeatPol = {};
      repeatPol.id = this.unused[i].id + this.unused.length * this.resets;
      repeatPol.name = this.unused[i].name + " " + this.resets;
      this.unused[i] = repeatPol;
    }
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

module.exports = PolGenerator;
