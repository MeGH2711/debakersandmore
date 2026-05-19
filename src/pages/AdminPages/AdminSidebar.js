import React, { useState, useEffect } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminSidebar.css";

/* ── Simple inline SVG icons (no extra dep needed) ── */
const Icon = ({ d, size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  {
    label: "Products",
    path: "/admin",
    iconPath:
      "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
  },
  {
    label: "Responses",
    path: "/responses",
    iconPath:
      "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  },
  {
    label: "Offers",
    path: "/adminoffer",
    iconPath:
      "M12 2l2.09 6.26H21l-5.47 3.97 2.09 6.26L12 14.52l-5.62 3.97 2.09-6.26L3 8.26h6.91L12 2z",
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Close sidebar on route change (mobile) */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* Lock body scroll when mobile sidebar is open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div
          className="sidebar-brand"
          onClick={() => handleNavClick("/admin")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleNavClick("/admin")}
        >
          <Image
            src={logo}
            alt="Bakery Logo"
            className="sidebar-logo"
          />
          <span className="sidebar-brand-name">De Baker's <br/>Admin Panel</span>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ label, path, iconPath }) => (
            <div
              key={path}
              className="sidebar-nav-item"
              onClick={() => handleNavClick(path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavClick(path)}
              aria-current={location.pathname === path ? "page" : undefined}
            >
              <span className="nav-icon">
                <Icon d={iconPath} />
              </span>
              {label}
            </div>
          ))}

          {/* Spacer pushes logout to bottom */}
          <div style={{ flex: 1 }} />

          {/* Logout */}
          <div
            className="sidebar-nav-item logout-item"
            onClick={() => setShowModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setShowModal(true)}
          >
            <span className="nav-icon">
              <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
            </span>
            Logout
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">© {new Date().getFullYear()} Bakery Admin</div>
      </aside>

      {/* ── Logout confirmation modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-dark logout-modal-header">
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer className="bg-dark">
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

export default AppSidebar;
