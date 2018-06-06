import { DrawableMap } from "./DrawableMap";
import { DrawableUnit } from "./DrawableUnit";
import * as Models from "./../../shared/Models";
import * as sio from "socket.io-client";
import { BoxnetClient } from "./BoxnetClient";

const client = new BoxnetClient();
let ctx: CanvasRenderingContext2D;

window.onload = () => {

    const c = <HTMLCanvasElement>document.getElementById("canvas");
    ctx = c.getContext("2d");

    client.onLoad(ctx);

};