import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import { Container, Toast, ToastBody } from 'react-bootstrap';
import { Route, Routes, Navigate } from 'react-router';

import Header from './components/Header.jsx';
import Home from './components/Home.jsx';
import { LoginForm } from './components/Login.jsx';
import GamePage from './components/GamePage.jsx';
import LeaderBoard from './components/LeaderBoard.jsx';
import NotFound from './components/NotFound.jsx';
import FeedbackContext from './contexts/FeedbackContext.js';
import API from './API.js';

function App() {
    const emptyUser = { idUser: -1, username: '', name: '' };
    const [user, setUser] = useState(emptyUser);
    const [loggedIn, setLoggedIn] = useState(false);
    const [feedback, setFeedback] = useState('');

    const setFeedbackFromError = (err) => {
        setFeedback(err.message ? err.message : 'Unknown error');
    };

    useEffect(() => {
        API.getUserInfo()
            .then(user => {
                setUser(user);
                setLoggedIn(true);
            })
            .catch(() => {
                setUser(emptyUser);
                setLoggedIn(false);
            });
    }, []);

    const handleLogin = async (credentials) => {
        const user = await API.logIn(credentials);
        setUser(user);
        setLoggedIn(true);
        setFeedback(`Benvenuto/a, ${user.name}!`);
    };

    const handleLogout = async () => {
        await API.logOut();
        setUser(emptyUser);
        setLoggedIn(false);
    };

    return (
        <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError }}>
            <div className="min-vh-100 d-flex flex-column">
                <Header loggedIn={loggedIn} user={user} logout={handleLogout} />
                <Container fluid className="flex-grow-1 d-flex flex-column py-3">
                    <Routes>
                        <Route path="/" element={<Home loggedIn={loggedIn} />} />

                        <Route path="/login" element={
                            loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />
                        } />

                        <Route path="/game" element={
                            !loggedIn ? <Navigate replace to="/login" /> : <GamePage />
                        } />

                        <Route path="/leaderboard" element={
                            !loggedIn ? <Navigate replace to="/login" /> : <LeaderBoard />
                        } />

                        <Route path="*" element={<NotFound />} />
                    </Routes>

                    <Toast
                        show={feedback !== ''}
                        onClose={() => setFeedback('')}
                        delay={4000}
                        autohide
                        position="top-end"
                        className="position-fixed end-0 m-3"
                    >
                        <ToastBody>{feedback}</ToastBody>
                    </Toast>
                </Container>
            </div>
        </FeedbackContext.Provider>
    );
}

export default App;