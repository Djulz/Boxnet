import { Socket } from "socket.io";
import { Unit } from "./Unit";
import { IAccount } from "./../models/Account";
import { Lobby } from "./Lobby";
import * as Models from "./../../shared/Models";
import * as Common from "./../../shared/Common";
import { PlayerGameData } from "./PlayerGameData";
import { Faction, Batch } from "./Faction";
import { SandPeople } from "./factions/SandPeople";

// var Models = require('./../public/js/models/Models');
// var Common = require('./Common');

export class Player {
    socket: Socket;
    account: IAccount;
    playerStartX: number;
    playerStartY: number;
    bIsLoading: boolean;
    bIsReady: boolean;
    gameData: PlayerGameData;
    lobby: Lobby;

    constructor(socket: Socket, account: IAccount) {
        this.socket = socket;
        this.account = account;
        this.bIsLoading = false;
        this.bIsReady = false;
        this.gameData = null;
    }

    get lobbyPlayerId() {
        return this.gameData === null ? -1 : this.gameData.playerId;
    }

    initGame(lobbyPlayerId: number) {
        this.gameData = new PlayerGameData(lobbyPlayerId, SandPeople());
    }

    disconnect(msg: string) {
        console.log("Disconnect:", this.account.name, msg);
        this.socket.disconnect();
    }

    reconnect(socket: SocketIO.Socket): void {
        this.socket = socket;
        console.log("Reconnect:", this.account.name);
    }

    setStartPos(x: number, y: number) {
        this.playerStartX = x;
        this.playerStartY = y;
    }

    get name() {
        return this.socket.id;
    }

    emit(str: string, data: any) {
        //console.log("sending", str);
        this.socket.emit(str, data);
    }

    get Model() {
        return new Models.PlayerModel(this.name, this.gameData.faction.name, this.lobbyPlayerId);
    }

    onInputAddUnit(x: number, y: number, dir: Common.Direction): void {
        if (this.gameData.onInputAddUnit()) {
            this.lobby.game.addNextUnit(x, y, dir, this);
            this.emit("nextUnits", {
                nextUnits: this.gameData.nextUnits,
                cooldown: this.gameData.cooldown,
            });
        }
    }

    update(ms: number) {
        this.gameData.update(ms);
    }

    addCore(unit: Unit) {
        this.gameData.addCore(unit);
    }

    get IsAlive(): boolean {
        return this.gameData.IsAlive;
    }

}
