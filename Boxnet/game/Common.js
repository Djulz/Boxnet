var DMath = require('./DMath');

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

function randomObjectInArray(array) {
    return array[DMath.getRandomInt(0, array.length)];
}

module.exports = {
    Direction: Direction,
    TileType:  TileType,
    randomObjectInArray:  randomObjectInArray
};