var NUMERIC_SUBQUEUES = ["adQueue", "smearQueue", "brubeQueue",
    "hitQueue", "voteQueue", "flipQueue"];
// @ts-ignore
var Viewer = /** @class */ (function () {
    function Viewer(socket, callback) {
        var _this = this;
        this.socket = socket;
        this.callback = callback;
        this.socket.on('join', function (partyInfo) { return _this.callback(_this, 'join', partyInfo); });
        this.socket.on('disconnect', function () { return _this.callback(_this, 'disconnect'); });
    }
    Viewer.prototype.join = function (pov) {
        var _this = this;
        this.pov = pov;
        this.socket.on('ready', function (readyInfo) { return _this.ready.bind(_this)(readyInfo); });
        this.socket.on('msg', function (msg) { return _this.callback(_this, 'msg', msg); });
        this.socket.removeAllListeners('join');
        this.socket.removeAllListeners('replace');
    };
    Viewer.prototype.begin = function () {
        var _this = this;
        if (this.pov === undefined) {
            this.socket.on('replace', function (target) { return _this.callback(_this, 'replace', target); });
        }
    };
    Viewer.prototype.end = function () {
        this.socket.removeAllListeners('msg');
    };
    Viewer.prototype.ready = function (readyInfo) {
        if (readyInfo === false || readyInfo === true) {
            this.callback(this, 'ready', readyInfo);
        }
        else {
            if (this.isValidActionQueue(readyInfo)) {
                this.actionQueue = readyInfo;
                this.callback(this, 'ready', true);
            }
        }
    };
    // Return false if the action queue is not an object. If it is an object,
    // replace all subqueues that are not arrays with arrays. Remove items with
    // invalid types from arrays passed in.
    Viewer.prototype.isValidActionQueue = function (readyInfo) {
        if (typeof (readyInfo) !== "object") {
            return false;
        }
        if (Array.isArray(readyInfo.payQueue)) {
            readyInfo.payQueue = readyInfo.payQueue.filter(function (payment) {
                return Number.isSafeInteger(payment.target) &&
                    Number.isSafeInteger(payment.amount);
            });
        }
        else {
            readyInfo.payQueue = [];
        }
        NUMERIC_SUBQUEUES.forEach(function (queueName) {
            if (Array.isArray(readyInfo[queueName])) {
                readyInfo[queueName] = readyInfo[queueName].filter(function (item) {
                    return Number.isSafeInteger(item);
                });
            }
            else {
                readyInfo[queueName] = [];
            }
        });
        readyInfo.pmChoice = readyInfo.pmChoice === true;
        return true;
    };
    Viewer.prototype.reset = function () {
        var _this = this;
        delete this.pov;
        this.socket.removeAllListeners('join');
        this.socket.removeAllListeners('replace');
        this.socket.removeAllListeners('ready');
        this.socket.removeAllListeners('msg');
        this.socket.on('join', function (partyInfo) { return _this.callback(_this, 'join', partyInfo); });
    };
    Viewer.prototype.emitGameState = function (gs) {
        var hiddenInfo = gs.setPov(this.pov);
        this.socket.emit('update', gs);
        gs.unsetPov(hiddenInfo);
    };
    return Viewer;
}());
module.exports = {
    Viewer: Viewer
};
