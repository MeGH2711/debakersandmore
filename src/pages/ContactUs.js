import "./ContactUs.css";
import PublicFooter from "../components/PublicFooter";

function ContactUs() {
  return (
    <>
      <div className="contact-page">
        <section className="contact-hero text-center">
          <h1 className="contact-heading">Get in Touch</h1>
          <p className="contact-subtext">
            Whether you’re craving our cakes or have a custom order in mind — we’d love to hear from you!
          </p>
        </section>

        <section className="contact-details">
          <div className="contact-card">
            <h3>Visit Us</h3>
            <p>De Baker’s & More<br />Ahmedabad, Gujarat, India</p>
          </div>

          <div className="contact-card">
            <h3>Call Us</h3>
            <p>+91 98797 18228</p>
          </div>

          <div className="contact-card">
            <h3>Email Us</h3>
            <p>debakersandmore@gmail.com</p>
          </div>
        </section>

        <section className="timing-section text-center">
          <h2 className="customSectionHeading">Opening Hours</h2>
          <p>
            Monday – Sunday: <strong>9:00 AM – 11:00 PM</strong>
          </p>
        </section>

        <section className="map-section text-center">
          <h2 className="customSectionHeading">Find Us on Google Maps</h2>
          <div className="map-container">
            <iframe
              title="De Baker’s & More Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.8748128583193!2d72.53305487477262!3d23.10167811337247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e832d7734dec1%3A0x75fbad77470ae089!2sDe%20Baker&#39;s%20%26%20more!5e0!3m2!1sen!2sin!4v1761582919686!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        <section className="message-section text-center">
          <h2 className="customSectionHeading">Have a Special Request?</h2>
          <p>
            We’d be delighted to bake something just for you! Drop us a message or visit our store — every creation starts with a sweet conversation.
          </p>
        </section>

      </div>
      <PublicFooter />
    </>
  );
}

export default ContactUs;