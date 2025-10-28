import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./NavbarPublic.css";
import logo from "../assets/images/logo.png";

function NavbarPublic() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        // scrolling down
        setShowNavbar(false);
      } else {
        // scrolling up
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <Navbar
      expand="lg"
      className={`public-navbar shadow-sm ${showNavbar ? "slide-down" : "slide-up"}`}
    >
      <Container>
        <Navbar.Brand className="d-flex align-items-center">
          <img src={logo} alt="De Baker’s & More Logo" className="brand-logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="nav-toggle" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="nav-links">
            <NavLink to="/" className="nav-link-custom">
              Our Story
            </NavLink>
            <NavLink to="/menu" className="nav-link-custom">
              Menu
            </NavLink>
            <NavLink to="/contact" className="nav-link-custom">
              Contact Us
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarPublic;