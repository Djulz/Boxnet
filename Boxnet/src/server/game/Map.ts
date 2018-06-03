import { Game } from "./Game";
import { Tile } from "./Tile";
import { Unit } from "./Unit";
import { MapGenerator } from "./MapGenerator";
import * as DMath from "./DMath";
import * as Models from "./../../shared/Models";
import { Direction } from "./Common";
import { Player } from "./Player";

//var Models = require('./../public/js/models/Models');
//var DMath = require('./DMath');
//var MapGenerator = require('./MapGenerator');

export class TileMap {

    width:number;
    height:number;
    tiles:Tile[][];
    units:Unit[];
    nextUnitId:number;
    startPoints:Tile[];
    game:Game;

    constructor(w:number, h:number) {
        this.width = w;
        this.height = h;
        this.tiles = [];
        this.units = [];
        this.nextUnitId = 0;
        this.startPoints = [];
        this.genMap(w, h);

        const gen = new MapGenerator(this);
        gen.generateWithCPs(20, 7);
        gen.addStartPoints(2, 5, 5);
    }

    genMap(w:number, h:number) {
        for (let x = 0; x < w; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < h; y++) {
                this.tiles[x][y] = new Tile(x, y, "grass");
                this.tiles[x][y].map = this;
            }
        }
    }

    addUnit(x:number, y:number, dir:Direction, unit:Unit, owner:Player) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            unit.id = this.nextUnitId++;
            this.tiles[x][y].addUnit(unit);
            unit.onInit(owner, dir);
            this.units.push(unit);

            this.game.onEvent("unitAdd", {
                x: x,
                y: y,
                unit: unit.Model,
            });
            return unit;
        }

        return null;
    }

    removeUnit(unit:Unit) {
        unit.tile.removeUnit(unit);
        console.log("removing unit", unit.name, unit.id);
        this.units = this.units.filter(x => x !== unit);

        this.game.onEvent("unitRemove", {
            unit: unit.Model,
        });
    }

    update(ms:number) {
        for (const unit of this.units) {
            unit.onUpdate(ms);
        }
    }

    getTile(x:number, y:number) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height)
            return this.tiles[x][y];
        return null;
    }

    checkLineOfSight(x0:number, y0:number, x1:number, y1:number) {
        let los = true;
        DMath.bresenhamLine(x0, y0, x1, y1, (x, y) => {
            if (this.getTile(x, y).typeString === "mountain") {
                los = false;
                return true;
            }
            return false;
        });
        return los;
    }

    getRandomTile(wallDistance:number = 0) {
        return this.getTile(DMath.getRandomInt(wallDistance, this.width - wallDistance),
            DMath.getRandomInt(wallDistance, this.height - wallDistance));
    }

    get Model() {
        const map = new Models.MapModel(this.width, this.height);
        for (let x = 0; x < this.width; x++) {
            map.tiles[x] = [];
            for (let y = 0; y < this.height; y++) {
                map.tiles[x][y] = new Models.TileModel(x, y, this.tiles[x][y].typeString);
            }
        }
        return map;
    }
}
