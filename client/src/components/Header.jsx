import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import './Header.css';

function Header(props) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await props.logout();
        navigate('/');
    };

    return (
        <Navbar variant="dark" expand="lg" className="custom-navbar">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="header-title-font">
                    <i className="bi bi-map-fill me-2" />
                    Caccia al Tesoro
                </Navbar.Brand>

                <Nav className="header-leaderboard-font me-auto">
                    {props.loggedIn && <Nav.Link as={Link} to="/leaderboard">CLASSIFICA</Nav.Link>}
                </Nav>

                <Nav className="align-items-center">
                    {props.loggedIn && (
                        <>
                            <Navbar.Text className="header-user-font me-3">Ciao, {props.user.name}</Navbar.Text>
                            <Button variant="outline-light" className="header-logout-button" onClick={handleLogout}>
                                LOGOUT
                            </Button>
                        </>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
}

export default Header;