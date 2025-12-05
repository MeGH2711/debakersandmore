import React, { useState } from "react";
import "./ContactUs.css";
import PublicFooter from "../components/PublicFooter";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// Added FaGoogle and FaStar to imports
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaClock, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGoogle, FaStar } from "react-icons/fa";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
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
      setStatus("Thank you! Your message has been submitted successfully.");
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
      <div className="contact-page">
        {/* 1. Hero Section */}
        <section className="contact-hero text-center">
          <h1 className="contact-heading">Bake Your Connection</h1>
          <p className="contact-subtext">
            For custom orders, collaborations, or a simple hello, we’re ready to connect. Use the form or find our details below.
          </p>
        </section>

        {/* 2. Main Content Grid */}
        <div className="contact-main-grid">

          {/* A. LEFT COLUMN WRAPPER (Form + Review Card) */}
          <div className="contact-left-column">

            {/* Contact Form Section */}
            <section className="contact-form-section">
              <h2 className="section-title-new">Send Us a Message</h2>
              <form className="contact-form-new" onSubmit={handleSubmit}>
                <div className="form-group-new">
                  <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group-new">
                  <input type="tel" name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-group-new">
                  <input type="email" name="email" placeholder="Email ID (Optional)" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group-new">
                  <textarea name="message" placeholder="Your Sweet Message *" rows="5" value={formData.message} onChange={handleChange} required></textarea>
                </div>

                <button type="submit" className="submit-btn-new">
                  Send Message
                </button>

                {status && (
                  <p className={`form-status ${fadeOut ? "fade-out" : ""}`}>
                    {status}
                  </p>
                )}
              </form>
            </section>

            {/* NEW: Google Review Card */}
            <section className="google-review-card">
              <div className="review-content">
                <div className="review-text">
                  <h3>Loved our Bakes?</h3>
                  <div className="stars">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <p>Rate us on Google and help others find us!</p>
                </div>
                <a
                  href="https://g.page/r/CYngCkd3rft1EBM/review"
                  target="_blank"
                  rel="noreferrer"
                  className="google-btn"
                >
                  <FaGoogle className="btn-icon" /> Write a Review
                </a>
              </div>
            </section>

          </div>

          {/* B. Details and Location (Right/Bottom) */}
          <div className="contact-details-location-group">

            {/* Contact Details Cards */}
            <section className="contact-details-compact">
              <h3 className="section-title-small">Our Details</h3>

              <div className="contact-card-compact">
                <FaMapMarkerAlt className="card-icon" />
                <div className="card-content">
                  <h4>Address</h4>
                  <a href="https://maps.app.goo.gl/XZTJqPGctiB9j5C88" target="_blank" rel="noreferrer">
                    De Baker’s & More, Ahmedabad, Gujarat, India
                  </a>
                </div>
              </div>

              <div className="contact-card-compact">
                <FaPhoneAlt className="card-icon" />
                <div className="card-content">
                  <h4>Call</h4>
                  <a href="tel:+919879718228">+91 98797 18228</a>
                </div>
              </div>

              <div className="contact-card-compact">
                <FaEnvelope className="card-icon" />
                <div className="card-content">
                  <h4>Email</h4>
                  <a href="mailto:debakersandmore@gmail.com">debakersandmore@gmail.com</a>
                </div>
              </div>

              <div className="contact-card-compact timing-card">
                <FaClock className="card-icon" />
                <div className="card-content">
                  <h4>Hours</h4>
                  <span>Mon – Sun: 9:00 AM – 11:00 PM</span>
                </div>
              </div>
            </section>

            {/* Map Section */}
            <section className="map-section-new">
              <h3 className="section-title-small">Find Us</h3>
              <div className="map-container-new">
                <iframe
                  title="De Baker’s & More Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.8748128583193!2d72.53305487477262!3d23.10167811337247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e832d7734dec1%3A0x75fbad77470ae089!2sDe%20Baker's%20%26%20more!5e0!3m2!1sen!2sin!4v1761582919686!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </section>

          </div>
        </div>

        {/* 3. Social Media Section */}
        <section className="social-section-new text-center">
          <h2 className="customSectionHeading">Connect with Sweetness</h2>
          <p className="social-subtext">Stay updated with our newest creations and special offers!</p>
          <div className="social-icons-new">
            <a href="https://www.youtube.com/@VimalDeBakers" target="_blank" rel="noreferrer" className="social-icon youtube"><FaYoutube /></a>
            <a href="https://www.facebook.com/debakersandmore" target="_blank" rel="noreferrer" className="social-icon facebook"><FaFacebookF /></a>
            <a href="https://www.instagram.com/de.bakers.and.more" target="_blank" rel="noreferrer" className="social-icon instagram"><FaInstagram /></a>
            <a href="https://wa.me/919879718228" target="_blank" rel="noreferrer" className="social-icon whatsapp"><FaWhatsapp /></a>
          </div>
        </section>

        {/* 4. Footer Message */}
        <section className="message-section-new text-center">
          <h2 className="customSectionHeading">Got a Custom Cake Idea?</h2>
          <p>
            Every great celebration deserves a perfect cake. Tell us your vision—we’d be delighted to bake something unique just for you!
          </p>
        </section>
      </div>

      <PublicFooter />
    </>
  );
}

export default ContactUs;