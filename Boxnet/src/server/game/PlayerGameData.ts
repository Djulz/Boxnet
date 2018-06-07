import { Faction } from "./Faction";
import { Unit } from "./Unit";
import * as Common from "./../../shared/Common";

export class PlayerGameData {
    faction: Faction;
    cooldown: number;
    playerId: number;
    nextUnits: string[];
    cores: Unit[];
    constructor(playerId: number, faction: Faction) {
        this.playerId = playerId;
        this.faction = faction;
        this.cooldown = faction.cooldown;
        this.nextUnits = [];
        this.cores = [];
        this.rollNextUnits(this.faction.foresight);
    }

    onInputAddUnit(): boolean {
        if( this.cooldown <= 0) {
            this.cooldown = this.faction.cooldown;
            return true;
        }
        return false;
    }

    update(ms) {
        this.cooldown -= ms;
    }

    getNextUnit() {
        const unitType = this.nextUnits.shift();
        const unit = Unit.createUnit(unitType);
        this.rollNextUnits(this.faction.foresight);
        return unit;
    }

    rollNextUnits(n: number) {
        while (this.nextUnits.length < n) {

            const unit = Common.randomObjectInArray(["grower", "shooter", "tunneler", "quaker"]);
            this.nextUnits.push(unit);
        }
    }

    addCore(core: Unit): void {
        this.cores.push(core);
    }

    get IsAlive():boolean {
        return this.cores.some(x => x.IsAlive);
    }
    
}