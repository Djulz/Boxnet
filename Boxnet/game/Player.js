var Models = require('./../public/js/models/Models');
var Unit = require('./Unit');
var Common = require('./Common');

class Player {
    constructor(socket, dbPlayer) {
        this.socket = socket;
        this.socket.player = this;
        this.dbPlayer = dbPlayer;
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

    get name() 
    {
        return this.DBPlayer.name;
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
        var unit = Unit.createUnit(unitType);
        this.rollNextUnits(5);
        return unit;
    }

    rollNextUnits(n) {
        while (this.nextUnits.length < n) {

            var unit = Common.randomObjectInArray(["grower", "shooter", "tunneler", "quaker"]);
            this.nextUnits.push(unit);
        }
    }

}

module.exports = Player;