var mongoose = require("mongoose");

var playerSchema = new mongoose.Schema({
    googleId: { type: Number, index: true },
    name: String,
    mmr: { type: Number, default: 1500 },
    gamesPlayed: { type: Number, default: 0 }
});

var DBPlayer = mongoose.model('DBPlayer', playerSchema);

module.exports = DBPlayer;
//{
//     DBPlayer: DBPlayer
//}