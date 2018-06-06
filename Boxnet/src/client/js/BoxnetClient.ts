import { DrawableMap } from "./DrawableMap";
import * as Common from "../../shared/Common";
import * as Models from "../../shared/Models";
import { Point } from "../../shared/DMath";
import { DrawableUnit } from "./DrawableUnit";
const sio = require("socket.io-client");

enum GameState {
    Login,
    Lobby,
    Loading,
    Game,
}

export class BoxnetClient {

    tileSize: number = 20;
    tickRate: number = 100;
    startPos: Point = null;
    bounds: any = null;
    brushMoving: boolean = true;
    ctx: CanvasRenderingContext2D;

    map: DrawableMap;
    nextUnits: string[] = [];
    socket: SocketIO.Socket;
    winner: any = null;

    gameState: GameState;

    divLogin: any;
    divLobby: any;
    divLoading: any;
    divGame: any;

    brushX: number = 0;
    brushY: number = 0;
    brushDir: number = 0;
    brushXVel: number = 1;
    brushYVel: number = 1;
    brushActive: string = "";
    debug: boolean = true;
    myId: number = -1;

    intGameLoop: any;

    onLoad(ctx:CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.divLogin = $("#login");
        this.divLobby = $("#lobby");
        this.divLoading = $("#loading");
        this.divGame = $("#game");

        this.initSocket(ctx);
        this.newState(GameState.Login);

        const debug = $("#debug");
        setInterval(() => {
            $(debug).text("brush(" + this.brushX + "," + this.brushY + ")");
        }, 100);

        //join lobby
        $("#btn-login").click(() => {
            const input = $("input#input-lobby");
            if (input.val() !== "")
                this.socket.emit("join", { lobbyName: input.val() });
        });

        $("#btn-ready").click(() => {
            if ($("#btn-ready").text() === "Ready") {
                this.socket.emit("msg", "ready");
                $("#btn-ready").text("Not Ready");
            } else {
                this.socket.emit("msg", "notready");
                $("#btn-ready").text("Ready");
            }
        });
    }

    newState(state: GameState) {

        if (this.gameState === state)
            return;

        //leaving game
        if (this.gameState === GameState.Game) {
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
            this.update(this.tickRate);
            this.draw(this.ctx);
        }, this.tickRate);

        const canvas = $("canvas");
        canvas.click((ev) => {
            if (this.debug === true) {
                const x = Math.floor(ev.offsetX / this.tileSize);
                const y = Math.floor(ev.offsetY / this.tileSize);
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

    updateNextUnits(units: string[]) {
        this.nextUnits = units;
        $("#nextUnits").text(units.toString());
    }

    adaptTileSize(ctx: CanvasRenderingContext2D) {
        const xSize = Math.floor(ctx.canvas.width / this.map.width);
        const ySize = Math.floor(ctx.canvas.height / this.map.height);
        this.tileSize = Math.min(xSize, ySize);
        console.log("setting tilesize to ", this.tileSize);
    }

    brushClick() {
        switch (this.brushActive) {
            case "":
                this.brushActive = "x";
                break;
            case "x":
                this.brushActive = "y";
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

    handleClick(x: number, y: number, dir: any) {
        console.log("clicked ", x, y, dir);
        if (this.map.tiles[x][y].typeString !== "mountain")
            this.socket.emit("input", new Models.InputModel(x, y, dir));
        this.brushXVel *= -1;
        this.brushYVel *= -1;
    }

    getBounds(owner: any) {
        const bounds = {
            minX: this.startPos.x,
            minY: this.startPos.y,
            maxX: this.startPos.x,
            maxY: this.startPos.y,
        };

        for (const u of this.map.units) {
            if (u.unitModel.owner === owner) {
                bounds.minX = Math.min(Math.max(0, u.x - 3), bounds.minX);
                bounds.maxX = Math.max(Math.min(this.map.width - 1, u.x + 3), bounds.maxX);
                bounds.minY = Math.min(Math.max(0, u.y - 3), bounds.minY);
                bounds.maxY = Math.max(Math.min(this.map.height - 1, u.y + 3), bounds.maxY);
            }
        }

        return bounds;
    }

    update(ms: number) {
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

    draw(ctx: CanvasRenderingContext2D) {

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

    initSocket(ctx: CanvasRenderingContext2D) {

        this.socket = sio();
        this.socket.on('connect', (data:any) => {
            console.log("connect");
        });

        this.socket.on('accountData', (data:any) => {
            console.log("accountData");
            $("#playerName").text(data.name);
        });

        this.socket.on('disconnect', () => this.newState(GameState.Login));

        this.socket.on("lobbyData", (data:any) => {
            console.log(data);
            this.newState(GameState.Lobby);
            $("#gameInfo").text(data.name);
            $("#lobby #players").empty();
            for (const p of data.players) {
                $("#lobby #players").append('<div class="player">' + p.name + ' (' + p.faction + ')</div>');
            }
        });

        this.socket.on('loading', (data:any) => {
            console.log("loading");
            this.myId = data.playerId;
            this.newState(GameState.Loading);
        });

        this.socket.on("loadingData", (data:any) => {
            console.log(data);

            //Next units
            this.updateNextUnits(data.nextUnits);

            //Init map
            this.map = new DrawableMap(data.map.width, data.map.height);
            this.adaptTileSize(ctx);
            this.map.readData(data.map);

            this. socket.emit("msg", "loaded");
        });

        this.socket.on('play', () => {
            console.log("play");
            this.newState(GameState.Game);
        });

        this.socket.on("tileUpdate", (data:any) => {
            //console.log("tileUpdate", data);
            this.map.updateTile(data.x, data.y, data.type);
        });

        this.socket.on("unitAdd", (data:any) => {
            console.log("unitAdd", data);
            const unit = new DrawableUnit(data.x, data.y, data.unit);
            this.map.addUnit(unit);

            if (unit.unitModel.owner === this.myId) { //If my unit
                if (unit.unitModel.type === "core") {
                    this.startPos = { x: data.x, y: data.y };
                }

                this.bounds = this.getBounds(this.myId);
                this.brushX = data.x;
                this.brushY = data.y;
                //brushX = this.bounds.minX;
                //brushY = this.bounds.minY;
            }
        });

        this.socket.on("unitRemove", (data:any) => {
            console.log("unitRemove", data);
            this.map.removeUnit(data.unit);
        });

        this.socket.on("unitUpdate", (data:any) => {
            console.log("unitUpdate", data);
            this.map.updateUnit(data);
        });

        this.socket.on("nextUnits", (data:any) => {
            console.log("nextUnits", data);
            this.updateNextUnits(data.nextUnits);
        });

        this.socket.on("gameEnd", (data:any) => {
            console.log("gameEnd", data);
            this.winner = data.winner;
        });
    }

}