
function randomWithRange(min, max) {
    var range = (max - min);
    return Math.round(Math.random() * range) + min;
}

var types = ["void", "grass", "sand", "mountain"];

var tileSize = 20;
var startPos = null;
var bounds = null;
var brushMoving = true;
var ctx;

var map;
var nextUnits = [];
var socket;

var GameState = {
    Login: "Login",
    Lobby: "Lobby",
    Loading: "Loading",
    Game: "Game"
};

var gameState;

var divLogin;
var divLobby;
var divLoading;
var divGame;

var brushX = 0;
var brushY = 0;
var brushDir = 0;
var brushXVel = 1;
var brushYVel = 1;
var brushActive = "";
var debug = true;

function newState(state) {

    if (gameState == state)
        return;

    gameState = state;

    $(divLogin).hide();
    $(divLobby).hide();
    $(divLoading).hide();
    $(divGame).hide();

    switch (state) {
        case GameState.Login:
            $(divLogin).show();
            break;
        case GameState.Lobby:
            $(divLobby).show();
            break;
        case GameState.Loading:
            $(divLoading).show();
            break;
        case GameState.Game:
            $(divGame).show();
            onEnterGame();
            break;
    }
}

function onEnterGame() {
    setInterval(function () {
        update();
        draw(ctx);
    }, 100);

    var canvas = $("canvas");
    canvas.click(function (ev) {
        if (debug == true) {
            var x = Math.floor(ev.offsetX / tileSize);
            var y = Math.floor(ev.offsetY / tileSize);
            handleClick(x, y, 0);
        } else {
            brushMoving = false;
            brushClick();
            brushMoving = true;
        }
    });

    document.addEventListener('keydown', (event) => {
        brushClick();
    });
}

function initSocket(ctx) {

    socket = io();
    socket.on('connect', () => {
        console.log("connect");
    });

    socket.on('disconnect', () => newState(GameState.Login) );

    socket.on("lobbyData", (data) => {
        //console.log(data);
        newState(GameState.Lobby);
        $("#gameInfo").text(data.name);
        $("#lobby #players").empty();
        for (var p of data.players) {
            $("#lobby #players").append('<div class="player">' + p.name + ' (' + p.faction + ')</div>');
        }
    });

    socket.on('loading', (data) => {
        console.log("loading");
        this.myId = data.playerId;
        newState(GameState.Loading);
    });

    socket.on("loadingData", (data) => {
        console.log(data);

        //Next units
        updateNextUnits(data.nextUnits);

        //Init map
        map = new DrawableMap(data.map.width, data.map.height);
        adaptTileSize(ctx);
        map.readData(data);

        socket.emit("msg", "loaded");
    });

    socket.on('play', () => {
        console.log("play");
        newState(GameState.Game);
    });

    socket.on("tileUpdate", (data) => {
        //console.log("tileUpdate", data);
        map.updateTile(data.x, data.y, data.type);
    });

    socket.on("unitAdd", (data) => {
        console.log("unitAdd", data);
        var unit = new DrawableUnit(data.x, data.y, data.unit);
        map.addUnit(unit);

        if (unit.unitModel.owner == myId) { //If my unit
            if (unit.unitModel.type == "core") {
                startPos = { x: data.x, y: data.y };
            }

            this.bounds = getBounds(this.myId);
            brushX = data.x
            brushY = data.y;
            //brushX = this.bounds.minX;
            //brushY = this.bounds.minY;
        }
    });

    socket.on("unitRemove", (data) => {
        console.log("unitRemove", data);
        map.removeUnit(data.unit);
    });

    socket.on("unitUpdate", (data) => {
        console.log("unitUpdate", data);
        map.updateUnit(data);
    });

    socket.on("nextUnits", (data) => {
        console.log("nextUnits");
        updateNextUnits(data);
    });
}

function updateNextUnits(units) {
    this.nextUnits = units;
    $("#nextUnits").text(units);
}

function adaptTileSize(ctx) {
    var xSize = Math.floor(ctx.canvas.width / map.width);
    var ySize = Math.floor(ctx.canvas.height / map.height);
    this.tileSize = Math.min(xSize, ySize);
    console.log("setting tilesize to ", this.tileSize);
}

function brushClick() {
    switch (brushActive) {
        case "":
            brushActive = "x";
            break;
        case "x":
            brushActive = "y"
            break;
        case "y":
            brushActive = "dir";
            break;
        case "dir":
            brushActive = "";
            handleClick(brushX, brushY, brushDir);
            break;
    }
}

