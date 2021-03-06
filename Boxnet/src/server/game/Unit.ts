import { Tile } from "./Tile";
import { Player } from "./Player";
import { Direction } from "./../../shared/Common";
import * as Models from "./../../shared/Models";

//var Models = require('./../public/js/models/Models');
//var DMath = require('./DMath');
//var Common = require('./Common');
//var UnitFactory = require('./factories/UnitFactory');

export abstract class Unit {

    name: string;
    dir: Direction;
    owner: Player;
    hp: number;
    id: number;
    tile: Tile;

    constructor(name:string) {
        this.name = name;
        this.dir = Direction.Up;
        this.owner = null;
        this.hp = 100;
        this.id = -1;
    }

    onInit(owner:Player, dir:Direction) {
        this.dir = dir;
        this.owner = owner;
        this.init();
    }

    init() { }

    public onUpdate(ms:number) {
        this.update(ms);
    }

    protected update(ms:number) {

    }

    takeDamage(dmg:number) {
        this.hp = Math.max(this.hp - dmg, 0);
        console.log("dmg -" + dmg, this.hp);
        this.tile.map.game.onEvent("unitUpdate", {
            type: "dmg",
            unitId: this.id,
            hp: this.hp,
        });
        if (!this.IsAlive) {
            this.die();
        }
    }

    die() {
        this.tile.map.game.onUnitDied(this);
    }

    get IsAlive() {
        return this.hp > 0;
    }

    get Model() {
        return new Models.UnitModel(this.name, this.id, this.owner.lobbyPlayerId, this.hp);
    }

    static createUnit(type:string):Unit {
        switch (type) {
            case "grower":
                return new Grower("circle", "sand", 5, 100);
            case "shooter":
                return new Shooter(10, 10, 1000);
            case "core":
                return new Core();
            case "tunneler":
                return new Tunneler(5, 1000);
            case "quaker":
                return new Quaker(5, 1000, 10);
        }
    }
}

class Grower extends Unit {

    growReach: number;
    growPeriod: number;
    growType: string;
    tileToGrow: string;
    growCooldown: number;
    tilesQueued: Tile[];
    iGrown: number;

    constructor(growType:string, tileToGrow:string, growReach:number, growPeriod:number) {
        super("grower");
        this.growReach = growReach;
        this.growPeriod = growPeriod;
        this.growType = growType;
        this.tileToGrow = tileToGrow;
        this.growCooldown = growPeriod;
        this.tilesQueued = [];
        this.iGrown = 0;
    }

    update(ms:number) {

        if (this.tile.map.game.tick % 10 === 0)
            this.queueTiles();

        while (this.growCooldown <= 0) {
            this.growCooldown += this.growPeriod;
            this.grow();
        }

        this.growCooldown -= ms;
    }

    queueTiles() {
        this.tilesQueued = this.tile.getTilesAtDistancePathFilter(this.growReach, true, [], ["mountain"]).map(x => x.tile);
    }

    grow() {
        let xOffset = 0;
        let yOffset = 0;
        let tile:Tile;
        if (this.growType === "line") {
            if (this.dir === Direction.Left || this.dir === Direction.Right) {
                tile = this.tile.map.getTile(this.tile.x + xOffset, this.tile.y);
                while (tile != null && tile.typeString === this.tileToGrow && Math.abs(xOffset) < this.growReach) {
                    xOffset += (this.dir === Direction.Left ? -1 : 1);
                    tile = this.tile.map.getTile(this.tile.x + xOffset, this.tile.y);
                }
            }
            if (this.dir === Direction.Up || this.dir === Direction.Down) {
                tile = this.tile.map.getTile(this.tile.x, this.tile.y + yOffset);
                while (tile != null && tile.typeString === this.tileToGrow && Math.abs(yOffset) < this.growReach) {
                    yOffset += (this.dir === Direction.Up ? -1 : 1);
                    tile = this.tile.map.getTile(this.tile.x, this.tile.y + yOffset);
                }
            }

            if (tile != null && tile.typeString !== this.tileToGrow) {
                tile.changeType(this.tileToGrow);
                //console.log("grow to ", this.tile.x + xOffset, this.tile.y, this.tileToGrow);
            }
        } else if (this.growType === "circle") {
            for (const t of this.tilesQueued) {
                if (t.typeString !== this.tileToGrow) {
                    t.changeType(this.tileToGrow);
                    //console.log("grow to ", t.tile.x, t.tile.y, this.tileToGrow);
                    break;
                }
            }
        }

        this.iGrown++;
    }

}

