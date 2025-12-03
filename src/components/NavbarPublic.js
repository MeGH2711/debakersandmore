import React, { useEffect, useState } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./NavbarPublic.css";
import logo from "../assets/images/logo.png";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function NavbarPublic() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);

  // Offer States
  const [offers, setOffers] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  // Fetch Offers from Firestore
  // Fetch Offers from Firestore
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offersSnapshot = await getDocs(collection(db, "offers"));

        const offerList = offersSnapshot.docs
          .map(doc => doc.data())
          .filter(offer => offer.active === true)
          .map(offer => offer.offerText);

        setOffers(offerList);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, []);

  // Auto change offer every 4 seconds
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [offers]);

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

  return (
    <>
      <Navbar
        expand="lg"
        className={`public-navbar shadow-sm ${showNavbar ? "slide-down" : "slide-up"}`}
      >
        <Container>
          <Navbar.Brand className="d-flex align-items-center">
            <img src={logo} alt="De Baker’s & More Logo" className="brand-logo" />
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

      {/* OFFER BAR */}
      {offers.length > 0 && (
        <div className="top-offer-bar">
          <div className={`offer-text ${offers.length > 1 ? "fade-animation" : ""}`}>
            {offers[currentOfferIndex]}
          </div>
        </div>
      )}
    </>
  );
}

export default NavbarPublic;