class DrawableMap {

    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tiles = [];
        this.units = [];
        this.unitMap = [];
    }

    readData(data) {
        for (var x = 0; x < data.map.width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < data.map.height; y++) {
                var tile = new DrawableTile(data.map.tiles[x][y]);
                this.tiles[x][y] = tile;
            }
        }
    }

    addUnit(unit) {
        unit.map = this;
        this.units.push(unit);
        this.unitMap[unit.unitModel.id] = unit;
    }

    updateUnit(data) {
        switch (data.type) {
            case "newTarget":
                var unit = this.unitMap[data.unitId];
                if (unit != null) {
                    var target = this.unitMap[data.targetId];
                    unit.target = target;
                }
                break;
        }
    }

    removeUnit(unit) {
        this.units = this.units.filter(x => x.unitModel.id != unit.id);
        this.unitMap[unit.id] = null;
    }

    updateTile(x, y, type) {
        this.tiles[x][y].typeString = type;
    }

    draw(ctx, tileSize) {
        //Draw tiles
        for (var x = 0; x < this.width; x++)
            for (var y = 0; y < this.height; y++)
                this.tiles[x][y].draw(ctx, tileSize);

        //Draw units
        for (var u of this.units)
            u.draw(ctx, tileSize);

    }
}