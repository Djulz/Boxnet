import { Player } from "./Player";
import { Game } from "./Game";
import { TileMap } from "./Map";

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