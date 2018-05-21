var Tile = require('./../public/js/Tile');
var Models = require('./../public/js/models/Models');

class Map {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tiles = [];
        this.genMap(w, h);
        this.units = [];
    }

    genMap(w, h) {
        for (var x = 0; x < w; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < h; y++) {
                if (Math.random() > 1)
                    this.tiles[x][y] = new Tile(x, y, "mountain");
                else
                    this.tiles[x][y] = new Tile(x, y, "grass");
                this.tiles[x][y].map = this;
            }
        }
    }

    addUnit(x, y, dir, unit, owner) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            unit.init(owner, dir);
            this.tiles[x][y].addUnit(unit);
            this.units.push(unit);

            this.game.onEvent("unitAdd", {
                x: x,
                y: y,
                unit: unit.Model
            });
        }
    }

    update(ms) {
        for (var unit of this.units)
            unit.update(ms);
    }

    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height)
            return this.tiles[x][y];
        return null;
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
