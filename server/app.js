/**
 * Created by geeku on 27/05/2017.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import RedisExpress from 'connect-redis';
import { redis } from './conf/database';
import githubOAuth from './oauth/github';
import Auth from './controller/auth';
import Signout from './controller/signout';
import checkName from './controller/checkName';

import DBSync from './model/sync';

// DBSync(true) will drop all tables and create new tables
DBSync();

const RedisStore = RedisExpress(session);

const app = express();

// app.use(express.static(__dirname + '/view/'));
app.use(cookieParser());
app.use(bodyParser());
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
app.use(session({
    store: new RedisStore(redis),
    resave: false,
    saveUninitialized: true,
    secret: 'El psy congroo',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.get('/', function (req, res) {
    const session = req.session || '';
    req.query.redirectUrl && (session.redirectUrl = req.query.redirectUrl);

    if (session.isLogin === true && session.redirectUrl) {
        const redirectUrl = `${session.redirectUrl}/?sessionid=${session.id}`;
        res.redirect(redirectUrl);
        return;
    }
    res.redirect('/login/');

	// res.sendFile(__dirname + '/view/index.html');
});

app.get('/github', githubOAuth);
app.get('/auth', Auth);
app.get('/signout', Signout);
app.post('/checkName', checkName);
app.get('/session', function (req, res) {
    console.log(req.sessionStore);
    req.sessionStore.get(req.sessionID, function (error, d) {
        console.log(req.sessionID);
        res.send({error,d});
    });
    req.sessionStore.length(function (error, d) {
        console.log(error, d);
    });
});

app.listen(3000, function () {
	console.log('I\'m listening on port 3000! ψ(｀∇´)ψ');
});