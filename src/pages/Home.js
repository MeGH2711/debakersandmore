import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import PublicFooter from "../components/PublicFooter";

import AnarkaliBiscuit from "../assets/images/productimages/anarkalibiscuit.png";
import BarleyBiscuit from "../assets/images/productimages/barleybiscuit.png";
import ChocolateChipBiscuit from "../assets/images/productimages/chocolatechipbiscuit.png";
import CoconutBadaamBiscuit from "../assets/images/productimages/coconutbadaambiscuit.png";
import RajwadiBiscuit from "../assets/images/productimages/rajwadibiscuit.png";
import MixFruitBiscuit from "../assets/images/productimages/mixfruitbiscuit.png";
import CoconutBesanBiscuit from "../assets/images/productimages/coconutbesanbiscuit.png";
import NaankhataiSuji from "../assets/images/productimages/naankhataisuji.png";
import OpeningImage from "../assets/images/landingpageimage.jpeg";
import GoogleReviewsLogo from "../assets/images/googleReveiwLogo.png";

/* ── Arrow icon ── */
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Star icon ── */
const StarFilled = () => <span>★</span>;

const testimonials = [
  { name: "Megh", review: "Amazing Experience, Especially the Puff, Cream Rolls & Biscuits taste awesome😋✨" },
  { name: "Akshay Ramani", review: "I regularly purchase bakery items from here, and I'm always impressed with the quality. The products are consistently fresh and delicious. Highly recommended!" },
  { name: "Pravesh Shah", review: "Newly launched bakery shop in Gota. Puff quality was outstanding. Good quality with reasonable prices only at De Baker's & More." },
  { name: "Devang Vora", review: "Here puff is awesome. Rajwadi and healthy cookies are unbeatable. Nice bakery place in Ahmedabad." },
  { name: "Sanjay Ramani", review: "Good Quality Bakery items, Must go for Fresh and Healthy items. 👌" },
  { name: "Vaidehi Patel", review: "Me and my friends bought a puff and the puff was very fresh and the taste was amazing ❤️" },
  { name: "M Patel", review: "Amazing bakery!! The biscuits and puffs were fresh and delicious. Would definitely come back again." },
  { name: "Dharmdeep Chouhan", review: "Excellent place and healthy products, and the owner is very nice." },
  { name: "Vijyaben Bhakhriwala", review: "De Baker's bakery items? What to say?..ahh!! just amazing! 😍 The biscuits of all flavours are super tasty and fresh. Once you try them, you'll definitely want more! Loved every bite." },
  { name: "Kundan Patel", review: "Perfect crust, soft and fluffy texture🍔 Freshly baked smell and delicious, simple flavor🍞 Really satisfied with friendly staff & fast service😊" },
  { name: "Komal Patel", review: "Best bakery. I am very happy with their service and the taste of every item is excellent." },
  { name: "Monalee Jainesh Shah", review: "De Baker's bakery items are very nice and biscuits of all flavours are amazing. I loved it." },
  { name: "Jimish Shah", review: "Good quality and fresh bakery products, taste is also good." },
  { name: "Jay Prajapati", review: "They have unique & healthy products which actually tastes good." },
  { name: "Heli Shah", review: "Great place! Products are excellent especially the puffs, definitely worth trying!" },
  { name: "Urmisha Patel", review: "Very tasty and fresh bakery products😋" },
  { name: "Bipin Dattani", review: "Very nice products. I bought 4 different varieties. Good taste and with low sugar." },
  { name: "Prisha Ajmera", review: "De Bakers is such a lovely place! The cookies are super tasty and freshly made. The atmosphere is cozy and welcoming. Definitely a must-visit spot for all dessert lovers! 🍪✨" },
];

const heroSlides = [
  { src: AnarkaliBiscuit, alt: "Anarkali Biscuit" },
  { src: CoconutBadaamBiscuit, alt: "Coconut Badaam Biscuit" },
  { src: ChocolateChipBiscuit, alt: "Chocolate Chip Biscuit" },
  { src: NaankhataiSuji, alt: "Naankhatai Suji" },
  { src: BarleyBiscuit, alt: "Barley Biscuit" },
];

const marqueeItems = [
  "Freshly Baked Daily",
  "Artisan Biscuits",
  "Premium Ingredients",
  "Handcrafted with Love",
  "Ahmedabad's Favourite",
  "Taste the Tradition",
  "Freshly Baked Daily",
  "Artisan Biscuits",
  "Premium Ingredients",
  "Handcrafted with Love",
  "Ahmedabad's Favourite",
  "Taste the Tradition",
];

const products = [
  {
    img: AnarkaliBiscuit,
    name: "Anarkali Biscuits",
    desc: "Delicate rose flavoured biscuits with a melt-in-the-mouth texture and subtle floral coconut flakes.",
    featured: false,
  },
  {
    img: CoconutBadaamBiscuit,
    name: "Coconut Badaam",
    desc: "Rich coconut meets toasted almonds in every golden crunch.",
  },
  {
    img: ChocolateChipBiscuit,
    name: "Chocolate Chip",
    desc: "Buttery biscuit studded with premium dark chocolate chips.",
  },
  {
    img: RajwadiBiscuit,
    name: "Rajwadi Biscuits",
    desc: "Royal heritage recipe with cardamom and saffron.",
  },
  {
    img: MixFruitBiscuit,
    name: "Mix Fruit",
    desc: "Colorful tutti-frutti biscuits bursting with joy.",
  },
  {
    img: CoconutBesanBiscuit,
    name: "Coconut Besan",
    desc: "Gram flour and coconut, a nostalgic, wholesome bite.",
  },
];

/* ── Scroll reveal hook ── */
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

/* ── Hero auto-slide hook ── */
function useHeroSlide(total, interval = 4500) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setActive((a) => (a + 1) % total), interval);
    return () => clearTimeout(id);
  }, [active, total, interval]);
  return active;
}

const Home = () => {
  useScrollReveal();
  const activeSlide = useHeroSlide(heroSlides.length);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="homePageHero">
        <div className="homePageHeroSlides">
          {heroSlides.map((slide, i) => (
            <div key={i} className={`homePageHeroSlide ${i === activeSlide ? "homePageActive" : ""}`}>
              <img src={slide.src} alt={slide.alt} />
            </div>
          ))}
        </div>
        <div className="homePageHeroVignette" />

        <div className="homePageHeroContent">
          <div className="homePageHeroGlassCard">
            <p className="homePageHeroEyebrow">De Bakers &amp; More</p>
            <h1 className="homePageHeroTitle">
              Baked with <em>Soul,</em>
              <br />Served with Love
            </h1>
            <p className="homePageHeroSubtitle">
              Artisan biscuits, breads, and pastries crafted fresh every morning
              in the heart of Ahmedabad.
            </p>
            <div className="homePageHeroCtaGroup">
              <Link to="/menu" className="homePageBtnPrimaryGold">
                <span>Explore Menu</span>
              </Link>
              <Link to="/contact" className="homePageBtnGhost">
                Visit Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="homePageMarqueeStrip">
        <div className="homePageMarqueeTrack">
          {marqueeItems.map((item, i) => (
            <span key={i} className="homePageMarqueeItem">
              {item}
              <span className="homePageMarqueeDot" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── BESTSELLERS ─── */}
      <section className="homePageBestsellersSection">
        <div className="homePageBestsellersHeader reveal">
          <p className="homePageSectionLabel">Our Premium Offerings</p>
          <h2 className="homePageSectionTitle">
            The <em>Beloved</em> Collection
          </h2>
          <p className="homePageSectionSubtitleMuted">
            Handcrafted with patience, baked to perfection. Discover our highly sought-after signature flavors.
          </p>
          <div className="homePageDividerLine" />
        </div>

        <div className="homePageProductsContainer">
          <div className="homePageProductsAsymmetricGrid">
            {products.map((p, i) => (
              <div
                key={i}
                className={`homePageProductPremiumCard ${p.featured ? "homePageCardFeatured" : ""} reveal`}
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div className="homePageProductImageWrapper">
                  {p.featured && <span className="homePageProductBadge">Signature</span>}
                  <img src={p.img} alt={p.name} loading="lazy" />
                  <div className="homePageProductScrimOverlay" />
                </div>

                <div className="homePageProductDetailsBox">
                  <div className="homePageProductMetaHeader">
                    <h3 className="homePageProductTitleText">{p.name}</h3>
                    <span className="homePageProductLineAccent" />
                  </div>
                  <p className="homePageProductDescriptionText">{p.desc}</p>
                  <Link to="/menu" className="homePageProductActionLink">
                    <span>Explore details</span>
                    <div className="homePageArrowCircle">
                      <ArrowRight />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section className="homePageAboutSection">
        <div className="homePageAboutGrid">
          <div className="homePageAboutVisual">
            <img src={OpeningImage} alt="De Bakers & More Bakery" />
            <div className="homePageAboutVisualOverlay" />
          </div>

          <div className="homePageAboutContent">
            <p className="homePageSectionLabel reveal">Our Story</p>
            <h2 className="homePageSectionTitle reveal reveal-delay-1">
              Where Every Bite <em>Tells a Story</em>
            </h2>
            <div className="homePageDividerLine reveal reveal-delay-2" />

            <p className="reveal reveal-delay-2">
              Welcome to <strong>De Bakers &amp; More</strong>, your neighborhood artisan bakery
              offering a delightful range of <strong>cakes, biscuits, breads, buns,</strong> and
              other mouthwatering treats. Each product is crafted with passion, premium ingredients,
              and a sprinkle of joy to ensure every bite feels special.
            </p>
            <p className="reveal reveal-delay-3">
              From freshly baked breads for your breakfast to indulgent cakes for celebrations, we bring
              the perfect blend of taste, texture, and tradition. Whether it's a{" "}
              <strong>birthday, anniversary, festive gathering,</strong> or just a sweet craving,
              we've got you covered.
            </p>

            <div className="homePageAboutStats reveal">
              <div>
                <div className="homePageAboutStatNum">20+</div>
                <div className="homePageAboutStatLabel">Varieties</div>
              </div>
              <div>
                <div className="homePageAboutStatNum">4.8★</div>
                <div className="homePageAboutStatLabel">Google Rating</div>
              </div>
              <div>
                <div className="homePageAboutStatNum">100%</div>
                <div className="homePageAboutStatLabel">Fresh Daily</div>
              </div>
            </div>

            <Link to="/menu" className="homePageBtnPrimaryGold reveal">
              <span>View Full Menu</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="homePageTestimonialsSection">
        <div className="homePageTestimonialsHeader reveal">
          <p className="homePageSectionLabel">Google Reviews</p>
          <h2 className="homePageSectionTitle">
            What Our <em>Guests</em> Say
          </h2>
          <div className="homePageDividerLine" />
        </div>

        <div className="homePageTestiTrackWrapper">
          <div className="homePageTestiTrack">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="homePageTestiCard">
                <div className="homePageTestiQuoteMark">"</div>
                <p className="homePageTestiText">{t.review}</p>
                <div className="homePageTestiStars">
                  {[...Array(5)].map((_, s) => <StarFilled key={s} />)}
                </div>
                <div className="homePageTestiName">{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="homePageGoogleReviewRow">
          <img src={GoogleReviewsLogo} alt="Google Reviews" />
          <p>
            Read more on{" "}
            <a
              href="https://www.google.com/search?sca_esv=f668a2dbcf0dcc29&sxsrf=AE3TifO2RXLiClyLj7yRT_lCm5T6nPW_fw:1761973891705&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-Ez-4Zf3hZHYVL0AvL4qRnu2Epwk7oYH8bxp0wDUx6ruutEzRsLdXWryFvcvckz7o1vKsheUd2ymL6BPY5G70TkebuUPxl8RWZ1sixntll9ZlvGPKSw%3D%3D&q=De+Baker%27s+%26+more+Reviews&sa=X&ved=2ahUKEwi1rqyfmNCQAxUfQ_EDHdkMHpEQ0bkNegQINRAD"
              target="_blank"
              rel="noreferrer"
            >
              Google
            </a>
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="homePageCtaSection">
        <div className="homePageCtaBgText">Baked</div>
        <div className="homePageCtaContent">
          <p className="homePageSectionLabel reveal">Come Visit Us</p>
          <h2 className="homePageCtaTitle reveal reveal-delay-1">
            Ready to <em>Taste</em><br />the Magic?
          </h2>
          <p className="homePageCtaSub reveal reveal-delay-2">
            Order online or visit us today to indulge in your freshly baked favorites.
            We bake every morning, so it's always at its best.
          </p>
          <div className="homePageHeroCtaGroup reveal reveal-delay-3">
            <Link to="/contact" className="homePageBtnPrimaryGold">
              <span>Contact Us</span>
            </Link>
            <Link to="/menu" className="homePageBtnGhost">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
};

export default Home;