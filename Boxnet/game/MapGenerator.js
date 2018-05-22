var DMath = require('./DMath');

class MapGenerator {
    constructor(map) {
        this.map = map;
        this.cps = [];
    }

    addCP(x, y, type) {
        this.cps.push({
            x: x,
            y: y,
            type: type
        });
    }

    generateWithCPs(grass, mountain) {
        this.addCPs("grass", grass);
        this.addCPs("mountain", mountain);

        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                var cp = this.findClosestCP(x, y);
                this.map.getTile(x, y).typeString = cp.type;
            }
        }
    }

    findClosestCP(x, y) {
        if (this.cps.length <= 0)
            return null;

        var closest = this.cps[0];
        var dist = 100000;
        for (var cp of this.cps) {
            var a = cp.x - x;
            var b = cp.y - y;
            var d = Math.sqrt(a * a + b * b);
            if (d < dist) {
                dist = d;
                closest = cp;
            }
        }

        return closest;
    }

    addCPs(type, n) {
        for (var i = 0; i < n; i++)
            this.addCP(DMath.getRandomInt(0, this.map.width), DMath.getRandomInt(0, this.map.height), type);
    }


    //addMountainsCPs(n) {
    //    for (var i = 0; i < n; i++) {
    //        var startTile = this.map.getRandomTile();
    //        if (startTile.)
    //                this.map.tiles[x][y].typeString = "mountain";

    //    }
    //}
}

module.exports = MapGenerator;