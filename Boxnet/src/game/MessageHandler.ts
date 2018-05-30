import { LobbyHandler } from "./LobbyHandler";
import { Player } from "./Player";

class MessageHandler {

    lobbyHandler:LobbyHandler;
    players:Player[];
    constructor(lobbyHandler) {
        this.lobbyHandler = lobbyHandler;
        this.players = [];
    }

    getPlayerFromSocket(socket) {
        var id = socket.request.user._id;
        if (isNaN(id) && this.players[id])
            return this.players[id];
        return null;
    }

    addSocketToPlayer(socket) {
        var player = this.getPlayerFromSocket(socket);
        if (!player)
            player = new Player(socket, null);

        this.players[socket.request.user._id] = player;
        return player;
    }

    onConnect(socket) {

        var player = this.getPlayerFromSocket(socket.request.user._id);

        if (player) {
            //Check if conected already
            player.disconnect("Someone logged in elsewhere");
        }

        player = this.addSocketToPlayer(socket);

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