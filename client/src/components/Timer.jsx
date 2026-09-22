import { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import './GamePage.css'

function Timer(props) {
    const [secondsLeft, setSecondsLeft] = useState(props.totalTime);

    // Un solo intervallo, che si ferma da solo (e si autopulisce) all'arrivo a 0.
    useEffect(() => {
        const intervalId = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (secondsLeft === 0) {
            props.onExpire();
        }
    }, [secondsLeft]);

    const percentage = (secondsLeft / props.totalTime) * 100;

    return (
        <div className="mb-3">
            <div className="timer-font d-flex justify-content-between">
                <span>Tempo rimanente</span>
                <span>{secondsLeft}s</span>
            </div>
            <ProgressBar now={percentage} variant={percentage < 25 ? 'danger' : 'success'} />
        </div>
    );
}

export default Timer;
