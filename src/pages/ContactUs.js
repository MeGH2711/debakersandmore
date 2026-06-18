import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ContactUs.css";
import PublicFooter from "../components/PublicFooter";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaGoogle,
  FaStar,
} from "react-icons/fa";

/* ── Scroll reveal hook (same as Home) ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".contactUsPage-reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("contactUsPage-visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function ContactUs() {
  useScrollReveal();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting…");
    setFadeOut(false);

    if (!formData.name || !formData.phone || !formData.message) {
      setStatus("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "feedback"), {
        ...formData,
        reviewed: false,
        timestamp: serverTimestamp(),
      });
      setStatus("Thank you — your message has been received.");
      setFormData({ name: "", phone: "", email: "", message: "" });
      setTimeout(() => setFadeOut(true), 4500);
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="contactUsPage-contact-page">

        {/* ─── HERO ─── */}
        <section className="contactUsPage-contact-hero">
          <div className="contactUsPage-contact-hero-bg-text" aria-hidden="true">Connect</div>
          <div className="contactUsPage-contact-hero-inner">
            <p className="contactUsPage-contact-eyebrow">De Bakers & More</p>
            <h1 className="contactUsPage-contact-heading">
              Bake Your <em>Connection</em>
            </h1>
            <p className="contactUsPage-contact-subtext">
              For custom orders, collaborations, or a simple hello — we're ready
              to connect. Use the form or find our details below.
            </p>
          </div>
        </section>

        <div className="contactUsPage-contact-divider" />

        {/* ─── MAIN BODY GRID ─── */}
        <div className="contactUsPage-contact-body">

          {/* LEFT — Form + Review Strip */}
          <div className="contactUsPage-contact-left">

            {/* Section label */}
            <div className="contactUsPage-reveal">
              <p className="contactUsPage-c-label">Get In Touch</p>
              <h2 className="contactUsPage-c-title">Send Us a <em>Message</em></h2>
            </div>

            {/* Glass Form Panel */}
            <div className="contactUsPage-contact-form-panel contactUsPage-reveal contactUsPage-reveal-delay-1">
              <form className="contactUsPage-contact-form" onSubmit={handleSubmit} noValidate>

                <div className="contactUsPage-form-row">
                  <div className="contactUsPage-form-field">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contactUsPage-form-field">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contactUsPage-form-field">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address (optional)"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="contactUsPage-form-field">
                  <textarea
                    name="message"
                    placeholder="Your message, custom order idea, or enquiry *"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="contactUsPage-contact-submit">
                  <span>Send Message</span>
                </button>

                {status && (
                  <p className={`contactUsPage-form-status ${fadeOut ? "contactUsPage-fade-out" : ""}`}>
                    {status}
                  </p>
                )}
              </form>
            </div>

            {/* Google Review Strip */}
            <div className="contactUsPage-google-review-strip contactUsPage-reveal contactUsPage-reveal-delay-2">
              <div className="contactUsPage-google-review-left">
                <h4>Loved our Bakes?</h4>
                <div className="contactUsPage-google-review-stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <p>Share your experience and help others find us.</p>
              </div>
              <a
                href="https://g.page/r/CYngCkd3rft1EBM/review"
                target="_blank"
                rel="noreferrer"
                className="contactUsPage-google-btn-outline"
              >
                <FaGoogle /> Write a Review
              </a>
            </div>

          </div>

          {/* RIGHT — Details + Map */}
          <div className="contactUsPage-contact-right">

            <div className="contactUsPage-reveal">
              <p className="contactUsPage-c-label">Our Details</p>
              <h2 className="contactUsPage-c-title">Find & <em>Reach Us</em></h2>
            </div>

            {/* Detail Cards */}
            <div className="contactUsPage-contact-details-panel contactUsPage-reveal contactUsPage-reveal-delay-1">

              <div className="contactUsPage-contact-detail-item">
                <div className="contactUsPage-detail-icon-wrap">
                  <FaMapMarkerAlt />
                </div>
                <div className="contactUsPage-detail-body">
                  <h5>Address</h5>
                  <a
                    href="https://maps.app.goo.gl/XZTJqPGctiB9j5C88"
                    target="_blank"
                    rel="noreferrer"
                  >
                    De Baker's & More, Ahmedabad, Gujarat, India
                  </a>
                </div>
              </div>

              <div className="contactUsPage-contact-detail-item">
                <div className="contactUsPage-detail-icon-wrap">
                  <FaPhoneAlt />
                </div>
                <div className="contactUsPage-detail-body">
                  <h5>Call Us</h5>
                  <a href="tel:+919879718228">+91 98797 18228</a>
                </div>
              </div>

              <div className="contactUsPage-contact-detail-item">
                <div className="contactUsPage-detail-icon-wrap">
                  <FaEnvelope />
                </div>
                <div className="contactUsPage-detail-body">
                  <h5>Email</h5>
                  <a href="mailto:debakersandmore@gmail.com">
                    debakersandmore@gmail.com
                  </a>
                </div>
              </div>

              <div className="contactUsPage-contact-detail-item">
                <div className="contactUsPage-detail-icon-wrap">
                  <FaClock />
                </div>
                <div className="contactUsPage-detail-body">
                  <h5>Hours</h5>
                  <span>Mon – Sun  ·  9:00 AM – 11:00 PM</span>
                </div>
              </div>

            </div>

            {/* Map */}
            <div className="contactUsPage-contact-map-panel contactUsPage-reveal contactUsPage-reveal-delay-2">
              <div className="contactUsPage-contact-map-label">
                <span>Find Us</span>
                <a
                  href="https://maps.app.goo.gl/XZTJqPGctiB9j5C88"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps ↗
                </a>
              </div>
              <iframe
                title="De Baker's & More Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.8748128583193!2d72.53305487477262!3d23.10167811337247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e832d7734dec1%3A0x75fbad77470ae089!2sDe%20Baker's%20%26%20more!5e0!3m2!1sen!2sin!4v1761582919686!5m2!1sen!2sin"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>

        {/* ─── SOCIAL SECTION ─── */}
        <section className="contactUsPage-contact-social-section">
          <p className="contactUsPage-c-label contactUsPage-reveal">Stay Connected</p>
          <h2 className="contactUsPage-social-heading contactUsPage-reveal contactUsPage-reveal-delay-1">
            Connect with <em>Sweetness</em>
          </h2>
          <div className="contactUsPage-divider-line" />
          <p className="contactUsPage-social-sub contactUsPage-reveal contactUsPage-reveal-delay-2">
            Stay updated with our newest creations and special offers.
          </p>

          <div className="contactUsPage-social-icons-row contactUsPage-reveal contactUsPage-reveal-delay-3">
            <a
              href="https://www.youtube.com/@VimalDeBakers"
              target="_blank"
              rel="noreferrer"
              className="contactUsPage-social-icon-link contactUsPage-youtube"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="https://www.facebook.com/debakersandmore"
              target="_blank"
              rel="noreferrer"
              className="contactUsPage-social-icon-link contactUsPage-facebook"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/de.bakers.and.more"
              target="_blank"
              rel="noreferrer"
              className="contactUsPage-social-icon-link contactUsPage-instagram"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/919879718228"
              target="_blank"
              rel="noreferrer"
              className="contactUsPage-social-icon-link contactUsPage-whatsapp"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </section>

        {/* ─── CLOSING CTA ─── */}
        <section className="contactUsPage-contact-cta-strip">
          <div className="contactUsPage-contact-cta-bg-text" aria-hidden="true">Custom</div>
          <div className="contactUsPage-contact-cta-inner">
            <p className="contactUsPage-c-label contactUsPage-reveal">Celebrate in Style</p>
            <h2 className="contactUsPage-contact-cta-title contactUsPage-reveal contactUsPage-reveal-delay-1">
              Got a Custom <em>Cake Idea?</em>
            </h2>
            <p className="contactUsPage-contact-cta-sub contactUsPage-reveal contactUsPage-reveal-delay-2">
              Every great celebration deserves a perfect cake. Tell us your
              vision — we'd be delighted to bake something unique just for you.
            </p>
            <div className="contactUsPage-cta-btn-row contactUsPage-reveal contactUsPage-reveal-delay-3">
              <a href="tel:+919879718228" className="contactUsPage-BtnPrimaryGold">
                <span>Call Us Now</span>
              </a>
              <Link to="/menu" className="contactUsPage-BtnGhost">
                Browse Menu
              </Link>
            </div>
          </div>
        </section>

      </div>

      <PublicFooter />
    </>
  );
}

export default ContactUs;