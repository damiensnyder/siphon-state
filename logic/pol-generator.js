const fs = require('fs');
const path = require('path');
const polsPath = path.resolve(__dirname, 'pols.json');
const pols = JSON.parse(fs.readFileSync(polsPath)).pols;

const ROMAN = ["MMM", "MM", "M", "CM", "DCCC", "DCC", "DC", "D", "CD", "CCC",
    "CC", "C", "XC", "LXXX", "LXX", "LX", "L", "XL", "XXX", "XX", "XI", "X",
    "IX", "VIII", "VII", "VI", "V", "IV", "III", "II", "I"];
const ARABIC = [3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100,
    90, 80, 70, 60, 50, 40, 30, 20, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

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
  var result ="";
  for (let i = 0; i < ARABIC.length; i++) {
      if (Math.floor(num / ARABIC[i]) > 0){
          result += ROMAN[i];
          num -= ARABIC[i];
      }
  }
  return result;
}

module.exports = PolGenerator;
