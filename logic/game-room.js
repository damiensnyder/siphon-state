var Settings = require('./game-manager').Settings;
// @ts-ignore
var GameState = require('./gamestate').GameState;
// @ts-ignore
var Viewer = require('./viewer').Viewer;
var TEARDOWN_TIME = 3600000;
// @ts-ignore
var GameRoom = /** @class */ (function () {
    function GameRoom(io, settings, callback) {
        var _this = this;
        this.io = io.of('/game/' + settings.gameCode);
        this.settings = settings;
        this.gs = new GameState(settings);
        this.gmCallback = callback;
        this.viewers = [];
        this.players = [];
        this.io.on('connection', function (socket) {
            var viewer = new Viewer(socket, _this.enqueueAction);
            _this.enqueueAction(viewer, 'connect', null);
        });
        this.handlers = {
            'connect': this.handleConnect.bind(this),
            'join': this.handleJoin.bind(this),
            'replace': this.handleReplace.bind(this),
            'ready': this.handleReady.bind(this),
            'msg': this.handleMsg.bind(this),
            'disconnect': this.handleDisconnect.bind(this)
        };
        this.actionQueue = [];
        this.handlingAction = false;
        this.enqueueAction = this.enqueueAction.bind(this);
        this.teardownTimer = setTimeout(function () { _this.gmCallback(_this); }, TEARDOWN_TIME);
    }
    // Sends actions to a queue that can be handled one at a time so they don't
    // interfere with each other.
    GameRoom.prototype.enqueueAction = function (viewer, type, data) {
        this.actionQueue.push({
            viewer: viewer,
            type: type,
            data: data
        });
        if (!this.handlingAction) {
            this.handlingAction = true;
            this.handleAction();
        }
    };
    // Handle the first action in the queue. If there are no more actions in the
    // queue, show that it is done. Otherwise, handle the next action.
    GameRoom.prototype.handleAction = function () {
        var _this = this;
        var action = this.actionQueue[0];
        this.handlers[action.type](action.viewer, action.data);
        clearTimeout(this.teardownTimer);
        this.teardownTimer = setTimeout(function () { _this.gmCallback(_this); }, TEARDOWN_TIME);
        this.actionQueue.splice(0, 1);
        if (this.actionQueue.length > 0) {
            this.handleAction();
        }
        else {
            this.handlingAction = false;
        }
    };
    GameRoom.prototype.handleConnect = function (viewer) {
        this.viewers.push(viewer);
        viewer.socket.emit('msg', {
            sender: 'Game',
            text: "Connected to chat.",
            isSelf: false,
            isSystem: true
        });
        if (this.gs.started && !this.gs.ended) {
            viewer.begin();
        }
        viewer.emitGameState(this.gs);
    };
    GameRoom.prototype.handleJoin = function (viewer, partyInfo) {
        viewer.join(this.players.length, partyInfo.name);
        this.players.push(viewer);
        this.gs.addParty(partyInfo.name, partyInfo.abbr);
        this.broadcastSystemMsg(viewer.socket, "Player '" + partyInfo.name + "' (" + partyInfo.abbr + ") has joined the game.");
        this.emitGameStateToAll();
    };
    GameRoom.prototype.handleReplace = function (viewer, target) {
        this.io.emit('newreplace', target);
        if (this.gs.started && !this.gs.parties[target].connected) {
            viewer.join(target, this.gs.parties[target].name);
            this.players.splice(target, 0, viewer);
            this.gs.parties[target].connected = true;
            viewer.emitGameState(this.gs);
            this.broadcastSystemMsg(viewer.socket, "Player '" + this.gs.parties[target].name + "' has been replaced.");
        }
    };
    GameRoom.prototype.handleReady = function (viewer, isReady) {
        this.gs.parties[viewer.pov].ready = isReady;
        viewer.socket.broadcast.emit('newready', {
            party: viewer.pov,
            isReady: isReady
        });
        if (this.gs.allReady()) {
            if (this.gs.ended) {
                this.rematch();
            }
            else if (!this.gs.started) {
                for (var i = 0; i < this.viewers.length; i++) {
                    this.viewers[i].begin();
                }
                this.gs.commitAll();
            }
            else {
                this.executeAllActions();
                this.gs.commitAll();
            }
            this.emitGameStateToAll();
        }
    };
    GameRoom.prototype.handleMsg = function (viewer, msg) {
        if (typeof (msg) == 'string' &&
            msg.trim().length > 0 &&
            viewer.pov !== undefined) {
            viewer.socket.broadcast.emit('msg', {
                sender: viewer.name,
                text: msg.trim(),
                isSelf: false,
                isSystem: false
            });
        }
    };
    GameRoom.prototype.executeAllActions = function () {
        var _this = this;
        this.players.forEach(function (player, playerIndex) {
            player.actionQueue.payQueue.forEach(function (action) {
                _this.gs.pay(playerIndex, action);
            });
        });
        if (this.gs.stage === 1 || this.gs.stage === 2) {
            this.players.forEach(function (player, playerIndex) {
                player.actionQueue.hitQueue.forEach(function (action) {
                    _this.gs.hit(playerIndex, action);
                });
            });
        }
        if (this.gs.stage >= 2) {
            this.players.forEach(function (player, playerIndex) {
                player.actionQueue.flipQueue.forEach(function (action) {
                    _this.gs.flip(playerIndex, action);
                });
            });
        }
        if (this.gs.stage === 0) {
            this.players.forEach(function (player, playerIndex) {
                player.actionQueue.runQueue.forEach(function (action) {
                    _this.gs.run(playerIndex, action);
                });
            });
        }
        else if (this.gs.stage === 1) {
            this.players.forEach(function (player, playerIndex) {
                player.actionQueue.bribeQueue.forEach(function (action) {
                    _this.gs.bribe(playerIndex, action);
                });
                player.actionQueue.adQueue.forEach(function (action) {
                    _this.gs.ad(playerIndex, action);
                });
                player.actionQueue.smearQueue.forEach(function (action) {
                    _this.gs.smear(playerIndex, action);
                });
            });
        }
        else if (this.gs.stage === 2) {
            this.players.forEach(function (player, playerIndex) {
                player.actionQueue.voteQueue.forEach(function (action) {
                    _this.gs.vote(playerIndex, action);
                });
            });
        }
    };
    GameRoom.prototype.rematch = function () {
        this.players.forEach(function (player) { player.reset(); });
        this.gs = new GameState();
        this.players = [];
        this.actionQueue = [];
        this.emitGameStateToAll();
    };
    // When a player disconnects, remove them from the list of viewers, fix the
    // viewer indices of all other viewers, and remove them from the game.
    GameRoom.prototype.handleDisconnect = function (viewer) {
        var index = this.viewers.indexOf(viewer);
        this.viewers.splice(index, 1);
        if (viewer.pov !== undefined) {
            this.gs.parties[viewer.pov].ready = false;
            this.removePlayer(viewer.pov);
        }
    };
    // If the game hasn't started, remove the player with the given POV from the
    // game.
    GameRoom.prototype.removePlayer = function (pov) {
        var name = this.gs.parties[pov].name;
        this.players.splice(pov, 1);
        if (!this.gs.started) {
            this.gs.parties.splice(pov, 1);
            for (var i = pov; i < this.players.length; i++) {
                this.players[i].pov = i;
            }
            this.emitGameStateToAll();
        }
        else {
            this.gs.parties[pov].connected = false;
            this.io.emit('newdisconnect', pov);
        }
        this.emitSystemMsg("Player '" + name + "' has disconnected.");
    };
    // Broadcast a system message to all sockets except the one passed in.
    GameRoom.prototype.broadcastSystemMsg = function (socket, msg) {
        socket.broadcast.emit('msg', {
            sender: 'Game',
            text: msg,
            isSelf: false,
            isSystem: true
        });
    };
    // Send a system message to all sockets.
    GameRoom.prototype.emitSystemMsg = function (msg) {
        this.io.emit('msg', {
            sender: 'Game',
            text: msg,
            isSelf: false,
            isSystem: true
        });
    };
    // Emit the current game state to all viewers.
    GameRoom.prototype.emitGameStateToAll = function () {
        var _this = this;
        this.viewers.forEach(function (viewer) { viewer.emitGameState(_this.gs); });
    };
    GameRoom.prototype.joinInfo = function () {
        return {
            name: this.settings.name,
            gameCode: this.settings.gameCode,
            players: this.players.length,
            started: this.gs.started,
            ended: this.gs.ended
        };
    };
    return GameRoom;
}());
module.exports = GameRoom;
