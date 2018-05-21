var Game = require('./Game');
var Map = require('./Map');
var Unit = require('./Unit');
var Player = require('./Player');
var DMath = require('./DMath');

class Lobby {
    constructor(name) {
        this.name = name;
        this.game = new Game(new Map(50, 30));
        this.players = [];
        this.bIsLoading = false;
        this.bIsPlaying = false;
        this.timeAcc = 0;
    }

    addPlayer(socket) {
        socket.lobby = this;
        var player = new Player(socket, socket.id.substring(0,6));
        player.setStartPos(DMath.getRandomInt(0, this.game.map.width), DMath.getRandomInt(0, this.game.map.height));
        this.players.push(player);
        player.lobbyPlayerId = this.players.length - 1;
        this.game.map.addUnit(player.playerStart.x, player.playerStart.y, 0, new Unit.Core(), player);
    }

    onInput(socket, data) {
        console.log("input data", data);
        var growTile = socket.player.lobbyPlayerId == 0 ? "sand" : "mountain";
        this.game.map.addUnit(data.x, data.y, data.dir, new Unit.Grower("circle", growTile, 3, 1000), socket.player);
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
                    console.log("lobby");
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
                        this.bIsLoading = true;
                        for (var p of this.players) {
                            p.emit("loading", { playerId: p.lobbyPlayerId });
                            p.emit("map", this.game.map.Model);
                        }
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
        if (socket.lobby)
            socket.lobby.onInput(socket, data);
    }

    joinOrCreateLobby(socket, lobbyName) {
        var lobby = this.lobbies[lobbyName];
        if (lobby == null) {
            lobby = new Lobby(lobbyName);
            this.lobbies[lobbyName] = lobby;
        }
        lobby.addPlayer(socket);

        //socket.emit("map", lobby.game.map.Model);
        //console.log("sent map", lobby.game.map);
    }
}

module.exports = LobbyHandler;