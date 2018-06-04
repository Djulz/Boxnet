import { DrawableMap } from "./DrawableMap";
import * as Common from "../../shared/Common";
import { Point } from "../../shared/DMath";
import { DrawableUnit } from "./DrawableUnit";
var sio = require('socket.io-client');

enum GameState {
    Login,
    Lobby,
    Loading,
    Game,
};

export class BoxnetClient {

    tileSize: number = 20;
    tickRate: number = 100;
    startPos: Point = null;
    bounds = null;
    brushMoving: boolean = true;
    ctx;

    map: DrawableMap;
    nextUnits: string[] = [];
    socket: sio.Socket;
    winner = null;

    gameState: GameState;

    divLogin;
    divLobby;
    divLoading;
    divGame;

    brushX = 0;
    brushY: number = 0;
    brushDir: number = 0;
    brushXVel: number = 1;
    brushYVel: number = 1;
    brushActive: string = "";
    debug: boolean = true;
    myId: number = -1;

    intGameLoop: number;

    newState(state) {

        if (this.gameState == state)
            return;

        //leaving game
        if (this.gameState == GameState.Game) {
            this.reset();
        }

        this.gameState = state;

        $(this.divLogin).hide();
        $(this.divLobby).hide();
        $(this.divLoading).hide();
        $(this.divGame).hide();

        switch (state) {
            case GameState.Login:
                $(this.divLogin).show();
                break;
            case GameState.Lobby:
                $(this.divLobby).show();
                break;
            case GameState.Loading:
                $(this.divLoading).show();
                break;
            case GameState.Game:
                $(this.divGame).show();
                this.onEnterGame();
                break;
        }
    }

    reset() {
        clearInterval(this.intGameLoop);
    }

    onEnterGame() {
        this.intGameLoop = setInterval(() => {
            update(this.tickRate);
            draw();
        }, this.tickRate);

        var canvas = $("canvas");
        canvas.click((ev) => {
            if (this.debug == true) {
                var x = Math.floor(ev.offsetX / this.tileSize);
                var y = Math.floor(ev.offsetY / this.tileSize);
                this.handleClick(x, y, 0);
            } else {
                this.brushMoving = false;
                this.brushClick();
                this.brushMoving = true;
            }
        });

        // document.addEventListener('keydown', (event) => {
        //     brushClick();
        // });
    }

    updateNextUnits(units) {
        this.nextUnits = units;
        $("#nextUnits").text(units);
    }

    adaptTileSize(ctx) {
        var xSize = Math.floor(ctx.canvas.width / this.map.width);
        var ySize = Math.floor(ctx.canvas.height / this.map.height);
        this.tileSize = Math.min(xSize, ySize);
        console.log("setting tilesize to ", this.tileSize);
    }

    brushClick() {
        switch (this.brushActive) {
            case "":
                this.brushActive = "x";
                break;
            case "x":
                this.brushActive = "y"
                break;
            case "y":
                this.brushActive = "dir";
                break;
            case "dir":
                this.brushActive = "";
                this.handleClick(this.brushX, this.brushY, this.brushDir);
                break;
        }
    }

    handleClick(x, y, dir) {
        console.log("clicked ", x, y, dir);
        if (this.map.tiles[x][y].typeString != "mountain")
            socket.emit("input", new Models.InputModel(x, y, dir));
        this.brushXVel *= -1;
        this.brushYVel *= -1;
    }

    getBounds(owner) {
        const bounds = {
            minX: this.startPos.x,
            minY: this.startPos.y,
            maxX: this.startPos.x,
            maxY: this.startPos.y,
        };

        for (var u of this.map.units) {
            if (u.unitModel.owner === owner) {
                bounds.minX = Math.min(Math.max(0, u.x - 3), bounds.minX);
                bounds.maxX = Math.max(Math.min(this.map.width - 1, u.x + 3), bounds.maxX);
                bounds.minY = Math.min(Math.max(0, u.y - 3), bounds.minY);
                bounds.maxY = Math.max(Math.min(this.map.height - 1, u.y + 3), bounds.maxY);
            }
        }

        return bounds;
    }

    update(ms) {
        this.updateBrush();
        this.map.update(ms);
    }

    updateBrush() {
        if (!this.brushMoving)
            return;

        if (this.startPos === null || this.bounds === null)
            return;

        if (this.brushX >= this.bounds.maxX) {
            this.brushX = this.bounds.maxX;
            this.brushXVel = -1;
        }
        if (this.brushY >= this.bounds.maxY) {
            this.brushY = this.bounds.maxY;
            this.brushYVel = -1;
        }
        if (this.brushX <= this.bounds.minX) {
            this.brushX = this.bounds.minX;
            this.brushXVel = 1;
        }
        if (this.brushY <= this.bounds.minY) {
            this.brushY = this.bounds.minY;
            this.brushYVel = 1;
        }
        if (this.brushActive === "x")
            this.brushX += this.brushXVel;
        if (this.brushActive === "y")
            this.brushY += this.brushYVel;
        if (this.brushActive === "dir")
            this.brushDir = (this.brushDir + 1) % 4;
    }


