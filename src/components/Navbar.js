import React, { useState } from "react";
import { Navbar, Container, Nav, Image, Modal, Button } from "react-bootstrap";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

const AppNavbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false); // <-- for collapse toggle

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        bg="dark"
        variant="dark"
        expanded={expanded}
        className="app-navbar px-3"
      >
        <Container fluid className="nav-container">
          {/* Logo + Brand */}
          <Navbar.Brand
            onClick={() => {
              navigate("/admin");
              setExpanded(false);
            }}
            className="d-flex align-items-center brand-section"
          >
            <Image
              src={logo}
              alt="Bakery Logo"
              roundedCircle
              className="brand-logo me-2"
            />
          </Navbar.Brand>

          {/* Toggler */}
          <Navbar.Toggle
            aria-controls="navbar-nav"
            onClick={() => setExpanded(expanded ? false : "expanded")}
          />

          {/* Collapsible Nav Links */}
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto align-items-center nav-links">
              <Nav.Link
                onClick={() => {
                  navigate("/admin");
                  setExpanded(false);
                }}
                className="nav-item"
              >
                Products
              </Nav.Link>

              <Nav.Link
                onClick={() => {
                  navigate("/responses");
                  setExpanded(false);
                }}
                className="nav-item"
              >
                Responses
              </Nav.Link>

              <Nav.Link
                onClick={() => {
                  setShowModal(true);
                  setExpanded(false);
                }}
                className="nav-item logout text-danger fw-semibold"
              >
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Logout Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark logout-modal-header">
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light logout-modal-body">
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer className="bg-dark logout-modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppNavbar;