import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button, Row, Col } from "react-bootstrap";
import {useNavigate} from 'react-router-dom';
import { FaReact } from "react-icons/fa";

export const NavBar = () => {
    const navigate = useNavigate();
    const [activeLink, setActiveLink] = useState("home");

    const goToDashboard = () => {
      navigate('/dashboard');
    };

    return (
        <Container>
            <Navbar className='home-header' expand='md' sticky="top">
                <Container className="d-flex flex-row">
                    <Col md={6} className="d-flex">
                        <Navbar.Brand href="#home">
                            <FaReact />
                        </Navbar.Brand>
                        <Nav className="nav me-auto">
                            <Nav.Link href="/" className={activeLink === "home"?"active":""} onClick={() => setActiveLink("home")}>Home</Nav.Link>
                            <Nav.Link href="/features" className={activeLink === "features"?"active":""} onClick={() => setActiveLink("features")}>Features</Nav.Link>
                            <Nav.Link href="/pricing" className={activeLink === "pricing"?"active":""} onClick={() => setActiveLink("pricing")}>Pricing</Nav.Link>
                        </Nav>
                    </Col>
                    <Col className="d-flex align-items-center justify-content-end">
                        <Nav>
                            <Nav.Link><Button className="secondary-button">Sign In</Button>{' '}</Nav.Link>
                            <Nav.Link><Button onClick={goToDashboard}>Get Started</Button>{' '}</Nav.Link>
                        </Nav>
                    </Col>
                </Container>
            </Navbar>
        </Container>
    );
}