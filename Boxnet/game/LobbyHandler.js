var Game = require('./Game');
var Map = require('./Map');
var Unit = require('./Unit');
var Player = require('./Player');
var DMath = require('./DMath');
var Account = require('./../models/Account');

class Lobby {
    constructor(name) {
        this.name = name;
        this.game = new Game(this, new Map(50, 30));
        this.players = [];
        this.bIsLoading = false;
        this.bIsPlaying = false;
        this.timeAcc = 0;
    }

    addPlayer(socket, account) {
        console.log("addplayer");
        var player = new Player(socket, account);
        player.lobbyPlayerId = this.getEmptyId();
        player.setStartPos(this.game.map.startPoints[player.lobbyPlayerId].x, this.game.map.startPoints[player.lobbyPlayerId].y);
        socket.join(this.name);
        this.players.push(player);
    }

    removePlayer(id) {
        var player = this.getPlayer(id);
        if (player) {
            console.log("removing plauyer", player.name);
            this.players = this.players.filter(x => x.account._id != id);
        }
        return player;
    }

    getPlayer(id) {
        return this.players.find(x => x.account._id == id);
    }

    getEmptyId() {
        var id = 0;
        while (this.players.some(x => x.lobbyPlayerId == id))
            id++;
        return id;
    }

    onInput(socket, data) {
        console.log("input data", data);
        if (socket.player.cooldown <= 0) {
            socket.player.onInputAddUnit();
            this.game.addNextUnit(data.x, data.y, data.dir, socket.player);
            socket.emit("nextUnits", {
                nextUnits: socket.player.nextUnits,
                cooldown: socket.player.cooldown
            });
        }
        else
            console.log("cooldown");
    }

    onLoad() {
        //Add starting units
        for (var p of this.players) {
            var core = this.game.addUnit(p.playerStart.x, p.playerStart.y, 0, p, new Unit.Core());
            p.addCore(core);
        }

        for (var p of this.players) {
            p.emit("loading", { playerId: p.lobbyPlayerId });
            p.emit("loadingData", {
                map: this.game.map.Model,
                nextUnits: p.nextUnits
            });
        }
    }

    onGameEnd(game) {
        for (var p of this.players)
            p.emit("gameEnd", {
                winner: game.winner.name,
                ticks: game.tick
            });
    }

    update(ms) {
        if (this.bIsPlaying) {
            this.game.update(this.players, ms);
        }
        else {
            this.timeAcc += ms;
            if (this.timeAcc > 1000) {
                this.timeAcc = 0;
                if (this.bIsLoading) {
                    console.log("loading");
                    //Check if all have loaded
                    if (this.players.length > 0 && this.players.every(x => !x.bIsLoading)) {
                        this.bIsLoading = false;
                        this.bIsPlaying = true;
                        for (var p of this.players) {
                            p.emit("play", {});
                        }
                    }
                }
                else {
                    //In lobby
                    //console.log("lobby");
                    var data = {
                        name: this.name,
                        players: this.players.map(x => x.Model)
                    };
                    for (var p of this.players) {
                        p.emit("lobbyData", data);
                    }

                    //Check if all players ready
                    //console.dir(this.players);
                    if (this.players.length > 0 && this.players.every(x => x.bIsReady)) {
                        this.onLoad();
                        this.bIsLoading = true;
                    }
                }
            }
        }
    }
}

class LobbyHandler {

    constructor(tickRate) {
        this.lobbies = [];
        this.tickRate = tickRate;
        this.mapPlayerToLobby = [];

        var handler = this;
        this.updateLoop = setInterval(() => {
            handler.update(tickRate);
        }, tickRate);
    }

    update(tickRate) {
        for (var l in this.lobbies)
            this.lobbies[l].update(tickRate);
    }

    onJoin(socket, data) {
        this.joinOrCreateLobby(socket, data.lobbyName);
    }

    onMessage(socket, msg) {
        console.log("msg", msg);
        switch (msg) {
            case "loaded":
                socket.player.bIsLoading = false;
                break;
            case "ready":
                socket.player.bIsReady = true;
                break;
            case "notready":
                socket.player.bIsReady = false;
                break;
        }
    }

    onInput(socket, data) {
        if (this.getLobbyFromUserId(socket.request.user._id))
            this.getLobbyFromUserId(socket.request.user._id).onInput(socket, data);
    }

    onDisconnect(socket) {
        this.removePlayer(socket.request.user._id);
    }

    removePlayer(id) {
        var lobby = this.getLobbyFromUserId(id);
        if (lobby) {
            lobby.removePlayer(id);
            this.mapPlayerToLobby[id] = null
        }
    }

    getLobbyFromUserId(id) {
        return this.mapPlayerToLobby[id];
    }

    addLobbyToSocket(socket, lobby) {
        this.mapPlayerToLobby[socket.request.user._id] = lobby;
    }

    joinOrCreateLobby(socket, lobbyName) {
        console.log("joinOrCreateLobby", lobbyName);
        var lobby = this.lobbies[lobbyName];
        console.log("lobbies", this.lobbies);
        if (lobby == null) {
            //Lobby does not exist so we create
            console.log("joinOrCreateLobby", "create");
            lobby = new Lobby(lobbyName);
            this.lobbies[lobbyName] = lobby;
        }

        //Check if player already is in lobby
        var otherLobby = this.getLobbyFromUserId(socket.request.user._id);
        if (otherLobby != null) {
            var otherPlayer = otherLobby.removePlayer(socket.request.user._id);
            if (otherPlayer)
                otherPlayer.disconnect("Someone else logged in to your account");
            else
                console.error("could not find other player logged in")
            console.log("Already in room");
        }

        lobby.addPlayer(socket, socket.request.user);
        this.addLobbyToSocket(socket, lobby);

        //socket.emit("map", lobby.game.map.Model);
        //console.log("sent map", lobby.game.map);
    }
}

module.exports = LobbyHandler;