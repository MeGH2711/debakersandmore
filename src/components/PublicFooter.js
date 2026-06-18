import React from "react";
import { Link } from "react-router-dom";
import "./PublicFooter.css";

/* ── Icon helpers (inline SVG — no external dep) ── */
const IconLocation = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconPhone = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const IconGoogle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--amber,#C8861A)" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--amber-light,#E8A832)" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(200,134,26,0.6)" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(245,237,216,0.5)" />
  </svg>
);

const marqueeItems = [
  "Freshly Baked Daily", "Artisan Biscuits", "Premium Ingredients",
  "Handcrafted with Love", "Ahmedabad's Favourite", "Taste the Tradition",
  "Freshly Baked Daily", "Artisan Biscuits", "Premium Ingredients",
  "Handcrafted with Love", "Ahmedabad's Favourite", "Taste the Tradition",
];

function PublicFooter() {
  const currentYear = new Date().getFullYear();

  // Helper function to handle the scroll
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "instant" // or "smooth" if you want an animated scroll effect
    });
  };

  return (
    <footer className="public-footer">
      {/* ─── Marquee strip ─── */}
      <div className="footer-marquee-strip">
        <div className="footer-marquee-track">
          {marqueeItems.map((item, i) => (
            <span key={i} className="footer-marquee-item">
              {item}
              <span className="footer-marquee-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── Decorative background word ─── */}
      <div className="footer-bg-word" aria-hidden="true">De Bakers</div>

      {/* ─── Main content ─── */}
      <div className="footer-main">

        {/* ── TOP ROW ── */}
        <div className="footer-top">

          {/* Brand column */}
          <div className="footer-brand-col">
            <p className="footer-brand-eyebrow">Est. 2023</p>
            <h2 className="footer-brand-name">
              De Bakers<br /><em>&amp; More</em>
            </h2>
            <p className="footer-tagline">
              Baked with love, served with happiness — artisan biscuits,
              breads, and pastries crafted fresh every morning in the heart
              of Ahmedabad.
            </p>
            <div className="footer-social-row">
              <span className="footer-social-label">Follow</span>
              <a
                href="https://www.instagram.com/de.bakers.and.more/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.google.com/search?q=De+Baker%27s+%26+more"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Google"
              >
                <IconGoogle />
              </a>
            </div>
          </div>

          {/* Quick links column */}
          <div className="footer-nav-col">
            <h3 className="footer-col-heading">Explore</h3>
            <ul className="footer-nav-list">
              <li><Link to="/" onClick={handleScrollToTop}>Home</Link></li>
              <li><Link to="/ourstory" onClick={handleScrollToTop}>Our Story</Link></li>
              <li><Link to="/offers" onClick={handleScrollToTop}>Offers</Link></li>
              <li><Link to="/menu" onClick={handleScrollToTop}>Menu</Link></li>
              <li><Link to="/contact" onClick={handleScrollToTop}>Contact</Link></li>
              <li>
                <a
                  href="https://www.google.com/search?q=De+Baker%27s+%26+more+Reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div className="footer-contact-col">
            <h3 className="footer-col-heading">Find Us</h3>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <span className="footer-contact-icon"><IconLocation /></span>
                <span className="footer-contact-text">
                  <strong>Address</strong>
                  <a
                    href="https://maps.app.goo.gl/XZTJqPGctiB9j5C88"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    GF-30, Shaligram Square, <br />
                    Gota, Ahmedabad<br />
                    Gujarat, India
                  </a>
                </span>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon"><IconClock /></span>
                <span className="footer-contact-text">
                  <strong>Hours</strong>
                  Mon – Sat: 10 AM – 10 PM<br />Sunday: 10 AM – 10 PM
                </span>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon"><IconPhone /></span>
                <span className="footer-contact-text">
                  <strong>Order &amp; Inquiries</strong>
                  <a
                    href="tel:+919879718228"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    +91 98797 18228
                  </a>
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="footer-bottom">

          <p className="footer-copy">
            © {currentYear} De Baker's &amp; More<span> · </span>All Rights Reserved
          </p>

          <p className="footer-dev">
            Crafted with 💛 by{" "}
            <a
              href="https://meghportfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Megh Patel
            </a>
          </p>

        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;