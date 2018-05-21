var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();

var LobbyHandler = require('./game/LobbyHandler');
var MessageHandler = require('./game/MessageHandler');

//SSL
//var key = fs.readFileSync('certs/djulz-linux_radiorunners_private.key');
//var cert = fs.readFileSync('certs/djulz-linux_radiorunners.crt');

//var httpsOptions = {
//    key: key,
//    cert: cert,
//    passphrase: "SuE89p91F1rad"
//};


var http = require('http').Server(app);
//var https = require('https').Server(httpsOptions, app);
var io = require('socket.io')(http);

//var appSecure = express.createServer(httpsOptions);



app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var tick = 0, score = 0;



http.listen(41117, function () {
    console.log('listening on *:41117');
});


var lobbyHandler = new LobbyHandler(100);
var messageHandler = new MessageHandler(lobbyHandler);

io.on('connection', function (socket) {
    console.log("hi");
    messageHandler.onConnect(socket);
});
