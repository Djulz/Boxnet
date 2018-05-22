const drawPadding = .1;
const playerColors = ["#00FF00", "#FF0000", "#FFFF00"];

class DrawableUnit {
    constructor(x, y, unitModel) {
        this.unitModel = unitModel;
        this.x = x;
        this.y = y;
        this.target = null;
    }

    draw(ctx, tileSize) {
        ctx.fillStyle = this.getColor();
        //console.log("drawing ", this, ctx.fillStyle, tileSize);
        var padding = (tileSize * drawPadding);
        if (this.unitModel.type == "core")
            ctx.fillRect(this.x * tileSize + padding - tileSize, this.y * tileSize + padding - tileSize, tileSize*3 - 2 * padding, tileSize*3 - 2 * padding);
        else
            ctx.fillRect(this.x * tileSize + padding, this.y * tileSize + padding, tileSize - 2 * padding, tileSize - 2 * padding);

        ctx.font = "10px Verdana";
        ctx.fillStyle = "#000000";
        ctx.fillText(this.unitModel.type, this.x * tileSize, this.y * tileSize);

        if (this.target != null) {
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            ctx.moveTo((this.x + .5) * tileSize, (this.y + .5) * tileSize);
            ctx.lineTo((this.target.x + .5) * tileSize, (this.target.y + .5) * tileSize);
            ctx.stroke();
        }
    }

    getColor() {
        switch (this.unitModel.type) {
            case "core":
                //return playerColors[this.owner];
            case "grower":
                return playerColors[this.unitModel.owner];
                //return "#ccc";

            default:
                return "#000000";
        }
    }
}
