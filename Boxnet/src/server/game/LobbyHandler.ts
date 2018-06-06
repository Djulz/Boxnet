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

    lobbies: Lobby[];
    tickRate: number;
    updateLoop: NodeJS.Timer;
    constructor(tickRate: number) {
        this.lobbies = [];
        this.tickRate = tickRate;

        const handler = this;
        this.updateLoop = setInterval(() => {
            handler.update(tickRate);
        }, tickRate);
    }

    update(tickRate: number) {
        for (const l in this.lobbies) {
            if (this.lobbies[l]) {
                this.lobbies[l].update(tickRate);
                if (this.lobbies[l].hasEnded)
                    this.lobbies[l] = null;
            }
        }
    }

    onJoin(player: Player, data: any) {
        this.joinOrCreateLobby(player, data.lobbyName);
    }

    onMessage(player: Player, msg: string) {
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

    onInput(player: Player, data: any) {
        if (player.lobby)
            player.lobby.onInput(player, data);
    }

    onDisconnect(player: Player) {
        this.removePlayer(player);
    }

    removePlayer(player: Player) {
        if (player.lobby) {
            player.lobby.removePlayer(player);
        }
    }

    joinOrCreateLobby(player: Player, lobbyName: string) {
        console.log("joinOrCreateLobby", lobbyName);
        let lobby = this.lobbies[lobbyName];
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
            player.lobby.removePlayer(player);
        }

        lobby.addPlayer(player, null);

        //socket.emit("map", lobby.game.map.Model);
        //console.log("sent map", lobby.game.map);
    }
}

export { LobbyHandler };