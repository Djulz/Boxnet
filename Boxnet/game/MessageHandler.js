class MessageHandler {

    constructor(lobbyHandler) {
        this.lobbyHandler = lobbyHandler;
    }

    onConnect(socket) {
        socket.on("input", (data) => {
            console.log("input", data);
            this.lobbyHandler.onInput(socket, data);
        });

        socket.on("join", (data) => {
            this.lobbyHandler.onJoin(socket, data);
        });

        socket.on("msg", (data) => {
            this.lobbyHandler.onMessage(socket, data);
        });


    }

}

module.exports = MessageHandler;