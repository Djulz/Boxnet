
export class MapModel {
    width:number;
    height:number;
    tiles:TileModel[][];
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.tiles = [];
    }
}

export class TileModel {
    x:number;
    y:number;
    typeString:string;
    constructor(x, y, typeString) {
        this.x = x;
        this.y = y;
        this.typeString = typeString;
    }
}

export class UnitModel {
    type:string;
    id:number;
    owner:number;
    hp:number;
    targetId:number;
    constructor(type, id, owner, hp) {
        this.type = type;
        this.id = id;
        this.owner = owner;
        this.hp = hp;
        this.targetId = -1;
    }
}

export class PlayerModel {
    name:string;
    faction:string;
    playerId:number;
    constructor(name, faction, playerId) {
        this.name = name;
        this.faction = faction;
        this.playerId = playerId;
    }
}

export class InputModel {
    x:number;
    y:number;
    dir:number;
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }
}

// if (typeof module !== 'undefined')
//     module.exports = {
//         MapModel: MapModel,
//         TileModel: TileModel,
//         UnitModel: UnitModel,
//         PlayerModel: PlayerModel
//     };

