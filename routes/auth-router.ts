
import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';

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

passport.serializeUser((user: TWithId<IUser>, done) => {
    done(null, user._id);
});

passport.deserializeUser((_id: TObjectId<IUser>, done) => {
    userManager.findById(_id).then(
        userData => done(null, userData),
        err => done(err, false)
    );
});

export const router = express.Router();

router.post('/login',
    /*  passport.authenticate('local', {
         //successReturnToOrRedirect: '/',
         //failureRedirect: '/login',
         failureMessage: true
     }) */

    function (req, res, next) {
        // call passport authentication passing the "local" strategy name and a callback function
        passport.authenticate('local', (error, user, info) => {
            // this will execute in any case, even if a passport strategy will find an error
            // log everything to console
            if (error) console.log(error);
            if (user) console.log('user=', user);
            if (info) console.log(info);

            if (error) {
                res.status(500).json(error);
            } else if (!user) {
                console.log(info);
                res.status(401).json(info);
            } else {
                req.login(user, error => {
                    if (error) {
                        res.status(500).json(error);
                    } else {
                        const partialUser = Object.assign({}, user) as TWithId<IUser>;
                        delete partialUser.salt;
                        delete partialUser.hashed_password;
                        res.json(partialUser);
                    }
                });
            }
        })(req, res);
    }
);

router.post('/register-admin-user', (req, res) => {

    console.log('register-admin-user');
    const { email, password, scope } = req.body;
    userManager.createUser({ email, password, scope, companyId: undefined }).then(
        () => res.sendStatus(200),
        err => res.status(400).send(err));
});


router.post('/signup', async (req, res) => {
    console.log('signup');
    const { token, password } = req.body;
    try {

        const tokenData = await tokenManager.validateToken(token)
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
        await tokenManager.update(token, { userId: user._id });

        res.sendStatus(200);

    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/me', (req, res, next) => {
    if (req.isAuthenticated()) {
        const user = Object.assign({}, req.user) as TWithId<IUser>;
        delete user.salt;
        delete user.hashed_password;
        res.json(user);
    } else {
        res.json(null);
    }
});

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.sendStatus(200);
    });
});



