var mongoose = require("mongoose");

var accSchema = new mongoose.Schema({
    googleId: { type: Number, index: true },
    name: String,
    mmr: { type: Number, default: 1500 },
    gamesPlayed: { type: Number, default: 0 }
});

var Account = mongoose.model('Account', accSchema);

module.exports = Account;
//{
//     DBPlayer: DBPlayer
//}