// import { Unit } from "./Unit";


// export abstract class Faction {
//     name:string;
//     abstract cooldown:number;
//     abstract foresight:number;
//     abstract startingUnit:Unit;

//     nextUnits:string[];
//     cores:Unit[];

//     constructor(name:string) {
//         this.name = name;
//     }

//     abstract init():void;

//     abstract get nextUnits():string[];

//     //abstract units:Unit[]
// }

export class Batch {
    units:string[];
    constructor(units:string[]) {
        this.units = units;
    }
}

export class Faction {
    name:string;
    desc:string;
    foresight:number;
    cooldown:number;
    startingUnit:string;

    batches:Batch[];
}