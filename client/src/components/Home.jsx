import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import './Home.css';

function Home(props) {
    const navigate = useNavigate();

    return (
        <Container className="mt-4">
            <h1 className="title-font text-center ">CACCIA AL TESORO</h1>
            <p className="description-font text-center mt-4">
                All'inizio di ogni partita ti verrà assegnata una mappa e un indizio di partenza. Scegli 
                il luogo giusto tra quelli proposti: se indovini, la mappa si aggiorna e ricevi 
                l&apos;indizio successivo. Se sbagli luogo o il tempo a disposizione scade, la partita finisce subito. <br />
                Raggiungi il tesoro prima che scada il tempo per vincere le monete!
            </p>
            <ul className="description2-font mx-auto text-start" style={{ maxWidth: '800px', width: 'fit-content' }}>
                <li>Tre livelli di difficoltà: Facile, Intermedio, Difficile.</li>
                <li>Più luoghi e percorso più lungo all'aumentare della difficoltà.</li>
                <li>Il tesoro contiene una quantità di monete diversa ad ogni partita.</li>
            </ul>

            <div className="text-center mt-5">
                {props.loggedIn ? (
                    <Button size="lg" className="access-logged-button" onClick={() => navigate('/game')}>
                        INIZIA UNA NUOVA PARTITA
                    </Button>
                ) : (
                    <Button size="lg" className="access-button" onClick={() => navigate('/login')}>
                        ACCEDI PER GIOCARE
                    </Button>
                )}
            </div>
        </Container>
    );
}

export default Home;