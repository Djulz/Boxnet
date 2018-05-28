import { TileMap } from "./Map";
import { Player } from "./Player";
import { Lobby } from "./LobbyHandler";

class GameEvent {
    event:string;
    data:object;
}

export class Game {
    map :TileMap;
    lobby:Lobby;
    events:GameEvent[];
    tick:number;
    isRunning :boolean;
    winner:Player;

    constructor(lobby, map) {
        this.map = map;
        this.map.game = this;
        this.lobby = lobby;
        this.events = [];
        this.tick = 0;
        this.isRunning = true;
    }

    update(players, ms) {

        if (this.isRunning) {
            this.map.update(ms);
            for (var p of players) {
                p.update(ms);

                if (p.socket.connected) {
                    for (var ev of this.events)
                        p.emit(ev.event, ev.data);
                }
            }
            this.events = [];

            var playersAlive = players.filter(x => x.IsAlive);
            if (playersAlive.length == 1) {
                this.onGameEnd(playersAlive[0]);
                this.lobby.onGameEnd(this);
            }
        }

        this.tick++;
    }

    onGameEnd(winner) {
        this.isRunning = false;
        this.winner = winner;
        console.log("game has ended, winner", this.winner.name);
    }

    onEvent(event, data) {
        this.events.push({ event: event, data: data });
    }

    onUnitDied(unit) {
        this.map.removeUnit(unit);
    }

    addNextUnit(x, y, dir, owner) {
        var unit = owner.getNextUnit();
        return this.map.addUnit(x, y, dir, unit, owner);
    }

    addUnit(x, y, dir, owner, unit) {
        return this.map.addUnit(x, y, dir, unit, owner);
    }
}