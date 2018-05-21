var Models = require('./../public/js/models/Models');

class Player {
    constructor(socket, name) {
        this.socket = socket;
        this.socket.player = this;
        this.name = name;
        this.playerStart = null;
        this.bIsLoading = false;
        this.bIsReady = false;
        this.lobbyPlayerId = -1;
    }

    setStartPos(x, y) {
        this.playerStart = {
            x: x,
            y: y
        };
    }

    emit(str, data) {
        console.log("sending", str, data);
        this.socket.emit(str, data);
    }

    get Model() {
        return new Models.PlayerModel(this.name, "Nomads", this.lobbyPlayerId);
    }

}

module.exports = Player;