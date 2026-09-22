const SERVER_URL = 'http://localhost:3001/api';

/*** Sessions (login / logout) ***/

const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // cookie di sessione
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
      .then(response => response.json());
};

const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include',
    }).then(handleInvalidResponse)
      .then(response => response.json());
};

const logOut = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include',
    }).then(handleInvalidResponse);
};

/*** Leaderboard ***/

const getLeaderboard = async () => {
    return await fetch(SERVER_URL + '/leaderboard', {
        credentials: 'include',
    }).then(handleInvalidResponse)
      .then(response => response.json());
};

/*** Game ***/

const createGame = async (difficulty) => {
    return await fetch(SERVER_URL + '/games', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ difficulty }),
    }).then(handleInvalidResponse)
      .then(response => response.json());
};

const getCurrentGame = async () => {
    return await fetch(SERVER_URL + '/games/current', {
        credentials: 'include',
    }).then(handleInvalidResponse)
      .then(response => response.json());
};

const answerClue = async (idLocation) => {
    return await fetch(SERVER_URL + '/games/answers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idLocation }),
    }).then(handleInvalidResponse)
      .then(response => response.json());
};

/*** Utility ***/

function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1) {
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}

const API = { logIn, getUserInfo, logOut, getLeaderboard, createGame, getCurrentGame, answerClue };
export default API;