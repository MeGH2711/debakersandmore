// src/components/Navbar.js
import React, { useState } from "react";
import { Navbar, Container, Nav, Image, Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";

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
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="border-0 text-warning"
          />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link
                onClick={() => setShowModal(true)}
                className="text-warning mx-2 fw-semibold"
                style={{ cursor: "pointer" }}
              >
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-dark" closeButton>
          <Modal.Title className="fw-semibold text-danger">
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <p className="mb-0">
            Are you sure you want to log out of your account?
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="fw-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            className="fw-semibold"
          >
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppNavbar;