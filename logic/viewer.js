var Viewer = /** @class */ (function () {
    function Viewer(socket, callback) {
        var _this = this;
        this.socket = socket;
        this.callback = callback;
        this.socket.on('join', function (partyInfo) { return _this.callback(_this, 'join', partyInfo); });
        this.socket.on('disconnect', function () { return _this.callback(_this, 'disconnect'); });
    }
    Viewer.prototype.join = function (pov, name) {
        var _this = this;
        this.pov = pov;
        this.name = name;
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
        this.socket.removeAllListeners('replace');
    };
    Viewer.prototype.ready = function (readyInfo) {
        if (readyInfo === false || readyInfo === true) {
            this.callback(this, 'ready', readyInfo);
        }
        else {
            this.actionQueue = readyInfo;
            this.callback(this, 'ready', true);
        }
    };
    Viewer.prototype.reset = function () {
        var _this = this;
        delete this.name;
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
