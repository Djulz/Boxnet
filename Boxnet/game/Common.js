var Direction = Object.freeze(
    {
        "up": 0,
        "right": 1,
        "down": 2,
        "left": 3
    });

var TileType = Object.freeze(
    {
        "void": {
            type: 0,
            color: "#000000"
        },
        "grass": {
            type: 1,
            color: "#339933"
        },
        "sand": {
            type: 2,
            color: "#ffe6b3"
        },
        "mountain": {
            type: 101,
            color: "#595959"
        }
    });

function createUnit(type) {
    switch (type) {
        case "grower":
            var growTile = this.lobbyPlayerId == 0 ? "sand" : "mountain";
            return new Unit.Grower("circle", growTile, 5, 100);

        case "shooter":
            return new Unit.Shooter(10, 10, 1000);
        case "core":
            return new Unit.Core();
        case "tunneler":
            return new Unit.Tunneler(5, 1000);
    }
}

module.exports = {
    Direction = Direction,
    TileType = TileType,
    createUnit = createUnit
};