import { Faction, Batch } from "../Faction";

export const SandPeople = () => {
    const f = new Faction();
    f.name = "Sand People";
    f.startingUnit = "core";
    f.batches = [new Batch(["tunneler", "quaker", "tunneler"])];
    f.cooldown = 2;
    f.foresight = 5;
    f.desc = "Likes sand";
    return f;
};