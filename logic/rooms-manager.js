// @ts-ignore
var GameRoom = require('./game-room');
var ALPHABET = "abcdefghijklmnopqrstuvwxyz";
// @ts-ignore
var RoomsManager = /** @class */ (function () {
    function RoomManager(io) {
        this.io = io;
        this.activeGames = {};
    }
    // Called by a game room when it is ready to tear down. Allows the game code
    // to be reused.
    RoomManager.prototype.callback = function (game) {
        delete this.activeGames[game.settings.gameCode];
    };
    // Create a game and send the game code along with status 200.
    RoomManager.prototype.createGame = function (req, res) {
        var gameCode = this.generateGameCode();
        var settings = req.body.settings;
        settings.gameCode = gameCode;
        if (settings.name.length === 0) {
            settings.name = "My Game";
        }
        this.activeGames[gameCode] = new GameRoom(this.io, settings, this.callback.bind(this));
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ gameCode: gameCode }));
    };
    RoomManager.prototype.addTestGame = function (gameRoom) {
        this.activeGames[gameRoom.settings.gameCode] = gameRoom;
    };
    RoomManager.prototype.generateGameCode = function () {
        var numChars = ALPHABET.length;
        var gameCodeLength = Math.ceil(Math.log(Object.keys(this.activeGames).length + 2) / Math.log(26)) + 1;
        var gameCode = "";
        while (gameCode == "" || this.activeGames.hasOwnProperty(gameCode)) {
            gameCode = "";
            for (var i = 0; i < gameCodeLength; i++) {
                gameCode += ALPHABET.charAt(Math.floor(Math.random() * numChars));
            }
        }
        return gameCode;
    };
    RoomManager.prototype.getActiveGames = function (req, res) {
        var foundGames = [];
        for (var _i = 0, _a = Object.entries(this.activeGames); _i < _a.length; _i++) {
            var _b = _a[_i], gameCode = _b[0], game = _b[1];
            // @ts-ignore
            if (!game.settings.private) {
                // @ts-ignore
                foundGames.push(game.joinInfo());
            }
        }
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(foundGames));
    };
    RoomManager.prototype.sendToGame = function (req, res, nextHandler) {
        if (this.activeGames.hasOwnProperty(req.params.gameCode)) {
            return nextHandler(req, res);
        }
        else {
            res.redirect('/');
        }
    };
    return RoomManager;
}());
module.exports = {
    GameManager: RoomsManager
};
