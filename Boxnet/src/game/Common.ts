//var DMath = require('./DMath');

export enum Direction
    {
        Up = 0,
        Right,
        Down,
        Left
    };

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
    return array[getRandomInt(0, array.length)];
}

export class Point {
    x:number;
    y:number;
}

// module.exports = {
//     Direction: Direction,
//     TileType:  TileType,
//     randomObjectInArray:  randomObjectInArray
// };