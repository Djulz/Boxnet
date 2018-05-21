class Game {
    constructor(map) {
        this.map = map;
        this.map.game = this;
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
}

module.exports = Game;