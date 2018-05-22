var Tile = require('./../public/js/Tile');
var Models = require('./../public/js/models/Models');
var DMath = require('./DMath');
var MapGenerator = require('./MapGenerator');

class Map {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tiles = [];
        this.genMap(w, h);

        var gen = new MapGenerator(this);
        gen.generateWithCPs(20, 7);
        this.units = [];
        this.nextUnitId = 0;
    }

    genMap(w, h) {
        for (var x = 0; x < w; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < h; y++) {
                this.tiles[x][y] = new Tile(x, y, "grass");
                this.tiles[x][y].map = this;
            }
        }
    }

    addUnit(x, y, dir, unit, owner) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            unit.init(owner, dir);
            unit.id = this.nextUnitId++;
            this.tiles[x][y].addUnit(unit);
            this.units.push(unit);

            this.game.onEvent("unitAdd", {
                x: x,
                y: y,
                unit: unit.Model
            });
        }
    }

    removeUnit(unit) {
        unit.tile.removeUnit(unit);
        console.log("removing unit", unit, this.units.length);
        this.units = this.units.filter(x => x != unit);
        console.log(this.units.length);

        this.game.onEvent("unitRemove", {
            unit: unit.Model
        });
    }

    update(ms) {
        for (var unit of this.units) {
            unit.update(ms);
        }
    }

    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height)
            return this.tiles[x][y];
        return null;
    }

    checkLineOfSight(x0, y0, x1, y1) {
        var los = true;
        DMath.bresenhamLine(x0, y0, x1, y1, (x, y) => {
            if (this.getTile(x, y).typeString == "mountain") {
                los = false;
                return true;
            }
            return false;
        });
        return los;
    }

    getRandomTile() {
        return this.getTile(DMath.getRandomInt(0, this.width), DMath.getRandomInt(0, this.height));
    }

    get Model() {
        var map = new Models.MapModel(this.width, this.height);
        for (var x = 0; x < this.width; x++) {
            map.tiles[x] = [];
            for (var y = 0; y < this.height; y++) {
                map.tiles[x][y] = new Models.TileModel(x, y, this.tiles[x][y].typeString);
            }
        }
        return map;
    }
}

module.exports = Map;
