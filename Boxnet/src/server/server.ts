//var path = require('path');
import path from "path";
//var fs = require('fs');
import fs from "fs";
//var express = require('express');
import express from "express";
const app = express();

//var passport = require('passport');
import passport from "passport";
//var ensureLoggedIn = require('connect-ensure-login');
import ensureLoggedIn from "connect-ensure-login";

//const mongoose = require('mongoose');
import mongoose from "mongoose";
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import {LobbyHandler} from './game/LobbyHandler';
import {MessageHandler} from './game/MessageHandler';
import * as GoogleStrategy from 'passport-google-oauth20';
import * as LocalStrategy from 'passport-local';

import {Account, IAccount} from './models/Account';

//Static
const publicFolder = path.join(__dirname, './../../client');
app.use(express.static(publicFolder));

app.use(bodyParser.urlencoded({ extended: false, inflate: true }));
app.use(bodyParser.json({ strict: true, inflate: true }));
app.use(cookieParser());

//session store
//const session = require('express-session');
import * as session from "express-session";
import * as connectMongo from 'connect-mongo';
console.log(connectMongo);
const mongoStore = connectMongo(session);
const sessionStore = new mongoStore({ mongooseConnection: mongoose.connection });
app.use(session({
    secret: 'IUsuallyLikeBananas',
    store: sessionStore,
    resave:false,
    saveUninitialized: false,
}));

passport.use(new GoogleStrategy.Strategy({
    clientID: "632928324174-m8i04urim2qtch6h1b9biu1lrbg3lac3.apps.googleusercontent.com",
    clientSecret: "QPMUHiQC3RhCpSkkRij1OzGH",
    callbackURL: "http://djulzhass.duckdns.org:41117/auth/google/callback/",
},
    (accessToken, refreshToken, profile, cb) => {
        findOrCreate({ googleId: profile.id }, profile.displayName, (err, user) => {
            return cb(err, user);
        });
    },
));

function findOrCreate(userObject, name, cb) {
    if (userObject == null || isNaN(userObject.googleId))
        cb("UserObject is not valid", userObject);
    else {
        Account.find({ googleId: userObject.googleId }, (err, result) => {
            console.log(result);
            if (err) return cb(err, null);
            if (result.length === 0) {
                console.log(userObject);
                const p = new Account({
                    name: name,
                    googleId: userObject.googleId,
                });
                p.save((err2, p2:IAccount) => {
                    if (err2) return cb(err, p2);
                });

                result = [p];
            }
            cb(null, result[0]);
        });
    }
}

//Passport-local
passport.use(new LocalStrategy.Strategy(
    (username, password, done) => {
        Account.findOne({ name: username }, (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            //if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    },
));

// function findAccount(userObject, cb) {
//     console.log("find acc");
//     if(Account.findOne({name:userObject.username}))
// }

passport.serializeUser((user, cb) => {
    //console.log("ser", user);
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    //console.log("des", obj);
    cb(null, obj); //{ firstName: 'Foo', lastName: 'Bar' });
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

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    // we're connected!
    console.log("connected");

    //Player = mongoose.model('Player', playerSchema);

});

//const http = require('http').Server(app);
import * as httpImp from "http";
const http = new httpImp.Server(app);
//var https = require('https').Server(httpsOptions, app);
import sio from "socket.io";
const io = sio(http);

//var appSecure = express.createServer(httpsOptions);

//app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

import * as passportSocketIo from "passport.socketio";
io.use(passportSocketIo.authorize({ //configure socket.io
    cookieParser: cookieParser,
    secret: 'IUsuallyLikeBananas',    // make sure it's the same than the one you gave to express
    store: sessionStore,
    success: onAuthorizeSuccess,  // *optional* callback on success
    fail: onAuthorizeFail,     // *optional* callback on fail/error
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if (req.isAuthenticated())
        res.redirect('/game');
    else
        res.redirect('/login');
});

app.get('/game', (req, res) => {
    if (req.isAuthenticated())
        res.sendFile(path.join(publicFolder, 'game.html'));
    else
        res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(publicFolder, 'login.html'));
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        console.log("google login success");
        res.redirect('/game');
    });

app.post('/auth/password',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
        console.log("password login success");
        res.redirect('/game');
    });

app.get('/profile',
    (req, res) => {
        if (req.isAuthenticated()) {
            console.log("profile");
            res.status(200).send(req.user.name);
        } else {
            res.sendStatus(403);
        }
    });

http.listen(41117, () => {
    console.log('listening on *:41117');
});

const lobbyHandler = new LobbyHandler(100);
const messageHandler = new MessageHandler(lobbyHandler);

app.get('/info', (req, res) => {
    //res.sendFile(__dirname + '/index.html');
    const lobbies = [];
    for (const l in lobbyHandler.lobbies)
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

io.on('connection', (socket) => {
    console.log("hi", socket.request.user.name);
    socket.emit('accountData', { name: socket.request.user.name });
    messageHandler.onConnect(socket);
});
