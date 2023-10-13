
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';
import { ensureLoggedIn } from 'connect-ensure-login';

import { SingupTokenManager } from '../dal/mongo/token.access.js';
import { RespondentManager } from '../dal/mongo/respondent.access.js';

import { UserManager } from '../dal/mongo/user.access.js';
import { dbClient } from '../dal/mongo/core.access.js';
import { IUser } from '../models/user.model.js';
import { TWithId, TObjectId } from '../models/common.model.js';

const userManager = new UserManager(dbClient);
const tokenManager = new SingupTokenManager(dbClient);
const respondentManager = new RespondentManager(dbClient);

function verify(email: string, password: string,
    done: (error: any, user?: false | Express.User, options?: IVerifyOptions) => void) {

    userManager.findByEmail(email).then(
        userData => {
            if (!userData) { return done(null, false, { message: 'Incorrect username or password.' }); }
            if (!userManager.checkPassword(userData, password)) {
                return done(null, false, { message: 'Incorrect username or password.' })
            }
            return done(null, userData);
        },
        err => done(err)
    )
}

passport.use(new LocalStrategy({ usernameField: 'email' }, verify));

passport.serializeUser(function (user: TWithId<IUser>, done) {
    done(null, user._id);
});

passport.deserializeUser(function (_id: TObjectId, done) {
    userManager.findById(_id).then(
        userData => done(null, userData),
        err => done(err, false)
    );
});

export const router = express.Router();

router.post('/login',
    (req, res, next) => {
        console.log('login path entered');
        next()
    },
    /* passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true
    }) */

    function (req, res, next) {
        // call passport authentication passing the "local" strategy name and a callback function
        passport.authenticate('local', function (error, user, info) {
            // this will execute in any case, even if a passport strategy will find an error
            // log everything to console
            if (error) console.log(error);
            if (user) console.log(user);
            if (info) console.log(info);

            if (error) {
                res.status(401).send(error);
            } else if (!user) {
                res.status(401).send(info);
            } else {
                req.login(user, function (error) {
                    if (error) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        })(req, res);
    }


);

router.post('/register-admin-user', (req, res) => {
    
    console.log('register-admin-user');
    const { email, password, scope } = req.body;
    userManager.createUser({ email, password, scope }).then(
        () => res.sendStatus(200),
        err => res.status(400).send(err));
});


router.post('/signup', async (req, res) => {
    console.log('signup');
    const { token, password } = req.body;
    try {
        const tokenData = await tokenManager.findById(token)
        if (!tokenData || tokenData.userId) {
            throw `Token ${token} is invalid`;
        }

        const respondent = await respondentManager.findById(tokenData.respondentId);
        if (!respondent) {
            throw `Respondent with id ${tokenData.respondentId} for token ${token} not found`;
        }

        const newUserData = {
            email: respondent.email,
            scope: tokenData.scope,
            respondentId: respondent._id,
            password,
            companyId: respondent.companyId
        }

        const user = await userManager.createUser(newUserData);
        await tokenManager.update(token, { ...tokenData, userId: user._id });

        res.sendStatus(200);

    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/logout', ensureLoggedIn, function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});



