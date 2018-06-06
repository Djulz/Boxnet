import { LobbyHandler } from "./LobbyHandler";
import { Player } from "./Player";
import { Socket } from "socket.io";
import { IAccount } from "../models/Account";

class MessageHandler {

    lobbyHandler:LobbyHandler;
    players:Player[];
    constructor(lobbyHandler:LobbyHandler) {
        this.lobbyHandler = lobbyHandler;
        this.players = [];
    }

    getPlayerFromSocket(socket:Socket) {
        const id = socket.request.user._id;
        if (isNaN(id) && this.players[id])
            return this.players[id];
        return null;
    }

    addSocketToPlayer(socket:Socket, account:IAccount) {
        let player = this.getPlayerFromSocket(socket);
        if (!player)
            player = new Player(socket, account);
        else
            player.reconnect(socket);
        this.players[socket.request.user._id] = player;
        return player;
    }

    onConnect(socket:Socket) {

        let player = this.getPlayerFromSocket(socket);

        if (player) {
            //Check if conected already
            player.disconnect("Someone logged in elsewhere");
        }

        player = this.addSocketToPlayer(socket, socket.request.user);

        socket.on("input", (data) => {
            console.log("input", data);
            this.lobbyHandler.onInput(player, data);
        });

        //socket.on("data", (data) => {
        //    this.lobbyHandler.onData(socket, data.type, data.data);
        //});

        socket.on("join", (data) => {
            this.lobbyHandler.onJoin(player, data);
        });

        socket.on("msg", (data) => {
            this.lobbyHandler.onMessage(player, data);
        });

        socket.on('disconnect', (data) => {
            console.log("mh-disconnect", data);
            this.lobbyHandler.onDisconnect(player);
        });

    }

}

export { MessageHandler };