/**
 * Created by geeku on 02/06/2017.
 */
const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cookieParser());

var db = new sqlite3.Database('geeguestbook');

const jwtSecret = 'guilty crown';

app.get('/', function (req, res) {
    console.log(__dirname + '/index.html');
    res.sendFile(__dirname + '/index.html');
});
app.get('/signin', function (req, res) {
    const sessionid = req.query.sessionid;
    if (!sessionid) {
       res.send('ERROR');
    }
    res.cookie('sessionid', req.query.sessionid, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
        httpOnly: true
    });
    axios({
        method: 'get',
        url: 'http://localhost:3001/auth?sessionid=' + sessionid
    }).then(r => {
        const token = jwt.sign(r.data.user, jwtSecret);
        res.cookie('jwt', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: '/'
        });
        res.redirect('/');
    });
});
app.post('/comment', function (req, res) {
    if (jwt.verify(req.cookies.jwt, jwtSecret)) {
        res.json({state: 1});
    }
});

app.listen(3002, function () {
    console.log('I\'m testing on port 3002! ψ(｀∇´)ψ');
});