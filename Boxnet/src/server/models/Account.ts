import { Document, Schema, Model, model} from "mongoose";
//export let ObjectId = mongoose.Schema.Types.ObjectId;

export interface IAccount extends Document {
    googleId:number;
    //_id: ObjectId,//
    name: string;
    mmr: number;
    gamesPlayed: number;
  }

var accSchema = new Schema({
    googleId: { type: Number, index: true },
    //_id: ObjectId,//
    name: String,
    mmr: { type: Number, default: 1500 },
    gamesPlayed: { type: Number, default: 0 }
});

//export var Account = mongoose.model('Account', accSchema);

export var Account: Model<IAccount> = model<IAccount>("Account", accSchema);

//export Account;
//{
//     DBPlayer: DBPlayer
//}