var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login');
const mongoose = require('mongoose');

var LobbyHandler = require('./game/LobbyHandler');
var MessageHandler = require('./game/MessageHandler');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var Player;

passport.use(new GoogleStrategy({
    clientID: "632928324174-m8i04urim2qtch6h1b9biu1lrbg3lac3.apps.googleusercontent.com",
    clientSecret: "QPMUHiQC3RhCpSkkRij1OzGH",
    callbackURL: "http://localhost:41117/auth/google/callback/"
},
    function (accessToken, refreshToken, profile, cb) {
        findOrCreate({ googleId: profile.id }, profile.displayName, function (err, user) {
            return cb(err, user);
        });


        //return cb(null, profile);

    }
));

function findOrCreate(userObject, name, cb) {
    if (userObject == null || isNaN(userObject.googleId))
        cb("UserObject is not valid", userObject);
    else {
        Player.find({ googleId: userObject.googleId }, function (err, result) {
            console.log(result);
            if (err) return cb(err, null);
            if (result.length == 0) {
                console.log(userObject);
                var p = new Player({
                    name: name,
                    googleId: userObject.googleId,
                });
                p.save(function (err, p) {
                    if (err) return cb(err, p);
                });

                result = [p];
            }
            cb(null, result[0]);
        });
    }
}

passport.serializeUser(function (user, cb) {
    //console.log("ser", user);
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    //console.log("des", obj);
    cb(null, obj);//{ firstName: 'Foo', lastName: 'Bar' });
});

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


var publicFolder = 'public';

app.use(express.static(publicFolder));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    //res.sendFile(__dirname + '/index.html');
    res.redirect('/login');
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, publicFolder, 'login.html'));
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        console.log("login success");
        res.redirect('/profile');
    });

app.get('/profile',
    function (req, res) {
        if (req.isAuthenticated()) {
            console.log("profile");
            res.status(200).send(req.user);
        }
        else {
            res.sendStatus(403);
        }
    });

var tick = 0, score = 0;


//DB
mongoose.connect('mongodb://192.168.0.105/boxnet');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("connected");
    var Schema = mongoose.Schema;

    var playerSchema = new Schema({
        googleId: Number,
        name: String,
        mmr: { type: Number, default: 1500 },
        gamesPlayed: { type: Number, default: 0 }
    });

    Player = mongoose.model('Player', playerSchema);

});

// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'Zildjian' });
// kitty.save().then(() => console.log('meow'));


http.listen(41117, function () {
    console.log('listening on *:41117');
});


var lobbyHandler = new LobbyHandler(100);
var messageHandler = new MessageHandler(lobbyHandler);

io.on('connection', function (socket) {
    console.log("hi");
    messageHandler.onConnect(socket);
});
