import { useContext, useState } from 'react';
import { Row, Col, Button, Alert, Card, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import GameMap from './GameMap.jsx';
import Timer from './Timer.jsx';
import FeedbackContext from '../contexts/FeedbackContext.js';
import API from '../API.js';
import './GamePage.css'

const emptyGame = { status: 'none' };

const DIFFICULTIES = [
    { key: 'easy', label: 'FACILE', description: 'Percorso breve, 60 secondi a disposizione', colorClass: 'bg-facile', btnClass: 'btn-facile' },
    { key: 'medium', label: 'INTERMEDIO', description: 'Percorso medio, 90 secondi a disposizione', colorClass: 'bg-intermedio', btnClass: 'btn-intermedio' },
    { key: 'hard', label: 'DIFFICILE', description: 'Percorso lungo, 120 secondi a disposizione', colorClass: 'bg-difficile', btnClass: 'btn-difficile' },
];

function GamePage() {
    const [game, setGame] = useState(emptyGame);
    const { setFeedbackFromError } = useContext(FeedbackContext);
    const navigate = useNavigate();

    const handleSelectDifficulty = (difficulty) => {
        API.createGame(difficulty)
            .then(g => setGame(g))
            .catch(err => setFeedbackFromError(err));
    };

    const handleAnswer = (idLocation) => {
        API.answerClue(idLocation)
            .then(g => setGame(g))
            .catch(err => setFeedbackFromError(err));
    };

    const handleExpire = () => {
        API.getCurrentGame()
            .then(g => setGame(g))
            .catch(err => setFeedbackFromError(err));
    };

    const handlePlayAgain = () => setGame(emptyGame);
    const handleExit = () => navigate('/');

    if (game.status === 'none') {
        return <DifficultySelector onDifficultyChosen={handleSelectDifficulty} />;
    }

    if (game.status === 'playing') {
        return (
            <div>
                <Row>
                    <Col md={6} className="mb-3">
                        <GameMap points={game.visited} pathLength={game.pathLength} />
                    </Col>
                    <Col md={6}>
                        <Timer totalTime={game.totalTime} onExpire={handleExpire} />
                        <Clue text={game.clue.text} options={game.clue.options} onAnswer={handleAnswer} />
                    </Col>
                </Row>
                <div className="text-center mt-4">
                    <Button variant="outline-secondary" className="game-exit-button" onClick={handleExit}>ESCI DALLA PARTITA</Button>
                </div>
            </div>
        );
    }

    // game.status === 'won' oppure 'lost'
    return (
        <div>
            <Alert className="alert-title-font" variant={game.status === 'won' ? 'success' : 'danger'}>
                {game.status === 'won'
                    ? `COMPLIMENTI, HAI TROVATO IL TESORO! HAI VINTO ${game.coinsWon} MONETE.`
                    : 'PECCATO, HAI PERSO! NELLA MAPPA VEDRAI IL PERCORSO CHE PORTAVA AL TESORO.'}
            </Alert>
            <Row>
                <Col md={6}>
                    <GameMap points={game.path} pathLength={game.pathLength} />
                </Col>
            </Row>
            <div className="text-center mt-4">
                <Button variant="outline-secondary" className="game-exit-button me-2" onClick={handleExit}>TORNA ALLA HOME</Button>
                <Button className="game-again-button" onClick={handlePlayAgain}>GIOCA ANCORA</Button>
            </div>
        </div>
    );
}

function DifficultySelector(props) {
    return (
        <div className="text-center">
            <h2 className="difficulty-title-font mb-4 mt-5">Scegli la difficoltà</h2>
            <Row className="justify-content-center g-3 mt-5">
                {DIFFICULTIES.map(d => (
                    <Col xs={12} md={4} key={d.key}>
                        <Card>
                            <Card.Body>
                                <Card.Title className="card-title-font">
                                    <span className={`title-highlight ${d.colorClass}`}>
                                        {d.label}
                                    </span>
                                </Card.Title>
                                <Card.Text className="card-description-font">{d.description}</Card.Text>
                                <Button className={`difficulty-button ${d.btnClass}`} onClick={() => props.onDifficultyChosen(d.key)}>
                                    GIOCA
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

function Clue(props) {
    return (
        <div>
            <Card className="clue-title-font mb-3">
                <Card.Body>
                    <Card.Title>Indizio</Card.Title>
                    <Card.Text>{props.text}</Card.Text>
                </Card.Body>
            </Card>

            <ListGroup className="clue-cities-font">
                {props.options.map(loc => (
                    <ListGroup.Item
                        key={loc.idLocation}
                        action
                        onClick={() => props.onAnswer(loc.idLocation)}
                    >
                        {loc.name}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
}

export default GamePage;