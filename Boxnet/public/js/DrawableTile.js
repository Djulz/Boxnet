
class DrawableTile extends Tile
{
    constructor(tile) {
        super(tile.x, tile.y, tile.typeString);
    }

    draw(ctx, tileSize)
    {
        ctx.fillStyle = this.getColor();
        //console.log("drawing ", this, ctx.fillStyle, tileSize);
        ctx.fillRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
    }

    getColor() {
        switch (this.typeString) {
            case "void":
                return "#000000";
            case "grass":
                return "#339933";
            case "sand":
                return "#ffe6b3";
            case "mountain":
                return "#595959";
        }
    }
}
