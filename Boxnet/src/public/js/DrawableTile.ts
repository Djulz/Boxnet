import { DrawableMap } from "./DrawableMap";

export class DrawableTile {
    x: number;
    y:number;
    typeString: string;

    grassColor:string;
    mntColor:string;
    variant:number;
    map:DrawableMap;
    constructor(x, y, typeString) {
        this.x = x;
        this.y = y;
        this.typeString = typeString;

        this.grassColor = this.randomObjectInArray(["#339933", "#309933", "#339930", "#339633", "#309930"]);
        this.mntColor =   this.randomObjectInArray(["#595959", "#505959", "#595059", "#595950", "#505950"]);
        this.variant = Math.floor(Math.random()*3);
    }

    draw(ctx, tileSize) {
        if(this.typeString == "grass" || this.typeString == "sand")
            this.map.spriteSheet.drawSprite(ctx, this.typeString, this.x * tileSize, this.y * tileSize , tileSize, tileSize, this.variant);
            else
            this.map.spriteSheet.drawSprite(ctx, this.typeString + "01", this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        //ctx.fillStyle = this.getColor();
        //console.log("drawing ", this, ctx.fillStyle, tileSize);
        //ctx.fillRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
    }

    randomObjectInArray(array) {
        var r = Math.floor(Math.random() * array.length);
        return array[r];
    }

    getColor() {
        switch (this.typeString) {
            case "void":
                return "#000000";
            case "grass":
            return this.grassColor;
            case "sand":
                return "#ffe6b3";
            case "mountain":
                return this.mntColor;
        }
    }
}
