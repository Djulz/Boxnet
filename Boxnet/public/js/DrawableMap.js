class DrawableMap {

    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tiles = [];
        this.units = [];
        this.unitMap = [];
        this.imgs = [];
        this.loadImages();
    }

    readData(data) {
        for (var x = 0; x < data.map.width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < data.map.height; y++) {
                var tile = data.map.tiles[x][y];
                var drawableTile = new DrawableTile(tile.x, tile.y, tile.typeString);
                this.tiles[x][y] = drawableTile;
                drawableTile.map = this;
            }
        }
    }

    loadImages() {
        this.loadImage("images/units/tunnel.png");
        //this.loadImage('https://www.google.com/images/branding/googlelogo/1x/googlelogo_white_background_color_272x92dp.png');
    }

    loadImage(path) {
        var img = new Image;
        var map = this;
        img.onload = function() {
            map.imgs["tunneler"] = img; 
        }
        img.src = path;//URL.createObjectURL(path);
    }

    getImage(img) {
        return this.imgs[img];
    }

    addUnit(unit) {
        unit.map = this;
        this.units.push(unit);
        this.unitMap[unit.unitModel.id] = unit;
    }

    updateUnit(data) {
        var unit = this.unitMap[data.unitId];
        if (unit != null) {
            switch (data.type) {
                case "newTarget":
                    var target = this.unitMap[data.targetId];
                    unit.target = target;
                    break;
                case "dmg":
                    unit.hp = data.hp;
                    break;
            }
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