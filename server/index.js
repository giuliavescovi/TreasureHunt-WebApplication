import express from 'express';
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware
import { check, validationResult } from 'express-validator'; // validation middleware
import GameDao from "./game-dao.js";
import UserDao from "./user-dao.js";
import { buildOptions, buildGameStateResponse, finalizeIfExpired, applyAnswer } from "./gameLogic.js";

const userDao = new UserDao();
const gameDao = new GameDao();

/** Authentication-related imports **/
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

/*** init express and set up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

/*** Passport ***/

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserByCredentials(username, password)
    if (!user)
        return callback(null, false, 'Incorrect username or password');

    return callback(null, user);
}));

passport.serializeUser(function (user, callback) {
    callback(null, user);
});

passport.deserializeUser(function (user, callback) {
    return callback(null, user);
});

/** Creating the session */
app.use(session({
    secret: "This is a very secret information used to initialize the session!",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'Not authorized' });
}

/*** Utility Functions ***/

// This function is used to handle validation errors
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({ validationErrors: errors.mapped() });
};

// Only keep the error message in the response
const errorFormatter = ({ msg }) => {
    return msg;
};

// Salva la partita conclusa nel database
const persistIfJustFinished = async (req, game) => {
    if (game.status === 'playing' || game.saved) 
      return;
    
    await gameDao.saveFinishedGame(req.user.idUser, game.difficulty, game.status, game.treasureCoins, 
      game.coinsWon ?? 0, game.startTime, game.totalTime, game.currentStep);
    
    game.saved = true;
};

/*** Users APIs ***/

// POST /api/sessions
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json({ error: info });
        }
        // success, perform the login and establish a login session
        req.login(user, (err) => {
            if (err)
                return next(err);

            return res.json(req.user);
        });
    })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else
        res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
    req.session.game = null; // la partita in corso finisce con la sessione
    req.logout(() => {
        res.end();
    });
});

/*** Leaderboard API ***/

// GET /api/leaderboard
app.get('/api/leaderboard', isLoggedIn, async (req, res) => {
    try {
        const leaderboard = await userDao.getLeaderBoard();
        res.json(leaderboard);
    } catch (err) {
        res.status(503).json({ error: 'Database error while retrieving the leaderboard.' });
    }
});

/*** Game APIs ***/

const difficultyValidation = [
    check('difficulty').isIn(['easy', 'medium', 'hard']),
];

// POST /api/games
app.post('/api/games', isLoggedIn, difficultyValidation, async (req, res) => {
    const invalidFields = validationResult(req);
    if (!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }

    try {
        req.session.game = await gameDao.createGame(req.body.difficulty);
        res.json(buildGameStateResponse(req.session.game));
    } catch (err) {
        res.status(503).json({ error: `Database error during the creation of a new game: ${err}` });
    }
});

// GET /api/games/current
app.get('/api/games/current', isLoggedIn, async (req, res) => {
    let game = req.session.game;
    
    if (!game) {
        return res.status(404).json({ error: 'No game in progress.' });
    }

    game = finalizeIfExpired(game);
    
    try {
        await persistIfJustFinished(req, game);
        res.json(buildGameStateResponse(game));
    } catch (err) {
        res.status(503).json({ error: 'Database error while finalizing the game.' });
    }
});

const answerValidation = [
    check('idLocation').isInt(),
];

// POST /api/games/answers
app.post('/api/games/answers', isLoggedIn, answerValidation, async (req, res) => {
    const invalidFields = validationResult(req);
    if (!invalidFields.isEmpty()) {
        return onValidationErrors(invalidFields, res);
    }

    let game = req.session.game;
    if (!game) {
        return res.status(404).json({ error: 'No game in progress.' });
    }
    if (game.status !== 'playing') {
        return res.status(404).json({ error: 'This game is already over.' });
    }

    try {
        game = finalizeIfExpired(game);

        if (game.status === 'playing') {
            const validOptionIds = buildOptions(game).map(l => l.idLocation);
            if (!validOptionIds.includes(Number(req.body.idLocation))) {
                return res.status(422).json({ error: 'idLocation is not one of the options currently offered for this clue.' });
            }
            game = applyAnswer(game, req.body.idLocation);
        }

        await persistIfJustFinished(req, game);
        res.json(buildGameStateResponse(game));
    } catch (err) {
        res.status(503).json({ error: `Database error during the answer submission: ${err}` });
    }
});

// activate the server
const port = 3001;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});