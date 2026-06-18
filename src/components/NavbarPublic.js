import React, { useEffect, useState, useRef } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./NavbarPublic.css";
import logo from "../assets/images/logo.png";

function NavbarPublic() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);
  const collapseRef = useRef(null);

  // Hide Navbar on Scroll
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

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e) => {
      if (collapseRef.current && !collapseRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  return (
    <>
      <Navbar
        expand="lg"
        className={`public-navbar shadow-sm ${showNavbar ? "slide-down" : "slide-up"}`}
        ref={collapseRef}
      >
        <Container>
          <Navbar.Brand className="d-flex align-items-center">
            <img src={logo} alt="De Baker's & More Logo" className="brand-logo" />
          </Navbar.Brand>

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
              <NavLink to="/offers" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
                Offers
              </NavLink>
              <NavLink to="/menu" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
                Menu
              </NavLink>
              <NavLink to="/cakes" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
                Cakes
              </NavLink>
              <NavLink to="/contact" className="nav-link-custom" onClick={() => setOpenMenu(false)}>
                Contact Us
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavbarPublic;