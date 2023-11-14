import { isSameCompanyRequestGuard } from './routes/guards.js';
import express from 'express';
/* import Tokens from 'csrf'; */
import passport from 'passport';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';

/* Остановился на том, что нужно параметр companyId перенести в use этот, а в генерик роутер передавать в виде замыкания */

import { dbClientPromise, dbCloseConnection } from './dal/mongo/core.access.js';

import serverConfig from './server.config.json' assert { type: "json"};

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



import { router as authRouter } from './routes/auth-router.js';

app.use(passport.authenticate('session'));


import { router as mainRouter } from './routes/main-router.js';
import { router as respondentsRouter } from './routes/respondents-router.js';
import { router as departmentsRouter } from './routes/departments-router.js';
import { router as companiesRouter } from './routes/companies-router.js';
import { router as tokensRouter } from './routes/tokens-router.js';
import { router as surveysRouter } from './routes/surveys-router.js';
import { router as reportsRouter } from './routes/reports-router.js';


/* app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
}); */


app.use('/auth', authRouter);
app.use('/tokens', tokensRouter);
app.use('/surveys', surveysRouter);
app.use('/respondents', respondentsRouter);
app.use('/departments', departmentsRouter);
app.use('/companies', companiesRouter);
app.use('/reports', reportsRouter);
app.use('/', mainRouter);


const webServer = app.listen(serverConfig.port, () => {
    console.log('App started on port', serverConfig.port);
})

const gracefulShutdown = () => {
    dbCloseConnection();
    webServer.close(() => {
        console.log('HTTP server closed');
    })
}

process.on('SIGTERM', () => {
    gracefulShutdown();
})
