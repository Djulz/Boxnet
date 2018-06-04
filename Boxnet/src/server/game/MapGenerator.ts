import { TileMap } from "./Map";
import { Tile } from "./Tile";
import * as DMath from "./../../shared/DMath";

//var DMath = require('./DMath');

class ControlPoint extends DMath.Point {
    type:string;
}

export class MapGenerator {
    map:TileMap;
    cps:ControlPoint[];
    constructor(map:TileMap) {
        this.map = map;
        this.cps = [];
    }

    addCP(x:number, y:number, type:string) {
        const cp = new ControlPoint();
        cp.x = x;
        cp.y = y;
        cp.type = type;
        this.cps.push(cp);
    }

    generateWithCPs(grass:number, mountain:number) {
        this.addCPs("grass", grass);
        this.addCPs("mountain", mountain);

        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const cp = this.findClosestCP(x, y);
                this.map.getTile(x, y).typeString = cp.type;
            }
        }
    }

    findClosestCP(x:number, y:number) {
        if (this.cps.length <= 0)
            return null;

        let closest = this.cps[0];
        let dist = 100000;
        for (const cp of this.cps) {
            const a = cp.x - x;
            const b = cp.y - y;
            const d = Math.sqrt(a * a + b * b);
            if (d < dist) {
                dist = d;
                closest = cp;
            }
        }

        return closest;
    }

    addCPs(type:string, n:number) {
        for (let i = 0; i < n; i++)
            this.addCP(DMath.getRandomInt(0, this.map.width), DMath.getRandomInt(0, this.map.height), type);
    }

    addStartPoints(n:number, wallDist:number, minDist:number) {
        this.map.startPoints = [];
        for (let i = 0; i < n; i++) {
            let iTries = 0;
            console.log("startpooint", i, "startt");
            while (iTries++ < 100) {
                const tile = this.map.getRandomTile(wallDist);

                this.map.startPoints.sort((a, b) => a.getDistanceTo(tile) - b.getDistanceTo(tile));
                const closestSP = this.map.startPoints.length === 0 ? null : this.map.startPoints[0];

                if (closestSP == null || tile.getDistanceTo(closestSP) > minDist) {
                    this.map.startPoints.push(tile);
                    console.log("startpooint", i, tile.x, tile.y);
                    break;
                }
            }
        }

        return this.map.startPoints.length;
    }

    //addMountainsCPs(n) {
    //    for (var i = 0; i < n; i++) {
    //        var startTile = this.map.getRandomTile();
    //        if (startTile.)
    //                this.map.tiles[x][y].typeString = "mountain";

    //    }
    //}
}