//class Grower extends Unit {
//    constructor(growReach, growPeriod) {
//        this.growReach = growReach;
//        this.growPeriod = growPeriod;
//        this.growCooldown = 0;
//        super("Grower");
//    }

//    update(ms) {
//        console.log("update", ms);
//        if (this.growCooldown <= 0) {
//            this.growCooldown += growPeriod;
//            this.grow();
//        }

//        this.growCooldown -= ms;
//    }

//    grow() {
//        var xOffset = 1;
//        while (this.tile.map[this.tile.x + xOffset][this.tile.y].typeString != "mountain")
//            ;

//        this.tile.map[this.tile.x + xOffset][this.tile.y].changeType("mountain");
//    }
//}