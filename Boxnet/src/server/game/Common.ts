//var DMath = require('./DMath');
import * as DMath from './DMath';

export enum Direction {
        Up = 0,
        Right,
        Down,
        Left,
    }

// const TileType = Object.freeze(
//     {
//         void: {
//             type: 0,
//             color: "#000000",
//         },
//         grass: {
//             type: 1,
//             color: "#339933",
//         },
//         sand: {
//             type: 2,
//             color: "#ffe6b3",
//         },
//         mountain: {
//             type: 101,
//             color: "#595959",
//         },
//     });

export function randomObjectInArray(array:any[]) {
    return array[DMath.getRandomInt(0, array.length)];
}

// module.exports = {
//     Direction: Direction,
//     TileType:  TileType,
//     randomObjectInArray:  randomObjectInArray
// };