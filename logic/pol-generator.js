const fs = require('fs');
const path = require('path');
const polsPath = path.resolve(__dirname, 'pols.json');
const pols = JSON.parse(fs.readFileSync(polsPath)).pols;

class PolGenerator {
  constructor() {
    this.made = 0;
    this.resets = 0;
    this.deal();
  }

  newPol(party) {
    if (this.unused.length == 0) {
      this.deal();
    }
    const newPol = this.unused.pop();
    newPol.id = this.made;
    this.made++;
    newPol.party = party;
    newPol.url = newPol.name.replace(' ', '-').toLowerCase();
    newPol.url = newPol.url.replace(/[,\.]/, '');
    if (this.resets > 1) {
      newPol.name = newPol.name + " " + toRomanNumerals(this.resets);
    }
    return newPol;
  }

  deal() {
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

function toRomanNumerals(num) {
  return num;
}

module.exports = PolGenerator;
