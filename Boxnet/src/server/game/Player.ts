import { Socket } from "socket.io";
import { Unit, createUnit } from "./Unit";
import { IAccount } from "./../models/Account";
import { Lobby } from "./Lobby";
import * as Models from "./../public/js/models/Models";
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

    constructor(socket, account) {
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

    disconnect(msg) {
        this.socket.disconnect(msg);
    }

    setStartPos(x, y) {
        this.playerStartX = x;
        this.playerStartY = y;
    }

    get name() {
        return this.account.name;
    }

    emit(str, data) {
        //console.log("sending", str);
        this.socket.emit(str, data);
    }

    get Model() {
        return new Models.PlayerModel(this.name, "Nomads", this.lobbyPlayerId);
    }

    onInputAddUnit() {
        this.cooldown = 5000;
    }

    update(ms) {
        this.cooldown -= ms;
    }

    getNextUnit() {
        var unitType = this.nextUnits.shift();
        var unit = createUnit(unitType);
        this.rollNextUnits(5);
        return unit;
    }

    rollNextUnits(n) {
        while (this.nextUnits.length < n) {

            var unit = Common.randomObjectInArray(["grower", "shooter", "tunneler", "quaker"]);
            this.nextUnits.push(unit);
        }
    }

    addCore(unit) {
        this.cores.push(unit);
    }

    get IsAlive() {
        return this.cores.some(x => x.IsAlive);
    }

}

module.exports = Player;