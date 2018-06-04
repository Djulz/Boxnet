import { DrawableMap } from "./DrawableMap";
import { DrawableUnit } from "./DrawableUnit";
import * as Models from "./../../shared/Models";
var sio = require('socket.io-client');


window.onload = function () {
    const c = <HTMLCanvasElement>document.getElementById("canvas");
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