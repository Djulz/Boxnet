class Game {
    constructor(lobby, map) {
        this.map = map;
        this.map.game = this;
        this.lobby = lobby;
        this.events = [];
    }

    update(players, ms) {
        this.map.update(ms);
        for (var p of players)
            if (p.socket.connected) {
                for (var ev of this.events)
                    p.emit(ev.event, ev.data);
            }

        this.events = [];
    }

    onEvent(event, data) {
        this.events.push({ event: event, data: data });
    }

    onUnitDied(unit) {
        this.map.removeUnit(unit);
    }

    addNextUnit(x, y, dir, owner) {
        var unit = owner.getNextUnit();
        this.map.addUnit(x, y, dir, unit, owner);
    }

    addUnit(x, y, dir, owner, unit) {
        this.map.addUnit(x, y, dir, unit, owner);
    }
}

module.exports = Game;