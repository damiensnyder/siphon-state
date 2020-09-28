// @ts-ignore
var fs = require('fs');
var path = require('path');
var polsPath = path.resolve(__dirname, 'content-info/pols.json');
var provsPath = path.resolve(__dirname, 'content-info/provs.json');
var ROMAN = ["MMM", "MM", "M", "CM", "DCCC", "DCC", "DC", "D", "CD",
    "CCC", "CC", "C", "XC", "LXXX", "LXX", "LX", "L", "XL", "XXX", "XX", "XI",
    "X", "IX", "VIII", "VII", "VI", "V", "IV", "III", "II", "I"];
var ARABIC = [3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300,
    200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
var ContentGenerator = /** @class */ (function () {
    function ContentGenerator(nation) {
        var provsInfo = JSON.parse(fs.readFileSync(provsPath));
        if (!provsInfo.hasOwnProperty(nation)) {
            nation = "Kenderland";
        }
        this.provs = this.shuffle(provsInfo[nation]);
        this.provs.forEach(function (prov) {
            prov.candidates = [];
        });
        this.made = 0;
        this.resets = 0;
        this.deal();
    }
    ContentGenerator.prototype.newPol = function (party) {
        if (this.unused.length === 0) {
            this.deal();
        }
        var newPol = this.unused.pop();
        this.made++;
        newPol.party = party;
        newPol.url = newPol.name.split(/ /).join('-');
        newPol.url = newPol.url.split(/[,.]/).join('').toLowerCase();
        newPol.name = newPol.name + toRomanNumerals(this.resets);
        return newPol;
    };
    ContentGenerator.prototype.deal = function () {
        this.unused = this.shuffle(JSON.parse(fs.readFileSync(polsPath)).pols);
        this.resets++;
        // Clone each pol so object comparisons don't match them
        for (var i = 0; i < this.unused.length; i++) {
            this.unused[i] = {
                name: this.unused[i].name
            };
        }
    };
    ContentGenerator.prototype.shuffle = function (arr) {
        var _a;
        var shuffled = arr.slice(0, arr.length);
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [shuffled[j], shuffled[i]], shuffled[i] = _a[0], shuffled[j] = _a[1];
        }
        return shuffled;
    };
    return ContentGenerator;
}());
function toRomanNumerals(num) {
    if (num == 1) {
        return "";
    }
    if (num == 2) {
        return " Jr.";
    }
    var result = " ";
    for (var i = 0; i < ARABIC.length; i++) {
        if (Math.floor(num / ARABIC[i]) > 0) {
            result += ROMAN[i];
            num -= ARABIC[i];
        }
    }
    return result;
}
module.exports = {
    Pol: this.Pol,
    Prov: this.Prov,
    ContentGenerator: ContentGenerator
};
