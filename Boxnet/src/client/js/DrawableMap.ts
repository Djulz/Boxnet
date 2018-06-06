import { DrawableUnit } from "./DrawableUnit";
import { DrawableTile } from "./DrawableTile";
import { SpriteSheet } from './SpriteSheet';
import * as Common from "../../shared/Common";
import { TileModel, UnitModel, MapModel } from "../../shared/Models";

export class DrawableMap {

    public width: number;
    public height:number;
    public tiles: DrawableTile[][];
    public units: DrawableUnit[];
    private unitMap: DrawableUnit[];
    public spriteSheet:SpriteSheet;
    private mapUnitToAnim:Common.StringArray<string>;
    constructor(w:number, h:number) {
        this.width = w;
        this.height = h;
        this.tiles = [];
        this.units = [];
        this.unitMap = [];
        this.spriteSheet = new SpriteSheet('./../data/spritesheet');

        this.mapUnitToAnim = {};
        this.mapUnitToAnim['tunneler'] = 'drill';
        this.mapUnitToAnim["quaker"] = "quaker_";
        this.mapUnitToAnim["grower"] = "grower";

        //this.loadImages();
    }

    public readData(map:MapModel) {
        for (let x = 0; x < map.width; x++) {
            this.tiles[x] = [] as DrawableTile[];
            for (let y = 0; y < map.height; y++) {
                const tile:TileModel = map.tiles[x][y];
                const drawableTile:DrawableTile = new DrawableTile(tile.x, tile.y, tile.typeString);
                this.tiles[x][y] = drawableTile;
                drawableTile.map = this;
            }
        }
    }

    // loadImages() {
    //     this.loadImage("images/units/tunnel.png");
    //     //this.loadImage('https://www.google.com/images/branding/googlelogo/1x/googlelogo_white_background_color_272x92dp.png');
    // }

    // getImage(img) {
    //     return this.imgs[img];
    // }

    public addUnit(unit:DrawableUnit) {
        unit.map = this;
        this.units.push(unit);
        this.unitMap[unit.unitModel.id] = unit;

        const mapAnim = this.mapUnitToAnim[unit.unitModel.type];
        if (mapAnim)
            unit.initAnimation(this.spriteSheet.getAnimation(mapAnim), "dunno");
        else {
            let sprite = this.spriteSheet.getSprite(unit.unitModel.type);
            if (sprite == null)
                sprite = this.spriteSheet.defaultSprite;
            unit.initSprite(sprite);
        }
    }

    public updateUnit(data:any) {
        const unit = this.unitMap[data.unitId];
        if (unit != null) {
            switch (data.type) {
                case "newTarget":
                    const target = this.unitMap[data.targetId];
                    unit.target = target;
                    break;
                case "dmg":
                    unit.hp = data.hp;
                    break;
            }
        }
    }

    public removeUnit(unit:DrawableUnit) {
        this.units = this.units.filter(x => x.unitModel.id !== unit.id);
        this.unitMap[unit.id] = null;
    }

    public updateTile(x:number, y:number, type:string) {
        this.tiles[x][y].typeString = type;
    }

    public update(ms:number) {
        for (const u of this.units)
            u.update(ms);
    }

    public draw(ctx:CanvasRenderingContext2D, tileSize:number) {
        //Draw tiles
        for (let x = 0; x < this.width; x++)
            for (let y = 0; y < this.height; y++)
                this.tiles[x][y].draw(ctx, tileSize);

        //Draw units
        for (const u of this.units)
            u.draw(ctx, tileSize);

    }
}