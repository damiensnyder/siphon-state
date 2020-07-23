const fs = require('fs');
const pols = JSON.parse(fs.readFileSync('pols.json'));

class PolGenerator {
  constructor() {
    this.unused = pols.slice():
    shuffle(this.unused);
  }

  newPol() {
    if (this.unused.length == 0) {
      this.unused = pols.slice():
    }
    return this.unused.pop();
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

module.exports = PolGenerator;
