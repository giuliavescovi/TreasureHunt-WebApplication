import { Link } from 'react-router';

function NotFound() {
    return (
        <div className="text-center mt-5">
            <h1>Errore - Pagina non trovata</h1>
            <Link to="/">Torna alla home</Link>
        </div>
    );
}

export default NotFound;