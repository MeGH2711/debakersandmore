import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./NavbarPublic.css";
import logo from "../assets/images/logo.png";

function NavbarPublic() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNavbar(false);
      } else {
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

        {/* Custom Animated Hamburger */}
        <div
          className={`hamburger ${openMenu ? "open" : ""}`}
          onClick={() => setOpenMenu(!openMenu)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <Navbar.Collapse
          id="basic-navbar-nav"
          className={`justify-content-end ${openMenu ? "show" : ""}`}
        >
          <Nav className="nav-links">
            <NavLink to="/" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
              Home
            </NavLink>
            <NavLink to="/ourstory" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
              Our Story
            </NavLink>
            <NavLink to="/menu" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
              Menu
            </NavLink>
            <NavLink to="/contact" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
              Contact Us
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarPublic;