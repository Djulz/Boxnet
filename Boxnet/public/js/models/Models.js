
class MapModel {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tiles = [];
    }
}

class TileModel {
    constructor(x, y, typeString) {
        this.x = x;
        this.y = y;
        this.typeString = typeString;
    }
}

class UnitModel {
    constructor(type, id, owner, hp) {
        this.type = type;
        this.id = id;
        this.owner = owner;
        this.hp = hp;
    }


}

class PlayerModel {
    constructor(name, faction, playerId) {
        this.name = name;
        this.faction = faction;
        this.playerId = playerId;
    }
}

if (typeof module !== 'undefined')
    module.exports = {
        MapModel: MapModel,
        TileModel: TileModel,
        UnitModel: UnitModel,
        PlayerModel: PlayerModel
    };


