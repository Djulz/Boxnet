var Models = require('./../public/js/models/Models');
var Unit = require('./Unit');

class Player {
    constructor(socket, name) {
        this.socket = socket;
        this.socket.player = this;
        this.name = name;
        this.playerStart = null;
        this.bIsLoading = false;
        this.bIsReady = false;
        this.lobbyPlayerId = -1;
        this.nextUnits = [];
        this.rollNextUnits(5);
    }

    setStartPos(x, y) {
        this.playerStart = {
            x: x,
            y: y
        };
    }

    emit(str, data) {
        //console.log("sending", str);
        this.socket.emit(str, data);
    }

    get Model() {
        return new Models.PlayerModel(this.name, "Nomads", this.lobbyPlayerId);
    }

    getNextUnit() {
        var unitType = this.nextUnits.shift();
        var unit = this.createUnit(unitType);
        this.rollNextUnits(5);
        return unit;
    }

    rollNextUnits(n) {
        while (this.nextUnits.length < n) {

            this.nextUnits.push(Math.random() < 0.3 ? "shooter" : "grower");
        }
    }

}

module.exports = Player;