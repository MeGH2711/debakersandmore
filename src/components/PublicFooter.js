import React from "react";
import "./PublicFooter.css";

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="footer-content">
        <h5 className="footer-title">De Baker’s & More</h5>
        <p className="footer-text">
          Baked with love, served with happiness — since 2023
        </p>
        <p className="footer-text">Ahmedabad, Gujarat, India</p>
        <hr className="footer-divider" />
        <p className="footer-copy">
          © {currentYear} De Baker’s & More | All Rights Reserved
        </p>

        <p className="footer-dev">
          Developed & Designed with 💛 by{" "}
          <a
            href="https://meghportfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Megh Patel
          </a>
        </p>
      </div>
    </footer>
  );
}

export default PublicFooter;