class Shooter extends Unit {
    range:number;
    dmg:number;
    reloadTime:number;
    timeUntilNextShot:number;
    target:Unit;

    constructor(range:number, dmg:number, reloadTime:number) {
        super("shooter");
        this.range = range;
        this.dmg = dmg;
        this.reloadTime = reloadTime;
        this.timeUntilNextShot = reloadTime;
        this.target = null;
    }

    update(ms:number) {
        if (this.timeUntilNextShot <= 0) {
            this.timeUntilNextShot += this.reloadTime;
            this.shoot();
        }

        this.timeUntilNextShot -= ms;
    }

    findTarget() {
        const units = this.tile.getUnitsAtDistance(this.range, true);
        const hostile = units.filter(x => x.owner !== this.owner); //.map(x => x.tile.units[0]);//.filter(x => x.owner != this.owner)
        let target = null;
        for (const h of hostile) {
            if (this.tile.map.checkLineOfSight(this.tile.x, this.tile.y, h.tile.x, h.tile.y)) {
                target = h;
                console.log("target accuired", target.name);
            }
        }

        return target;
    }

    shoot() {
        if (this.target == null || !this.target.IsAlive) {
            const newTarget = this.findTarget();
            if (newTarget !== this.target) {
                //Found new target
                this.target = newTarget;
                this.tile.map.game.onEvent("unitUpdate", {
                    type: "newTarget",
                    unitId: this.id,
                    targetId: this.target != null ? this.target.id : -1,
                });
            }
        }

        if (this.target != null) {
            this.target.takeDamage(this.dmg);
            console.log("shooting", this.target.name);
        }
    }

    get Model() {
        const model = super.Model;
        model.targetId = this.target != null ? this.target.id : -1;
        return model;
    }
}

class Ticker extends Unit {
    tickTime:number;
    tickCooldown:number;
    tickEnabled:boolean;

    constructor(name:string, tickTime:number) {
        super(name);
        this.tickTime = tickTime;
        this.tickCooldown = tickTime;
        this.tickEnabled = true;
    }

    update(ms:number) {
        if (this.tickCooldown <= 0) {
            this.tickCooldown += this.tickTime;
            this.tick();
        }
        this.tickCooldown -= ms;
    }

    tick() {

    }
}

class Tunneler extends Ticker {
    range:number;
    tilesTunneled:number;
    otherEnd:Tunneler;
    currentTile:Tile;
    constructor(range:number, tunnelTime:number) {
        super("tunneler", tunnelTime);
        this.range = range;
        this.tilesTunneled = 0;
        this.otherEnd = null;
    }

    init() {
        this.currentTile = this.tile;
    }

    tick() {
        if (this.otherEnd != null)
            return;

        //Check tile
        const nextTile = this.currentTile.getDirection(this.dir);
        if (this.tilesTunneled < this.range && nextTile != null) {
            this.tilesTunneled++;
            this.currentTile = nextTile;
        } else if (this.tilesTunneled > 0) {
            //Reached dest
            const unit = this.tile.map.game.addUnit(this.currentTile.x, this.currentTile.y,
                this.dir, this.owner, Unit.createUnit("tunneler")) as Tunneler;
            unit.otherEnd = this;
            this.otherEnd = unit;
        }
    }

    die() {
        if (this.otherEnd != null && this.otherEnd.IsAlive)
            this.otherEnd.die();
        super.die();
    }
}

class Quaker extends Ticker {
    range:number;
    dmg:number;
    constructor(range:number, dmgCooldown:number, dmg:number) {
        super("quaker", dmgCooldown);
        this.range = range;
        this.dmg = dmg;
        this.hp = 300;
    }

    tick() {
        const units = this.tile.getUnitsAtDistance(this.range); //.filter(x=> x.owner != this.owner)
        for (const u of units)
            u.takeDamage(this.dmg);
    }
}

class Core extends Unit {
    constructor() {
        super("core");
    }
}


