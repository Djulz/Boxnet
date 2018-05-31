var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login');
const mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


import {LobbyHandler} from './game/LobbyHandler';
import {MessageHandler} from './game/MessageHandler';
import * as GoogleStrategy from 'passport-google-oauth20';
import * as LocalStrategy from 'passport-local';

import {Account} from './models/Account';

//Static
var publicFolder = './../../client';
app.use(express.static(publicFolder));

app.use(bodyParser.urlencoded({ extended: false, inflate: true }));
app.use(bodyParser.json({ strict: true, inflate: true }));
app.use(cookieParser());


//session store
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
app.use(session({
    secret: 'IUsuallyLikeBananas',
    store: sessionStore
}));

passport.use(new GoogleStrategy.Strategy({
    clientID: "632928324174-m8i04urim2qtch6h1b9biu1lrbg3lac3.apps.googleusercontent.com",
    clientSecret: "QPMUHiQC3RhCpSkkRij1OzGH",
    callbackURL: "http://djulzhass.duckdns.org:41117/auth/google/callback/"
},
    function (accessToken, refreshToken, profile, cb) {
        findOrCreate({ googleId: profile.id }, profile.displayName, function (err, user) {
            return cb(err, user);
        });
    }
));

function findOrCreate(userObject, name, cb) {
    if (userObject == null || isNaN(userObject.googleId))
        cb("UserObject is not valid", userObject);
    else {
        Account.find({ googleId: userObject.googleId }, function (err, result) {
            console.log(result);
            if (err) return cb(err, null);
            if (result.length == 0) {
                console.log(userObject);
                var p = new Account({
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

//Passport-local
passport.use(new LocalStrategy.Strategy(
    function (username, password, done) {
        Account.findOne({ name: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            //if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

// function findAccount(userObject, cb) {
//     console.log("find acc");
//     if(Account.findOne({name:userObject.username}))
// }

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


//DB
mongoose.connect('mongodb://192.168.0.105/boxnet');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("connected");

    //Player = mongoose.model('Player', playerSchema);

});


var http = require('http').Server(app);
//var https = require('https').Server(httpsOptions, app);
var io = require('socket.io')(http);

//var appSecure = express.createServer(httpsOptions);





//app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

var passportSocketIo = require("passport.socketio");
io.use(passportSocketIo.authorize({ //configure socket.io
    cookieParser: cookieParser,
    secret: 'IUsuallyLikeBananas',    // make sure it's the same than the one you gave to express
    store: sessionStore,
    success: onAuthorizeSuccess,  // *optional* callback on success
    fail: onAuthorizeFail,     // *optional* callback on fail/error
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    if (req.isAuthenticated())
        res.redirect('/game');
    else
        res.redirect('/login');
});

app.get('/game', function (req, res) {
    if (req.isAuthenticated())
        res.sendFile(path.join(__dirname, publicFolder, 'game.html'));
    else
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
        console.log("google login success");
        res.redirect('/game');
    });

app.post('/auth/password',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        console.log("password login success");
        res.redirect('/game');
    });


app.get('/profile',
    function (req, res) {
        if (req.isAuthenticated()) {
            console.log("profile");
            res.status(200).send(req.user.name);
        }
        else {
            res.sendStatus(403);
        }
    });

http.listen(41117, function () {
    console.log('listening on *:41117');
});


var lobbyHandler = new LobbyHandler(100);
var messageHandler = new MessageHandler(lobbyHandler);

app.get('/info', function (req, res) {
    //res.sendFile(__dirname + '/index.html');
    var lobbies = [];
    for (var l in lobbyHandler.lobbies)
        lobbies.push({ name: l, players: lobbyHandler.lobbies[l].players.map(x => x.name) });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        lobbies: lobbies,
        count: lobbies.length,
    }, null, 3));
});

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept(); //Let the user through
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) accept(new Error(message));
    console.log('failed connection to socket.io:', message);
    accept(null, false);
}

io.on('connection', function (socket) {
    console.log("hi", socket.request.user.name);
    socket.emit('accountData', { name: socket.request.user.name });
    messageHandler.onConnect(socket);
});
