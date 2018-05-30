import { Player } from "./Player";
import { Game } from "./Game";
import { TileMap } from "./Map";
import { Lobby } from "./Lobby";

// var Game = require('./Game');
// var Map = require('./Map');
// var Unit = require('./Unit');
//var Player = require('./Player');
//var DMath = require('./DMath');
//var Account = require('./../models/Account');

class LobbyHandler {

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

export { LobbyHandler };