class MessageHandler {

    constructor(lobbyHandler) {
        this.lobbyHandler = lobbyHandler;
    }

    onConnect(socket) {
        socket.on("input", (data) => {
            console.log("input", data);
            this.lobbyHandler.onInput(socket, data);
        });

        //socket.on("data", (data) => {
        //    this.lobbyHandler.onData(socket, data.type, data.data);
        //});

        socket.on("join", (data) => {
            this.lobbyHandler.onJoin(socket, data);
        });

        socket.on("msg", (data) => {
            this.lobbyHandler.onMessage(socket, data);
        });

        socket.on('disconnect', (data) => {
            console.log("mh-disconnect", data);
            this.lobbyHandler.onDisconnect(socket);
        });


    }

}

module.exports = MessageHandler;