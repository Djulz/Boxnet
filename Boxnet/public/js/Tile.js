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

    removeUnit(unit) {
        this.units = [];
    }

    changeType(typeString) {
        this.typeString = typeString;
        this.map.game.onEvent("tileUpdate", {
            x: this.x,
            y: this.y,
            type: this.typeString
        });
    }

    getTilesAtDistance(d, bSorted) {
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

        if (bSorted == true) {
            this.sortTiles(tiles);
        }

        return tiles;
    }

    sortTiles(tiles) {
        tiles.sort((a, b) => {
            if (a.dist < b.dist)
                return -1;
            if (a.dist > b.dist)
                return 1;
            return Math.random() < .5 ? -1 : 1;
        });
    }

    getUnitsAtDistance(d, bSorted) {
        var tiles = this.getTilesAtDistance(d, bSorted);

        return tiles.filter(x => x.tile.units.length > 0);
    }

    getTilesAtDistanceFilter(d, bSorted, includeTileFilter, excludeTileFilter) {
        var res = this.getTilesAtDistanceAux(d, bSorted, includeTileFilter, excludeTileFilter, []);

        res = res.map(t => {
            return {
                dist: Math.abs(this.x - t.x) + Math.abs(this.y - t.y),
                tile: t
            }
        });

        if (bSorted) {
            this.sortTiles(res);
        }
        return res;
    }

    getTilesAtDistanceAux(d, bSorted, includeTileFilter, excludeTileFilter, tilesVisited) {
        if (d == 0)
            return [this];

        var tiles = [];
        var dirs = [this.Left, this.Right, this.Up, this.Down];
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            if (dir != null && tilesVisited.indexOf(dir) == -1
                && excludeTileFilter.indexOf(dir.typeString) == -1) {
                tiles = tiles.concat(dir.getTilesAtDistanceAux(d - 1, bSorted, includeTileFilter, excludeTileFilter, tilesVisited.concat([this])));
            }
        }
        tiles.push(this);
        return tiles;
    }

    get Left() {
        return this.map.getTile(this.x - 1, this.y);
    }
    get Right() {
        return this.map.getTile(this.x + 1, this.y);
    }
    get Up() {
        return this.map.getTile(this.x, this.y - 1);
    }
    get Down() {
        return this.map.getTile(this.x, this.y + 1);
    }
}

if (typeof module !== 'undefined')
    module.exports = Tile;