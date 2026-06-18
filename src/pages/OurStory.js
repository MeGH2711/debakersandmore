import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./OurStory.css";
import PublicFooter from "../components/PublicFooter";
import OpeningImage from "../assets/images/landingpageimage.jpeg";

/* ─── Scroll reveal hook (mirrors Home.js) ─── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function OurStory() {
  useScrollReveal();

  const startDate = useMemo(() => new Date("2023-06-04T00:00:00"), []);
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();

      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();

      if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) { years -= 1; months += 12; }

      const diff = now - startDate;
      setTimeElapsed({
        years,
        months,
        days,
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate]);

  const counterItems = [
    { num: timeElapsed.years, lbl: "Years" },
    { num: timeElapsed.months, lbl: "Months" },
    { num: timeElapsed.days, lbl: "Days" },
    { num: timeElapsed.hours, lbl: "Hours" },
    { num: timeElapsed.minutes, lbl: "Minutes" },
    { num: timeElapsed.seconds, lbl: "Seconds" },
  ];

  return (
    <div className="ourStoryPage">

      {/* ─── HERO ─── */}
      <section className="ourStoryHero">
        <div className="ourStoryHeroBgText" aria-hidden="true">Story</div>

        <div className="ourStoryHeroContent">
          <div className="ourStoryHeroLayout">

            {/* LEFT CONTENT */}
            <div className="ourStoryHeroCopy">
              <p className="ourStoryHeroEyebrow">De Bakers &amp; More</p>

              <h1 className="ourStoryHeroTitle">
                Our <em>Story</em>
              </h1>

              <p className="ourStoryHeroSub">
                Every slice tells a story, baked with love, passion, and
                tradition in the heart of Ahmedabad.
              </p>
            </div>

            {/* RIGHT COUNTER */}
            <div className="ourStoryHeroCounterPanel">

              <div className="ourStoryHeroCounterHeading">
                <span className="ourStoryHeroCounterMini">Since</span>
                <h3>June 4, 2023</h3>
              </div>

              <div className="ourStoryHeroCounterGrid">
                {counterItems.map(({ num, lbl }) => (
                  <div key={lbl} className="ourStoryHeroCounterCard">
                    <span className="ourStoryHeroCounterNum">
                      {String(num).padStart(2, "0")}
                    </span>
                    <span className="ourStoryHeroCounterLbl">{lbl}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── WHERE IT BEGAN, VISUAL SPLIT ─── */}
      <section className="ourStoryOriginSection">
        <div className="ourStoryOriginGrid">
          <div className="ourStoryOriginVisual">
            <img src={OpeningImage} alt="De Baker's & More, Grand Opening" loading="lazy" />
            <div className="ourStoryOriginOverlay" />
          </div>

          <div className="ourStoryOriginContent">
            <span className="ourStoryCaption reveal">Where It All Began</span>
            <p className="ourStorySectionLabel reveal" style={{ letterSpacing: "0" }}>
              {/* spacer, kept in document flow intentionally empty */}
            </p>
            <h2 className="ourStorySectionTitle reveal reveal-delay-1">
              A Small Dream, <em>A Big Heart</em>
            </h2>
            <div className="ourStoryDividerLine reveal reveal-delay-2" />

            <p className="ourStoryBodyText reveal reveal-delay-2">
              <strong>De Baker's &amp; More</strong> started as a small dream, a cozy corner
              filled with the aroma of freshly baked bread and the laughter of people who loved
              food. What began as a single oven and a passion for perfection soon turned into
              a journey of love, flavors, and endless creativity.
            </p>
            <p className="ourStoryBodyText reveal reveal-delay-3">
              Nestled in the heart of <strong>Gota, Ahmedabad</strong>, we have grown from a
              neighborhood favourite into a beloved destination for those who seek freshness,
              quality, and the unmistakable warmth that only a genuine artisan bakery can offer.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER QUOTE ─── */}
      <section className="ourStoryFounderSection">
        <div className="ourStoryFounderInner">
          <blockquote className="ourStoryFounderQuoteText reveal">
            For us, baking is not just about bread and cakes, it's about creating
            moments that <em>connect people.</em> Each creation from our oven carries
            a bit of joy, a pinch of nostalgia, and a whole lot of love.
          </blockquote>

          <div className="ourStoryFounderDivider reveal reveal-delay-1">
            <span className="ourStoryFounderDividerLine" />
            <span className="ourStoryFounderDividerDiamond" />
            <span className="ourStoryFounderDividerLine" />
          </div>

          <span className="ourStoryFounderName reveal reveal-delay-2">Vimal Patel</span>
          <span className="ourStoryFounderRole reveal reveal-delay-3">Founder, De Bakers &amp; More</span>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="ourStoryCtaSection">
        <div className="ourStoryCtaBgText" aria-hidden="true">Baked</div>
        <div className="ourStoryCtaContent">
          <p className="ourStorySectionLabel reveal">Come Visit Us</p>
          <h2 className="ourStoryCtaTitle reveal reveal-delay-1">
            Taste the <em>Story</em><br />Yourself
          </h2>
          <p className="ourStoryCtaSub reveal reveal-delay-2">
            Visit us in Gota, Ahmedabad, or explore our full range of handcrafted
            biscuits, breads, and pastries. Baked fresh every morning, just for you.
          </p>
          <div className="ourStoryHeroCtaGroup reveal reveal-delay-3">
            <Link to="/menu" className="btn-primary-gold ourStoryBtnPrimaryGold">
              <span>Explore Menu</span>
            </Link>
            <Link to="/contact" className="ourStoryBtnGhost">
              Visit Us
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default OurStory;