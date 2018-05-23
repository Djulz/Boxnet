//var DMath = require('./DMath');

class DrawableTile {
    constructor(x, y, typeString) {
        this.x = x;
        this.y = y;
        this.typeString = typeString;

        this.grassColor = this.randomObjectInArray(["#339933", "#309933", "#339930", "#339633", "#309930"]);
        this.mntColor =   this.randomObjectInArray(["#595959", "#505959", "#595059", "#595950", "#505950"]);
    }

    draw(ctx, tileSize) {
        ctx.fillStyle = this.getColor();
        //console.log("drawing ", this, ctx.fillStyle, tileSize);
        ctx.fillRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
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
