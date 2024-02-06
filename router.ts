import express from 'express';
/* import Tokens from 'csrf'; */
import passport from 'passport';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { type MongoClient } from 'mongodb';

import { getRouter as authRouter } from './routes/auth-router.js';
import { getRouter as mainRouter } from './routes/main-router.js';
import { getRouter as respondentsRouter } from './routes/respondents-router.js';
import { getRouter as departmentsRouter } from './routes/departments-router.js';
import { getRouter as companiesRouter } from './routes/companies-router.js';
import { getRouter as tokensRouter } from './routes/signup-tokens-router.js';
import { getRouter as surveysRouter } from './routes/surveys-router.js';
import { getRouter as reportsRouter } from './routes/reports-router.js';

import serverConfig from './server.config.json' assert { type: "json"};
import { type Server } from 'http';
import { IDomainManagers } from './models/common.model.js';

export const startWebServer = (dbClientPromise: Promise<MongoClient>, domainManagers: IDomainManagers) => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(process.cwd(), 'ui')));

    const mongoStore = MongoStore.create({ clientPromise: dbClientPromise });

    app.use(session({
        secret: serverConfig.sessionSecret,
        resave: false,
        //rolling: true,
        saveUninitialized: false, // don't create session until something stored
        store: mongoStore,
        cookie: {
            //maxAge: 10 * 60 * 1000, //10 minutes
            httpOnly: false,
            secure: false,
            /* sameSite: 'lax' */
        },
    }));
    /* app.use(new Tokens()); */
    app.use(passport.authenticate('session'));


  


    /* app.use(function (req, res, next) {
        res.locals.csrfToken = req.csrfToken();
        next();
    }); */


    app.use('/api/auth', authRouter(domainManagers));
    app.use('/api/tokens', tokensRouter(domainManagers));
    app.use('/api/surveys', surveysRouter(domainManagers));
    app.use('/api/respondents', respondentsRouter(domainManagers));
    app.use('/api/departments', departmentsRouter(domainManagers));
    app.use('/api/companies', companiesRouter(domainManagers));
    app.use('/api/reports', reportsRouter(domainManagers));
    //app.use('**', mainRouter);

    const webServer = app.listen(serverConfig.port, () => {
        console.log('App started on port', serverConfig.port);
    })

    return webServer;
}

export const gracefulWebServerShutdown = (server: Server) => {
    server.close(() => {
        console.log('HTTP server closed');
    })
}