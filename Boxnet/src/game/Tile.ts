import { TileMap } from "./Map";
import { Unit } from "./Unit";

var Common = require('./Common');

export class Tile {
    x:number;
    y:number;
    typeString:string;
    units:Unit[];
    map:TileMap;
    constructor(x, y, typeString) {
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

    getUnitsAtDistance(d, bSorted = false) {
        var tiles = this.getTilesAtDistance(d, bSorted);

        return tiles.filter(x => x.tile.units.length > 0 && x.tile != this).map(x => x.tile.units[0]);
    }

    getTilesAtDistancePathFilter(d, bSorted, includeTileFilter, excludeTileFilter) {
        //var res = this.getTilesAtDistanceAux(d, bSorted, includeTileFilter, excludeTileFilter, [this]);
        //console.log(res[0].length, res[1].length);

        var res = this.getTiles(d, includeTileFilter, excludeTileFilter);

        res = res.map(t => {
            return {
                dist: Math.abs(this.x - t.x) + Math.abs(this.y - t.y),
                tile: t
            }
        });

        if (bSorted) {
            this.sortTiles(res);
        }
        // console.log(res.length);
        // console.log(res.map(x => x.tile.x + "-" + x.tile.y));

        return res;
    }

    get Id() {
        return this.x * 10000 + this.y;
    }

    getDirection(dir) {
        switch(dir) {
            case Common.Direction.up:
            return this.Up;
            case Common.Direction.down:
            return this.Down;
            case Common.Direction.left:
            return this.Left;
            case Common.Direction.right:
            return this.Right;
        }
    }

    getTiles(d, includeTileFilter, excludeTileFilter) {
        var queue:{t:Tile, d:number}[] = [{ t: this, d: d }];
        var res = [];
        var visited = [this.Id];

        while (queue.length > 0) {
            var td = queue.shift();
            if (excludeTileFilter.includes(td.t.typeString))
                continue;
            if (includeTileFilter.length > 0 && !includeTileFilter.includes(td.t.typeString))
                continue;

            res.push(td.t);
            if (td.d > 0) {
                var dirs = [td.t.Left, td.t.Right, td.t.Up, td.t.Down];
                for (var i = 0; i < dirs.length; i++) {
                    var dir = dirs[i];
                    if (dir != null && !visited.includes(dir.Id)) {
                        queue.push({ t: dir, d: td.d - 1 });
                        visited.push(dir.Id);
                    }
                }
            }
        }

        //console.log("visited", visited);

        return res;
    }

    getTilesAtDistanceAux(d, bSorted, includeTileFilter, excludeTileFilter, tilesVisited) {


        // console.log(this.x, this.y, tilesVisited.length);

        // if (d == 0)
        //     return [this, tilesVisited];

        // var tiles = [];
        // var dirs = [this.Left, this.Right, this.Up, this.Down];
        // for (var i = 0; i < dirs.length; i++) {
        //     var dir = dirs[i];
        //     if (dir != null && tilesVisited.indexOf(dir) == -1
        //         && excludeTileFilter.indexOf(dir.typeString) == -1) {
        //             tilesVisited = tilesVisited.concat(dir);
        //         var res= dir.getTilesAtDistanceAux(d - 1, bSorted, includeTileFilter, excludeTileFilter, tilesVisited);
        //         tiles = tiles.concat(res[0]);
        //     }
        // }
        // tiles.push(this);
        // return [tiles, tilesVisited];
    }

    getDistance2To(tile) {
        return (tile.x - this.x) * (tile.x - this.x) + (tile.y - this.y) * (tile.y - this.y)
    }

    getDistanceTo(tile) {
        return Math.sqrt(this.getDistance2To(tile));
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