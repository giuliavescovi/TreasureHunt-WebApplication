import { useContext, useEffect, useState } from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import FeedbackContext from '../contexts/FeedbackContext.js';
import API from '../API.js';
import './LeaderBoard.css'

function LeaderBoard() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setFeedbackFromError } = useContext(FeedbackContext);
    const navigate = useNavigate();

    useEffect(() => {
        API.getLeaderboard()
            .then(ranking => setRanking(ranking))
            .catch(err => setFeedbackFromError(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Spinner animation="border" className="d-block mx-auto mt-5" />;
    }

    return (
        <div>
            <h1 className="leaderboard-title-font mt-3">Classifica generale</h1>
            <Table striped bordered hover className="leaderboard-table-font mt-4">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>NOME</th>
                        <th>MONETE TOTALI</th>
                    </tr>
                </thead>
                <tbody>
                    {ranking.map((row, i) => (
                        <tr key={row.name}>
                            <td>{i + 1}</td>
                            <td>{row.name}</td>
                            <td>{row.totalCoins}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <div className="text-center mt-3">
                <Button variant="outline-secondary" className="exit-leader-button mt-2" onClick={() => navigate('/')}>ESCI</Button>
            </div>
        </div>
    );
}

export default LeaderBoard;