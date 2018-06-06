import { Player } from "./Player";
import { Game } from "./Game";
import { TileMap } from "./Map";

enum LobbyState {
    Lobby,
    Loading,
    InGame,
    Ended,
}

export class Lobby {
    name: string;
    game: Game;
    players: Player[];
    state: LobbyState;
    timeAcc: number;
    constructor(name: string) {
        this.name = name;
        this.game = new Game(this, new TileMap(50, 30));
        this.players = [];
        this.state = LobbyState.Lobby;
        this.timeAcc = 0;
    }

    get hasEnded(): boolean {
        return this.state === LobbyState.Ended;
    }

    addPlayer(player: Player, account: Account) {
        console.log("addplayer");
        player.lobbyPlayerId = this.getEmptyId();
        player.setStartPos(this.game.map.startPoints[player.lobbyPlayerId].x, this.game.map.startPoints[player.lobbyPlayerId].y);
        player.lobby = this;
        //socket.join(this.name);
        this.players.push(player);
    }

    removePlayer(player: Player) {
        if (player) {
            console.log("removing plauyer", player.name);
            this.players = this.players.filter(x => x.account._id !== player.account._id);
            player.lobby = null;
        }
        return player;
    }

    getEmptyId() {
        let id = 0;
        while (this.players.some(x => x.lobbyPlayerId === id))
            id++;
        return id;
    }

    onInput(player: Player, data: any) {
        console.log("input data", data);
        if (player.cooldown <= 0) {
            player.onInputAddUnit();
            this.game.addNextUnit(data.x, data.y, data.dir, player);
            player.emit("nextUnits", {
                nextUnits: player.nextUnits,
                cooldown: player.cooldown,
            });
        } else
            console.log("cooldown");
    }

    onLoad() {
        //Add starting units
        for (const p of this.players) {
            const core = this.game.addUnit(p.playerStartX, p.playerStartY, 0, p, p.startingUnit);
            p.addCore(core);
        }

        for (const p of this.players) {
            p.emit("loading", { playerId: p.lobbyPlayerId });
            p.emit("loadingData", {
                map: this.game.map.Model,
                nextUnits: p.nextUnits,
            });
        }
    }

    onGameEnd(game: Game) {
        for (const p of this.players)
            p.emit("gameEnd", {
                winner: game.winner.name,
                ticks: game.tick,
            });
        this.state = LobbyState.Ended;
    }

    update(ms: number) {
        this.timeAcc += ms;
        if (this.timeAcc > 1000)
            this.timeAcc = 0;

        switch (this.state) {
            case LobbyState.Lobby:
                if (this.timeAcc !== 0)
                    return;
                console.log("lobby");
                const data = {
                    name: this.name,
                    players: this.players.map(x => x.Model),
                };
                for (const p of this.players) {
                    console.log("sent", data);
                    p.emit("lobbyData", data);
                }

                //Check if all players ready
                if (this.players.length > 0 && this.players.every(x => x.bIsReady)) {
                    this.onLoad();
                    this.state = LobbyState.Loading;
                }
                break;

            case LobbyState.Loading:
                if (this.timeAcc !== 0)
                    return;
                console.log("loading");
                //Check if all have loaded
                if (this.players.length > 0 && this.players.every(x => !x.bIsLoading)) {
                    this.state = LobbyState.InGame;
                    for (const p of this.players) {
                        p.emit("play", {});
                    }
                }
                break;

            case LobbyState.InGame:
                this.game.update(this.players, ms);
                break;
        }
    }
}