    draw(ctx) {

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        //Draw map
        this.map.draw(ctx, this.tileSize);

        //Draw bounds
        if (this.bounds != null) {
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([this.tileSize / 3, this.tileSize / 2]);
            ctx.strokeStyle = "#000";
            ctx.rect(this.bounds.minX * this.tileSize, this.bounds.minY * this.tileSize,
                (this.bounds.maxX - this.bounds.minX + 1) * this.tileSize,
                (this.bounds.maxY - this.bounds.minY + 1) * this.tileSize);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }

        //Draw brush

        if (this.brushActive === "x") {
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 0.2;
            ctx.fillRect(this.brushX * this.tileSize,
                this.bounds.minY * this.tileSize,
                this.tileSize, (this.bounds.maxY - this.bounds.minY + 1) * this.tileSize);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f00";
            ctx.rect(this.brushX * this.tileSize,
                this.bounds.minY * this.tileSize,
                this.tileSize, (this.bounds.maxY - this.bounds.minY + 1) * this.tileSize);
            ctx.stroke();
        }
        if (this.brushActive === "y" || this.brushActive === "dir") {
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 0.2;
            ctx.fillRect(this.brushX * this.tileSize, this.brushY * this.tileSize, this.tileSize, this.tileSize);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f00";
            ctx.rect(this.brushX * this.tileSize, this.brushY * this.tileSize, this.tileSize, this.tileSize);
            ctx.stroke();
        }

        if (this.brushActive === "dir") {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f00";
            const startX = (this.brushX + 0.5) * this.tileSize;
            const startY = (this.brushY + 0.5) * this.tileSize;
            ctx.moveTo(startX, startY);
            let offsetX = 0;
            let offsetY = 0;
            switch (this.brushDir) {
                case 0: //Up
                    offsetY = -1;
                    break;
                case 1: //Right
                    offsetX = 1;
                    break;
                case 2: //Down
                    offsetY = 1;
                    break;
                case 3: //Left
                    offsetX = -1;
                    break;
            }
            ctx.lineTo(startX + offsetX * this.tileSize, startY + offsetY * this.tileSize);
            ctx.stroke();
        }

        if (this.winner) {
            ctx.fillStyle = "#ccc";
            const sizeX = 300;
            const sizeY = 150;
            ctx.fillRect((ctx.canvas.width - sizeX) / 2, (ctx.canvas.height - sizeY) / 2, sizeX, sizeY);
            ctx.font = "30px Verdana";
            ctx.fillStyle = "#000000";
            ctx.fillText(this.winner + " wins!", (ctx.canvas.width - sizeX) / 2 + 20, (ctx.canvas.height - sizeY) / 2 + 20);
        }
    }

    initSocket(ctx) {

        var socket = sio();
        socket.on('connect', (data) => {
            console.log("connect");
        });

        socket.on('accountData', (data) => {
            console.log("accountData");
            $("#playerName").text(data.name);
        });

        socket.on('disconnect', () => this.newState(GameState.Login));

        socket.on("lobbyData", (data) => {
            //console.log(data);
            this.newState(GameState.Lobby);
            $("#gameInfo").text(data.name);
            $("#lobby #players").empty();
            for (var p of data.players) {
                $("#lobby #players").append('<div class="player">' + p.name + ' (' + p.faction + ')</div>');
            }
        });

        socket.on('loading', (data) => {
            console.log("loading");
            this.myId = data.playerId;
            this.newState(GameState.Loading);
        });

        socket.on("loadingData", (data) => {
            console.log(data);

            //Next units
            this.updateNextUnits(data.nextUnits);

            //Init map
            this.map = new DrawableMap(data.map.width, data.map.height);
            this.adaptTileSize(ctx);
            this.map.readData(data.map);

            socket.emit("msg", "loaded");
        });

        socket.on('play', () => {
            console.log("play");
            this.newState(GameState.Game);
        });

        socket.on("tileUpdate", (data) => {
            //console.log("tileUpdate", data);
            this.map.updateTile(data.x, data.y, data.type);
        });

        socket.on("unitAdd", (data) => {
            console.log("unitAdd", data);
            var unit = new DrawableUnit(data.x, data.y, data.unit);
            this.map.addUnit(unit);

            if (unit.unitModel.owner == this.myId) { //If my unit
                if (unit.unitModel.type == "core") {
                    this.startPos = { x: data.x, y: data.y };
                }

                this.bounds = this.getBounds(this.myId);
                this.brushX = data.x
                this.brushY = data.y;
                //brushX = this.bounds.minX;
                //brushY = this.bounds.minY;
            }
        });

        socket.on("unitRemove", (data) => {
            console.log("unitRemove", data);
            this.map.removeUnit(data.unit);
        });

        socket.on("unitUpdate", (data) => {
            console.log("unitUpdate", data);
            this.map.updateUnit(data);
        });

        socket.on("nextUnits", (data) => {
            console.log("nextUnits", data);
            this.updateNextUnits(data.nextUnits);
        });

        socket.on("gameEnd", (data) => {
            console.log("gameEnd", data);
            this.winner = data.winner;
        });
    }

}