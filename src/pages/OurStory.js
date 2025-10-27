import React, { useEffect, useState, useMemo } from "react";
import "./OurStory.css";
import PublicFooter from "../components/PublicFooter";

function OurStory() {
  const startDate = useMemo(() => new Date("2023-06-04T00:00:00"), []);
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now - startDate;

      // Calculate elapsed time
      const years = now.getFullYear() - startDate.getFullYear();
      const months =
        years * 12 +
        (now.getMonth() - startDate.getMonth() < 0
          ? 0
          : now.getMonth() - startDate.getMonth());
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diff / (1000 * 60));
      const totalSeconds = Math.floor(diff / 1000);

      const remainingDays = totalDays % 30;
      const remainingHours = totalHours % 24;
      const remainingMinutes = totalMinutes % 60;
      const remainingSeconds = totalSeconds % 60;

      setTimeElapsed({
        years,
        months: months % 12,
        days: remainingDays,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className="our-story-page">
      <section className="hero-section text-center">
        <div className="hero-content">
          <h1 className="hero-heading">Our Story</h1>
          <p className="hero-subtext">
            Every slice tells a story — baked with love, passion, and tradition.
          </p>

          <div className="since-counter">
            <h4 className="since-title">Serving Happiness Since</h4>
            <p className="since-date">June 4, 2023</p>
            <div className="counter-box">
              <span>{timeElapsed.years} <small>Years</small></span>
              <span>{timeElapsed.months} <small>Months</small></span>
              <span>{timeElapsed.days} <small>Days</small></span>
              <span>{timeElapsed.hours} <small>Hrs</small></span>
              <span>{timeElapsed.minutes} <small>Min</small></span>
              <span>{timeElapsed.seconds} <small>Sec</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="content-container">
          <h2 className="section-heading">Where It All Began</h2>
          <p>
            De Baker’s & More started as a small dream — a cozy corner filled with
            the aroma of freshly baked bread and the laughter of people who loved
            food. What began as a single oven and a passion for perfection soon
            turned into a journey of love, flavors, and endless creativity.
          </p>
        </div>
      </section>

      <section className="story-section alt">
        <div className="content-container">
          <h2 className="section-heading">Baked with Passion</h2>
          <p>
            Every recipe we create is a reflection of care and craftsmanship.
            From the gentle kneading of dough to the final golden crust, we pour
            our hearts into every bake. Our goal is simple — to make every bite
            feel like home.
          </p>
        </div>
      </section>

      <section className="story-section">
        <div className="content-container text-center">
          <h2 className="customSectionHeading">A Taste of Happiness</h2>
          <p>
            For us, baking is not just about bread and cakes — it’s about creating
            moments that connect people. Each creation from our oven carries a bit
            of joy, a pinch of nostalgia, and a whole lot of love.
          </p>
          <p className="signature">– Vimal Patel (Owner)</p>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

export default OurStory;