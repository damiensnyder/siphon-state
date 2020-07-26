const fs = require('fs');
const path = require('path');
const polsPath = path.resolve(__dirname, 'pols.json');
const pols = JSON.parse(fs.readFileSync(polsPath)).pols;

class PolGenerator {
  constructor() {
    this.unused = pols.slice();
    this.shuffle(this.unused);
    this.made = 0;
    this.resets = 0;
  }

  newPol(party) {
    if (this.unused.length == 0) {
      this.redeal();
    }
    const newPol = this.unused.pop();
    newPol.id = this.made;
    this.made++;
    newPol.party = party;
    newPol.url = newPol.replace(' ', '-').toLowerCase();
    newPol.name = newPol + " " + this.resets;
    return newPol;
  }

  redeal() {
    this.unused = pols.slice();
    this.shuffle(this.unused);
    this.resets++;

    // Clone each pol so object comparisons don't match them
    for (let i = 0; i < this.unused.length; i++) {
      this.unused[i] = {
        name: this.unused[i].name
      };
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
