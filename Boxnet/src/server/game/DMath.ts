export function getRandomInt(min:number, max:number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export class Point {
    x:number;
    y:number;
}

export function bresenhamLine(x0:number, y0:number, x1:number, y1:number, callback:(x:number, y:number) => boolean) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
        const e2 = 2 * err;
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
