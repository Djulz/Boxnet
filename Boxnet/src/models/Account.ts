var mongoose = require("mongoose");
//export let ObjectId = mongoose.Schema.Types.ObjectId;

var accSchema = new mongoose.Schema({
    googleId: { type: Number, index: true },
    //_id: ObjectId,//
    name: String,
    mmr: { type: Number, default: 1500 },
    gamesPlayed: { type: Number, default: 0 }
});

export var Account = mongoose.model('Account', accSchema);

//export Account;
//{
//     DBPlayer: DBPlayer
//}