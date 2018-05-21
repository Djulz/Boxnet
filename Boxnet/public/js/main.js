
function randomWithRange(min, max)
{
    var range = (max - min);
    return Math.round(Math.random() * range) + min;
}

var types = ["void", "grass", "sand", "mountain"];

var tileSize = 20;
var tilesX = 0;
var tilesY = 0;
var startPos = null;
var bounds = null;
var brushMoving = true;
var ctx;

//var tiles = new Tile[50,50]
var tiles = [];
var units = [];
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
    canvas.click(function () {
        brushMoving = false;
        brushClick();
        brushMoving = true;
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

    socket.on("lobbyData", (data) => {
        console.log(data);
        newState(GameState.Lobby);
        $("#gameInfo").text(data.name);
        $("#lobby #players").empty();
        for (var p of data.players) 
        {
            $("#lobby #players").append('<div class="player">' + p.name + ' (' + p.faction + ')</div>');
        }
    });

    socket.on('loading', (data) => {
        console.log("loading");
        this.myId = data.playerId;
        newState(GameState.Loading);
    }); 

    socket.on("map", (data) => {
        console.log(data);

        //Init map
        this.tilesX = data.width;
        this.tilesY = data.height;
        adaptTileSize(ctx);
        for (var x = 0; x < data.width; x++) {
            tiles[x] = [];
            for (var y = 0; y < data.height; y++) {
                var tile = new DrawableTile(data.tiles[x][y]);
                tiles[x][y] = tile;
            }
        }

        socket.emit("msg", "loaded");
    });

    socket.on('play', () => {
        console.log("play");
        newState(GameState.Game);
    }); 

    socket.on("tileUpdate", (data) => {
        console.log("tileUpdate");
        tiles[data.x][data.y].typeString = data.type;
    });

    socket.on("unitAdd", (data) => {
        console.log("unitAdd", data);
        var unit = new DrawableUnit(data.x, data.y, data.unit);
        units.push(unit);

        if (unit.owner == myId) { //If my unit
            if (unit.type == "core") {
                startPos = { x: data.x, y: data.y };
            }

            this.bounds = getBounds(this.myId);
            brushX = this.bounds.minX;
            brushY = this.bounds.minY;
        }
    });
}

function adaptTileSize(ctx) {
    var xSize = Math.floor(ctx.canvas.width / tilesX);
    var ySize = Math.floor(ctx.canvas.height / tilesY);
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
    console.log(tiles[x][y]);
    socket.emit("input", new InputModel(x, y, dir));
}

function getBounds(owner) {
    var bounds = {
        minX: startPos.x,
        minY: startPos.y,
        maxX: startPos.x,
        maxY: startPos.y
    };

    for (var u of this.units) {
        if (u.owner == owner)
        {
            bounds.minX = Math.min(Math.max(0, u.x - 3), bounds.minX);
            bounds.maxX = Math.max(Math.min(tilesX - 1, u.x + 3), bounds.maxX);
            bounds.minY = Math.min(Math.max(0, u.y - 3), bounds.minY);
            bounds.maxY = Math.max(Math.min(tilesY - 1, u.y + 3), bounds.maxY);
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
    if (brushX <= bounds.minX ) {
        brushX = bounds.minX;
        brushXVel = 1;
    }
    if (brushY <= bounds.minY) {
        brushY = bounds.minY;
        brushYVel = 1;
    }
    if(brushActive == "x")
        brushX += brushXVel;
    if (brushActive == "y")
        brushY += brushYVel;
    if (brushActive == "dir")
        brushDir = (brushDir + 1) % 4;
}


function draw(ctx) {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //Draw tiles
    for (var x = 0; x < tilesX; x++)
        for (var y = 0; y < tilesY; y++)
            tiles[x][y].draw(ctx, tileSize);

    //Draw units
    for (var u of this.units)
        u.draw(ctx, tileSize);

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