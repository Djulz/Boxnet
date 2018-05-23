function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function bresenhamLine(x0, y0, x1, y1, callback) {
    var dx = Math.abs(x1 - x0),
        dy = Math.abs(y1 - y0),
        sx = x0 < x1 ? 1 : -1,
        sy = y0 < y1 ? 1 : -1,
        err = dx - dy;

    while (x0 != x1 || y0 != y1) {
        var e2 = 2 * err;
        if (e2 > (dy * -1)) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
        if (callback(x0, y0) === true) {
            return;
        }
    }
}

function randomObjectInArray(array) {
    return array[this.getRandomInt(0, array.length)];
}

module.exports = {
    getRandomInt: getRandomInt,
    bresenhamLine: bresenhamLine
};