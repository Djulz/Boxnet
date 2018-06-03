import { Socket } from "socket.io";
import { Unit, createUnit } from "./Unit";
import { IAccount } from "./../models/Account";
import { Lobby } from "./Lobby";
import * as Models from "./../../shared/Models";
import * as Common from "./Common";

// var Models = require('./../public/js/models/Models');
// var Common = require('./Common');

export class Player {
    socket:Socket;
    account:IAccount;
    playerStartX:number;
    playerStartY:number;
    bIsLoading:boolean;
    bIsReady:boolean;
    lobbyPlayerId:number;
    nextUnits:string[];
    cores:Unit[];
    cooldown:number;
    startingUnit:Unit;
    lobby:Lobby;

    constructor(socket:Socket, account:IAccount) {
        this.socket = socket;
        this.account = account;
        this.bIsLoading = false;
        this.bIsReady = false;
        this.lobbyPlayerId = -1;
        this.nextUnits = [];
        this.rollNextUnits(5);
        this.cores = [];
        this.cooldown = 0;
        this.startingUnit = createUnit("core");
    }

    disconnect(msg:string) {
        this.socket.disconnect(msg);
    }

    setStartPos(x:number, y:number) {
        this.playerStartX = x;
        this.playerStartY = y;
    }

    get name() {
        return this.account.name;
    }

    emit(str:string, data:any) {
        //console.log("sending", str);
        this.socket.emit(str, data);
    }

    get Model() {
        return new Models.PlayerModel(this.name, "Nomads", this.lobbyPlayerId);
    }

    onInputAddUnit() {
        this.cooldown = 5000;
    }

    update(ms:number) {
        this.cooldown -= ms;
    }

    getNextUnit() {
        const unitType = this.nextUnits.shift();
        const unit = createUnit(unitType);
        this.rollNextUnits(5);
        return unit;
    }

    rollNextUnits(n:number) {
        while (this.nextUnits.length < n) {

            const unit = Common.randomObjectInArray(["grower", "shooter", "tunneler", "quaker"]);
            this.nextUnits.push(unit);
        }
    }

    addCore(unit:Unit) {
        this.cores.push(unit);
    }

    get IsAlive() {
        return this.cores.some(x => x.IsAlive);
    }

}
