import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import logo from "./assets/images/logo.png";

// Admin Panel
import Login from "./pages/AdminPages/Login";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import AdminCakes from "./pages/AdminPages/AdminCakes";
import AdminResponses from "./pages/AdminPages/AdminResponses";
import AdminOffers from "./pages/AdminPages/AdminOffers";

// Public Pages
import ScrollToTop from "./components/ScrollToTop";
import NavbarPublic from "./components/NavbarPublic";
import Home from "./pages/Home";
import OurStory from "./pages/OurStory";
import CakesPage from "./pages/CakesPage";
import MenuPage from "./pages/MenuPage";
import ContactUs from "./pages/ContactUs";
import OffersPage from "./pages/OffersPage";

import { Analytics } from '@vercel/analytics/react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isLoggedIn === null)
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100vh", background: "#0a0a0a"
      }}>
        <div style={{
          position: "relative", width: 140, height: 140,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {/* Spinning ring */}
          <svg style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            animation: "db-spin 2.2s linear infinite"
          }}
            viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="64" fill="none" stroke="#1f1f1f" strokeWidth="4" />
            <circle cx="70" cy="70" r="64" fill="none" stroke="#dc2626" strokeWidth="4"
              strokeDasharray="80 320" strokeLinecap="round" />
            <circle cx="70" cy="70" r="64" fill="none" stroke="#991b1b" strokeWidth="2"
              strokeDasharray="30 370" strokeLinecap="round" strokeDashoffset="160" />
          </svg>
          {/* Pulsing logo */}
          <img src={logo} alt="De Bakers & More"
            style={{
              width: 100, height: 100, borderRadius: "50%", objectFit: "contain",
              animation: "db-pulse 2.2s ease-in-out infinite"
            }} />
        </div>

        {/* Bouncing dots */}
        <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%", background: "#dc2626",
              animation: `db-dot 1.4s ease-in-out ${delay}s infinite`
            }} />
          ))}
        </div>

        <p style={{
          marginTop: 14, fontFamily: "Georgia, serif", fontSize: 13,
          letterSpacing: "0.18em", color: "#9ca3af", textTransform: "uppercase"
        }}>
          Loading, please wait
        </p>
      </div>
    );

  return (
    <Router>
      <ScrollToTop />
      <PageTitle />
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ourstory" element={<OurStory />} />
        <Route path="/cakes" element={<CakesPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/offers" element={<OffersPage />} />

        {/* Admin Pages */}
        <Route
          path="/admin"
          element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admincakes"
          element={isLoggedIn ? <AdminCakes /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/responses"
          element={isLoggedIn ? <AdminResponses /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/adminoffer"
          element={isLoggedIn ? <AdminOffers /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/admin" replace /> : <Login />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      <Analytics />
    </Router>
  );
}

// Hide Navbar on admin and login routes
function ConditionalNavbar() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin") || location.pathname.startsWith("/responses") || location.pathname.startsWith("/adminoffer") || location.pathname === "/login";
  return !hideNavbar ? <NavbarPublic /> : null;
}

// Dynamic page titles
function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case "/login":
        document.title = "Login | De Baker’s & More Admin";
        break;
      case "/admin":
        document.title = "Dashboard | De Baker’s & More Admin";
        break;
      case "/":
        document.title = "De Baker’s & More";
        break;
      case "/ourstory":
        document.title = "Our Story | De Baker’s & More";
        break;
      case "/cakes":
        document.title = "Cakes | De Baker’s & More";
        break;
      case "/menu":
        document.title = "Menu | De Baker’s & More";
        break;
      case "/contact":
        document.title = "Contact Us | De Baker’s & More";
        break;
      case "/offers":
        document.title = "Offers | De Baker’s & More";
        break;
      case "/responses":
        document.title = "Customer Responses | De Baker’s & More";
        break;
      case "/adminoffer":
        document.title = "Offers Management | De Baker’s & More";
        break;
      default:
        document.title = "De Baker’s & More";
    }
  }, [location]);

  return null;
}

export default App;
