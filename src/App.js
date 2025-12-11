import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Admin Panel
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AdminResponses from "./components/AdminResponses";
import AdminOffers from "./components/AdminOffers";

// Public Pages
import NavbarPublic from "./components/NavbarPublic";
import Home from "./pages/Home";
import OurStory from "./pages/OurStory";
import MenuPage from "./pages/MenuPage";
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
        <Route path="/" element={<Home />} />
        <Route path="/ourstory" element={<OurStory />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="/admin"
          element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" replace />}
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
      case "/menu":
        document.title = "Menu | De Baker’s & More";
        break;
      case "/contact":
        document.title = "Contact Us | De Baker’s & More";
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
