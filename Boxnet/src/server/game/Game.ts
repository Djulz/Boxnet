import { TileMap } from "./Map";
import { Player } from "./Player";
import { Lobby } from "./Lobby";
import { Unit } from "./Unit";
import { Direction } from "./../../shared/Common";

class GameEvent {
    event: string;
    data: object;
}

export class Game {
    map: TileMap;
    lobby: Lobby;
    events: GameEvent[];
    tick: number;
    isRunning: boolean;
    winner: Player;

    constructor(lobby: Lobby, map: TileMap) {
        this.map = map;
        this.map.game = this;
        this.lobby = lobby;
        this.events = [];
        this.tick = 0;
        this.isRunning = true;
    }

    update(players: Player[], ms: number) {

        if (this.isRunning) {
            this.map.update(ms);
            for (const p of players) {
                p.update(ms);

                if (p.socket.connected) {
                    for (const ev of this.events)
                        p.emit(ev.event, ev.data);
                }
            }
            this.events = [];

            const playersAlive = players.filter(x => x.IsAlive);
            if (playersAlive.length === 1) {
                this.onGameEnd(playersAlive[0]);
                this.lobby.onGameEnd(this);
            }
        }

        this.tick++;
    }

    onGameEnd(winner: Player) {
        this.isRunning = false;
        this.winner = winner;
        console.log("game has ended, winner", this.winner.name);
    }

    onEvent(event: string, data: any) {
        this.events.push({ event: event, data: data });
    }

    onUnitDied(unit: Unit) {
        this.map.removeUnit(unit);
    }

    addNextUnit(x: number, y: number, dir: Direction, owner: Player): Unit {
        const unit = owner.gameData.getNextUnit();
        return this.map.addUnit(x, y, dir, unit, owner);
    }

    addUnit(x: number, y: number, dir: Direction, owner: Player, unit: Unit): Unit {
        return this.map.addUnit(x, y, dir, unit, owner);
    }

    onInput(player: Player, data: any): any {
        player.onInputAddUnit(data.x, data.y, data.dir);    
    }
}