function handleClick(x, y, dir) {
    console.log("clicked ", x, y, dir);
    console.log(map.tiles[x][y]);
    if (map.tiles[x][y].typeString != "mountain")
        socket.emit("input", new InputModel(x, y, dir));
    brushXVel *= -1;
    brushYVel *= -1;
}

function getBounds(owner) {
    var bounds = {
        minX: startPos.x,
        minY: startPos.y,
        maxX: startPos.x,
        maxY: startPos.y
    };

    for (var u of this.map.units) {
        if (u.unitModel.owner == owner) {
            bounds.minX = Math.min(Math.max(0, u.x - 3), bounds.minX);
            bounds.maxX = Math.max(Math.min(map.width - 1, u.x + 3), bounds.maxX);
            bounds.minY = Math.min(Math.max(0, u.y - 3), bounds.minY);
            bounds.maxY = Math.max(Math.min(map.height - 1, u.y + 3), bounds.maxY);
        }
    }

    return bounds;
}

function update() {
    if (!brushMoving)
        return;

    if (startPos === null || bounds === null)
        return;

    if (brushX >= bounds.maxX) {
        brushX = bounds.maxX;
        brushXVel = -1;
    }
    if (brushY >= bounds.maxY) {
        brushY = bounds.maxY;
        brushYVel = -1;
    }
    if (brushX <= bounds.minX) {
        brushX = bounds.minX;
        brushXVel = 1;
    }
    if (brushY <= bounds.minY) {
        brushY = bounds.minY;
        brushYVel = 1;
    }
    if (brushActive == "x")
        brushX += brushXVel;
    if (brushActive == "y")
        brushY += brushYVel;
    if (brushActive == "dir")
        brushDir = (brushDir + 1) % 4;
}


function draw(ctx) {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //Draw map
    map.draw(ctx, tileSize);

    //Draw bounds
    if (bounds != null) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.setLineDash([tileSize / 3, tileSize / 2]);
        ctx.strokeStyle = "#000";
        ctx.rect(bounds.minX * tileSize, bounds.minY * tileSize, (bounds.maxX - bounds.minX + 1) * tileSize, (bounds.maxY - bounds.minY + 1) * tileSize);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    //Draw brush

    if (brushActive == "x") {
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.2;
        ctx.fillRect(brushX * tileSize, bounds.minY * tileSize, tileSize, (bounds.maxY - bounds.minY + 1) * tileSize);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "#f00";
        ctx.rect(brushX * tileSize, bounds.minY * tileSize, tileSize, (bounds.maxY - bounds.minY + 1) * tileSize);
        ctx.stroke();
    }
    if (brushActive == "y" || brushActive == "dir") {
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.2;
        ctx.fillRect(brushX * tileSize, brushY * tileSize, tileSize, tileSize);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "#f00";
        ctx.rect(brushX * tileSize, brushY * tileSize, tileSize, tileSize);
        ctx.stroke();
    }

    if (brushActive == "dir") {
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "#f00";
        var startX = (brushX + 0.5) * tileSize;
        var startY = (brushY + 0.5) * tileSize;
        ctx.moveTo(startX, startY);
        var offsetX = 0, offsetY = 0;
        switch (brushDir) {
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
        ctx.lineTo(startX + offsetX * tileSize, startY + offsetY * tileSize);
        ctx.stroke();
    }
};


window.onload = function () {
    var c = document.getElementById("canvas");
    ctx = c.getContext("2d");

    divLogin = $("#login");
    divLobby = $("#lobby");
    divLoading = $("#loading");
    divGame = $("#game");

    initSocket(ctx);
    newState(GameState.Login);

    var debug = $("#debug");
    setInterval(() => {
        $(debug).text("brush(" + brushX + "," + brushY + ")");
    }, 100);

    //join lobby
    $("#btn-login").click(() => {
        var input = $("input#input-lobby");
        if (input.val() != "")
            socket.emit("join", { lobbyName: input.val() });
    });

    $("#btn-ready").click(() => {
        if ($("#btn-ready").text() == "Ready") {
            socket.emit("msg", "ready");
            $("#btn-ready").text("Not Ready");
        }
        else {
            socket.emit("msg", "notready");
            $("#btn-ready").text("Ready");
        }
    })

};