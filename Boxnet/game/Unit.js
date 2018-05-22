var Models = require('./../public/js/models/Models');
var DMath = require('./DMath');

var Direction = Object.freeze(
    {
        "up": 0,
        "right": 1,
        "down": 2,
        "left": 3
    });

class Unit {
    constructor(name) {
        this.name = name;
        this.dir = Direction.up;
        this.owner = null;
        this.hp = 100;
        this.id = -1;
    }

    init(owner, dir) {
        this.dir = dir;
        this.owner = owner;
    }

    onUpdate(ms) {
        this.update(ms);
    }

    update(ms) {

    }

    takeDamage(dmg) {
        this.hp = Math.max(this.hp - dmg, 0);
        console.log("dmg -" + dmg, this.hp);
        if (this.IsDead) {
            this.die();
        }
    }

    die() {
        this.tile.map.game.onUnitDied(this);
    }

    get IsDead() {
        return this.hp <= 0;
    }

    get Model() {
        return new Models.UnitModel(this.name, this.id, this.owner.lobbyPlayerId, this.hp);
    }
}


class Grower extends Unit {
    constructor(growType, tileToGrow, growReach, growPeriod) {
        super("grower");
        this.growReach = growReach;
        this.growPeriod = growPeriod;
        this.growType = growType;
        this.tileToGrow = tileToGrow;
        this.growCooldown = growPeriod;
    }

    update(ms) {
        if (this.growCooldown <= 0) {
            this.growCooldown += this.growPeriod;
            this.grow();
        }

        this.growCooldown -= ms;
    }

    grow() {
        var xOffset = 0, yOffset = 0, tile;
        if (this.growType == "line") {
            if (this.dir == Direction.left || this.dir == Direction.right) {
                tile = this.tile.map.getTile(this.tile.x + xOffset, this.tile.y);
                while (tile != null && tile.typeString == this.tileToGrow && Math.abs(xOffset) < this.growReach) {
                    xOffset += (this.dir == Direction.left ? -1 : 1);
                    tile = this.tile.map.getTile(this.tile.x + xOffset, this.tile.y);
                }
            }
            if (this.dir == Direction.up || this.dir == Direction.down) {
                tile = this.tile.map.getTile(this.tile.x, this.tile.y + yOffset);
                while (tile != null && tile.typeString == this.tileToGrow && Math.abs(yOffset) < this.growReach) {
                    yOffset += (this.dir == Direction.up ? -1 : 1);
                    tile = this.tile.map.getTile(this.tile.x, this.tile.y + yOffset);
                }
            }

            if (tile != null && tile.typeString != this.tileToGrow) {
                tile.changeType(this.tileToGrow);
                //console.log("grow to ", this.tile.x + xOffset, this.tile.y, this.tileToGrow);
            }
        }
        else if (this.growType == "circle") {
            var tiles = this.tile.getTilesAtDistanceFilter(this.growReach, true, [], ["mountain"]);
            for (var t of tiles) {
                if (t.tile.typeString != this.tileToGrow) {
                    t.tile.changeType(this.tileToGrow);
                    console.log("grow to ", t.tile.x, t.tile.y, this.tileToGrow);
                    break;
                }
            }
        }
    }
        
}

class Shooter extends Unit {
    constructor(range, dmg, reloadTime) {
        super("shooter");
        this.range = range;
        this.dmg = dmg;
        this.reloadTime = reloadTime;
        this.timeUntilNextShot = reloadTime;
        this.target = null;
    }

    update(ms) {
        if (this.timeUntilNextShot <= 0) {
            this.timeUntilNextShot += this.reloadTime;
            this.shoot();
        }

        this.timeUntilNextShot -= ms;
    }

    findTarget() {
        var units = this.tile.getUnitsAtDistance(this.range, true);
        var hostile = units.map(x => x.tile.units[0]).filter(x => x.owner != this.owner);//.filter(x => x.owner != this.owner);
        var target = null;
        for (var h of hostile) {
            if (this.tile.map.checkLineOfSight(this.tile.x, this.tile.y, h.tile.x, h.tile.y)) {
                target = h;
                console.log("target accuired", target.name);
            }
        }
        
        return target;
    }

    shoot() {
        if (this.target == null || this.target.IsDead) {
            var newTarget = this.findTarget();
            if (newTarget != this.target) {
                //Found new target
                this.target = newTarget;
                this.tile.map.game.onEvent("unitUpdate", {
                    type: "newTarget",
                    unitId: this.id,
                    targetId: this.target != null ? this.target.id : -1
                });
            }
        }

        if (this.target != null) {
            this.target.takeDamage(this.dmg);
            console.log("shooting", this.target.name);
        }
    }

    get Model() {
        var model = super.Model;
        model.targetId = this.target != null ? this.target.id : -1;
        return model;
    }



}

class Core extends Unit {
    constructor() {
        super("core");
    }
}


module.exports = {
    Grower: Grower,
    Core: Core,
    Shooter: Shooter
};
