var Models = require('./../public/js/models/Models');

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

    get Model() {
        return new Models.UnitModel(this.name, this.owner.lobbyPlayerId);
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
            var tiles = this.tile.getTilesAtDistance(this.growReach);
            tiles.sort((a, b) => {
                if (a.dist < b.dist)
                    return -1;
                if (a.dist > b.dist)
                    return 1;
                return Math.random() < .5 ? -1 : 1;
            });
            for (var t of tiles) {
                if (t.tile.typeString != this.tileToGrow) {
                    t.tile.changeType(this.tileToGrow);
                    //console.log("grow to ", t.tile.x, t.tile.y, this.tileToGrow);
                    break;
                }
            }
        }
    }
        
}

class Core extends Unit {
    constructor() {
        super("core");
    }
}


module.exports = {
    Grower: Grower,
    Core: Core
};
