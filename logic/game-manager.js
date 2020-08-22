// @ts-ignore
var GameRoom = require('./game-room');
// @ts-ignore
var GameManager = /** @class */ (function () {
    function GameManager(io) {
        this.io = io;
        this.activeGames = {};
    }
    // Called by a game room when it is ready to tear down. Allows the game code
    // to be reused.
    GameManager.prototype.callback = function (game) {
        delete this.activeGames[game.settings.gameCode];
    };
    GameManager.prototype.createGame = function (req, res) {
        var userSettings = req.body.settings;
        var gameCode = this.generateGameCode();
        var settings = {
            name: userSettings.name,
            gameCode: gameCode,
            private: userSettings.private,
            nation: userSettings.nation
        };
        // Send error code 400 if the game code is already in use or is invalid.
        // Otherwise, create a game at that game code and send status code 200.
        if (settings.name.length < 1) {
            res.status = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ errMsg: "Name must not be empty." }));
        }
        else {
            this.activeGames[gameCode] = new GameRoom(this.io, settings, this.callback.bind(this));
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ gameCode: gameCode }));
        }
    };
    GameManager.prototype.addTestGame = function (gameRoom) {
        this.activeGames[gameRoom.settings.gameCode] = gameRoom;
    };
    GameManager.prototype.generateGameCode = function () {
        var chars = "abcdefghijklmnopqrstuvwxyz";
        var numChars = chars.length;
        var gameCodeLength = Math.ceil(Math.log(Object.keys(this.activeGames).length + 2) / Math.log(26)) + 1;
        var gameCode = "";
        while (gameCode == "" || this.activeGames.hasOwnProperty(gameCode)) {
            gameCode = "";
            for (var i = 0; i < gameCodeLength; i++) {
                gameCode += chars.charAt(Math.floor(Math.random() * numChars));
            }
        }
        return gameCode;
    };
    GameManager.prototype.getActiveGames = function (req, res) {
        var foundGames = [];
        for (var _i = 0, _a = Object.entries(this.activeGames); _i < _a.length; _i++) {
            var _b = _a[_i], gameCode = _b[0], game = _b[1];
            // @ts-ignore
            if (!game.settings.hidden) {
                // @ts-ignore
                foundGames.push(game.joinInfo());
            }
        }
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(foundGames));
    };
    GameManager.prototype.sendToGame = function (req, res, nextHandler) {
        if (this.activeGames.hasOwnProperty(req.params.gameCode)) {
            return nextHandler(req, res);
        }
        else {
            res.redirect('/');
        }
    };
    return GameManager;
}());
module.exports = {
    GameManager: GameManager
};
