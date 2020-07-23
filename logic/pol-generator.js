const fs = require('fs');
const pols = JSON.parse(fs.readFileSync('./pols.json'));

class PolGenerator {
  constructor() {
    this.unused = pols.slice():
    shuffle(this.unused);
    this.resets = 0;
  }

  newPol() {
    if (this.unused.length == 0) {
      this.redeal()
    }
    return this.unused.pop();
  }

  redeal() {
    this.unused = pols.slice():
    this.resets++;
    for (let i = 0; i < this.unused.length; i++) {
      this.unused[i].id += this.unused.length;
      this.unused[i].name = this.unused[i].id + ' ' + i;
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
