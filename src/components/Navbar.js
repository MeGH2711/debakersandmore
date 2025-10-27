// src/components/Navbar.js
import React from "react";
import { Navbar, Container, Nav, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";

const AppNavbar = () => {

    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully!");
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Logout failed! Please try again.");
        }
    };

    return (
        <Navbar
            bg="dark"
            variant="dark"
            expand="lg"
            className="px-4 py-2 shadow-sm border-bottom border-warning"
            style={{ fontFamily: "Poppins, sans-serif" }}
        >
            <Container fluid>
                {/* Left Side: Logo + Brand Name */}
                <Navbar.Brand className="d-flex align-items-center gap-2 text-warning fw-bold">
                    <Image
                        src={logo}
                        alt="Bakery Logo"
                        roundedCircle
                        height="75"
                        width="75"
                    />
                </Navbar.Brand>

                {/* Responsive Toggle */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 text-warning" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link
                            onClick={handleLogout}
                            className="text-warning mx-2 fw-semibold"
                            style={{ cursor: "pointer" }}
                        >
                            Logout
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;