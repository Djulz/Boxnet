var TileType = Object.freeze(
    {
        "void": {
            type: 0,
            color: "#000000"
        },
        "grass": {
            type: 1,
            color: "#339933"
        },
        "sand": {
            type: 2,
            color: "#ffe6b3"
        },
        "mountain": {
            type: 101,
            color: "#595959"
        }
    });

class Tile
{
    constructor(x, y, typeString)
    {
        this.x = x;
        this.y = y;
        this.typeString = typeString;
        this.units = [];
    }

    addUnit(unit) {
        unit.tile = this;
        this.units.push(unit);
    }

    changeType(typeString) {
        this.typeString = typeString;
        this.map.game.onEvent("tileUpdate", {
            x: this.x,
            y: this.y,
            type: this.typeString
        });
    }

    getTilesAtDistance(d) {
        var tiles = [];
        for (var x = Math.max(0, this.x - d); x <= Math.min(this.map.width - 1, this.x + d); x++)
            for (var y = Math.max(0, this.y - d); y <= Math.min(this.map.height - 1, this.y + d); y++) {
                var dist = Math.abs(this.x - x) + Math.abs(this.y - y);
                if (dist <= d)
                    tiles.push({
                        dist: dist,
                        tile: this.map.tiles[x][y]
                    });
            }

        return tiles;
    }
}

if (typeof module !== 'undefined')
    module.exports = Tile;