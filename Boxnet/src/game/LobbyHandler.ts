import { Player } from "./Player";
import { Game } from "./Game";
import { TileMap } from "./Map";

// var Game = require('./Game');
// var Map = require('./Map');
// var Unit = require('./Unit');
//var Player = require('./Player');
var DMath = require('./DMath');
var Account = require('./../models/Account');

export class Lobby {
    name:string;
    game:Game;
    players:Player[];
    bIsLoading:boolean;
    bIsPlaying:boolean;
    timeAcc:number;
    constructor(name) {
        this.name = name;
        this.game = new Game(this, new TileMap(50, 30));
        this.players = [];
        this.bIsLoading = false;
        this.bIsPlaying = false;
        this.timeAcc = 0;
    }

    addPlayer(player, account) {
        console.log("addplayer");
        player.lobbyPlayerId = this.getEmptyId();
        player.setStartPos(this.game.map.startPoints[player.lobbyPlayerId].x, this.game.map.startPoints[player.lobbyPlayerId].y);
        player.lobby = this;
        //socket.join(this.name);
        this.players.push(player);
    }

    removePlayer(player:Player) {
        if (player) {
            console.log("removing plauyer", player.name);
            this.players = this.players.filter(x => x.account._id != player.account._id);
            player.lobby = null;
        }
        return player;
    }

    getEmptyId() {
        var id = 0;
        while (this.players.some(x => x.lobbyPlayerId == id))
            id++;
        return id;
    }

    onInput(player, data) {
        console.log("input data", data);
        if (player.cooldown <= 0) {
            player.onInputAddUnit();
            this.game.addNextUnit(data.x, data.y, data.dir, player);
            player.emit("nextUnits", {
                nextUnits: player.nextUnits,
                cooldown: player.cooldown
            });
        }
        else
            console.log("cooldown");
    }

    onLoad() {
        //Add starting units
        for (var p of this.players) {
            var core = this.game.addUnit(p.playerStartX, p.playerStartY, 0, p, p.startingUnit);
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

export class LobbyHandler {

    lobbies:Lobby[];
    tickRate:number;
    updateLoop:number;
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

    onJoin(player, data) {
        this.joinOrCreateLobby(player, data.lobbyName);
    }

    onMessage(player, msg) {
        console.log("msg", msg);
        switch (msg) {
            case "loaded":
                player.bIsLoading = false;
                break;
            case "ready":
                player.bIsReady = true;
                break;
            case "notready":
                player.bIsReady = false;
                break;
        }
    }

    onInput(player, data) {
        if (player.lobby)
            player.lobby.onInput(player, data);
    }

    onDisconnect(player) {
        this.removePlayer(player);
    }

    removePlayer(player) {
        if (player.lobby) {
            player.lobby.removePlayer(player);
        }
    }

    joinOrCreateLobby(player, lobbyName) {
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
        if (player.lobby != null) {
            // var otherPlayer = otherLobby.removePlayer(socket.request.user._id);
            // if (otherPlayer)
            //     otherPlayer.disconnect("Someone else logged in to your account");
            //else
                //console.error("could not find other player logged in")
            console.log("Already in room");
        }

        lobby.addPlayer(player, null);

        //socket.emit("map", lobby.game.map.Model);
        //console.log("sent map", lobby.game.map);
    }
}
