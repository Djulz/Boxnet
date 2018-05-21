const drawPadding = .1;
const playerColors = ["#00FF00", "#FF0000", "#FFFF00"];

class DrawableUnit extends UnitModel {
    constructor(x, y, unitModel) {
        super(unitModel.type);
        this.x = x;
        this.y = y;
        this.owner = unitModel.owner;
    }

    draw(ctx, tileSize) {
        ctx.fillStyle = this.getColor();
        //console.log("drawing ", this, ctx.fillStyle, tileSize);
        var padding = (tileSize * drawPadding);
        ctx.fillRect(this.x * tileSize + padding, this.y * tileSize + padding, tileSize - 2 * padding, tileSize - 2 * padding);
    }

    getColor() {
        switch (this.type) {
            case "core":
                //return playerColors[this.owner];
            case "grower":
                return playerColors[this.owner];
                //return "#ccc";
            default: "pink";
        }
    }
}
