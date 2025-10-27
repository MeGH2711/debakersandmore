import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PublicPage from "./pages/MenuPage";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import NavbarPublic from "./components/NavbarPublic";
import OurStory from "./pages/OurStory";
import ContactUs from "./pages/ContactUs";

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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-warning"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fw-semibold text-secondary">Loading, please wait...</p>
        </div>
      </div>
    );

  return (
    <Router>
      <PageTitle />
      <ConditionalNavbar />
      <Routes>
        <Route path="/menu" element={<PublicPage />} />
        <Route path="/" element={<OurStory />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="/admin"
          element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/admin" replace /> : <Login />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// ✅ Hide Navbar on admin and login routes
function ConditionalNavbar() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin") || location.pathname === "/login";
  return !hideNavbar ? <NavbarPublic /> : null;
}

// ✅ Dynamic page titles
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
      case "/contact":
        document.title = "Contact Us | De Baker’s & More";
        break;
      default:
        document.title = "Menu | De Baker’s & More";
    }
  }, [location]);

  return null;
}

export default App;
