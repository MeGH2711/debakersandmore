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
      <Navbar expand="lg" className="app-navbar">
        <Container fluid className="nav-container">
          {/* Logo + Brand */}
          <div className="brand-section" onClick={() => navigate("/admin")}>
            <Image src={logo} alt="Bakery Logo" roundedCircle className="brand-logo" />
          </div>

          {/* Navigation Links */}
          <Nav className="nav-links">
            <Nav.Link onClick={() => navigate("/admin")} className="nav-item">
              Products
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/responses")} className="nav-item">
              Responses
            </Nav.Link>
            <Nav.Link onClick={() => setShowModal(true)} className="nav-item logout">
              Logout
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Logout Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="logout-modal-header">
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="logout-modal-body">
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer className="logout-modal-footer">
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