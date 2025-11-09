import React from "react";
import { useEffect } from "react";
import { Button, Container, Row, Col, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
// import { useEffect } from "react";
import "./Home.css";
import PublicFooter from "../components/PublicFooter";

import AnarkaliBiscuit from "../assets/images/productimages/anarkalibiscuit.png";
import BarleyBiscuit from "../assets/images/productimages/barleybiscuit.png";
import ChocolateChipBiscuit from "../assets/images/productimages/chocolatechipbiscuit.png";
import CoconutBadaamBiscuit from "../assets/images/productimages/coconutbadaambiscuit.png";
import RajwadiBiscuit from "../assets/images/productimages/rajwadibiscuit.png";
import JeeraBiscuit from "../assets/images/productimages/jeerabiscuit.png";
import MixFruitBiscuit from "../assets/images/productimages/mixfruitbiscuit.png";
import CoconutBesanBiscuit from "../assets/images/productimages/coconutbesanbiscuit.png";
import NaankhataiSuji from "../assets/images/productimages/naankhataisuji.png";
import OpeningImage from "../assets/images/landingpageimage.jpeg";
import GoogleReviewsLogo from "../assets/images/googleReveiwLogo.png";

const Home = () => {

    const testimonials = [
        {
            name: "Megh",
            review:
                "Amazing Experience, Especially the Puff, Cream Rolls & Biscuits taste awesome😋✨",
        },
        {
            name: "Akshay Ramani",
            review:
                "I regularly purchase bakery items from here, and I'm always impressed with the quality. The products are consistently fresh and delicious. Highly recommended!",
        },
        {
            name: "Pravesh Shah",
            review:
                "Newly launched bakery shop in Gota. Puff quality was outstanding. Good quality with reasonable prices only at De Baker's & More.",
        },
        {
            name: "Devang Vora",
            review:
                "Here puff is awesome. Rajwadi and healthy cookies are unbeatable. Nice bakery place in Ahmedabad.",
        },
        {
            name: "Sanjay Ramani",
            review:
                "Good Quality Bakery items, Must go for Fresh and Healthy items. 👌",
        },
        {
            name: "Vaidehi Patel",
            review:
                "Me and my friends bought a puff and the puff was very fresh and the taste was amazing ❤️",
        },
        {
            name: "M Patel",
            review:
                "Amazing bakery!! The biscuits and puffs were fresh and delicious. Would definitely come back again.",
        },
        {
            name: "Dharmdeep Chouhan",
            review:
                "Excellent place and healthy products, and the owner is very nice.",
        },
    ];

    // Split testimonials into groups of 3 per slide (for large screens)
    const groupedTestimonials = [];
    for (let i = 0; i < testimonials.length; i += 3) {
        groupedTestimonials.push(testimonials.slice(i, i + 3));
    }

    useEffect(() => {
        const cards = document.querySelectorAll(".testimonial-card");
        let maxHeight = 0;
        cards.forEach(card => {
            const h = card.offsetHeight;
            if (h > maxHeight) maxHeight = h;
        });
        cards.forEach(card => (card.style.height = `${maxHeight}px`));
    }, []);

    return (
        <>
            {/* --- Landing Section with Carousel --- */}
            <section className="landing-section position-relative text-center text-light">
                <Carousel fade interval={4000} controls={false} indicators={false}>
                    <Carousel.Item>
                        <img src={AnarkaliBiscuit} className="d-block w-100 landing-img" alt="Anarkali Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={BarleyBiscuit} className="d-block w-100 landing-img" alt="Barley Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={ChocolateChipBiscuit} className="d-block w-100 landing-img" alt="Chocolate Chip Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={CoconutBadaamBiscuit} className="d-block w-100 landing-img" alt="Coconut Badaam Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={NaankhataiSuji} className="d-block w-100 landing-img" alt="Naankhatai" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={RajwadiBiscuit} className="d-block w-100 landing-img" alt="Rajwadi Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={JeeraBiscuit} className="d-block w-100 landing-img" alt="Jeera Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={MixFruitBiscuit} className="d-block w-100 landing-img" alt="Mix Fruit Biscuit" />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={CoconutBesanBiscuit} className="d-block w-100 landing-img" alt="Coconut Besan Biscuit" />
                    </Carousel.Item>
                </Carousel>

                {/* Overlay and Text */}
                <div className="carousel-overlay"></div>
                <div className="landing-content">
                    <h1 className="display-4 fw-bold">De Bakers & More</h1>
                    <p className="lead mt-3">Freshly baked happiness — biscuits, cakes, and more made with love</p>
                    <Link to="/menu">
                        <Button variant="warning" className="fw-semibold mt-3 px-4 py-2">Explore Menu</Button>
                    </Link>
                </div>
            </section>

            {/* --- Featured Products --- */}
            <section className="bestsellers-alt py-5">
                <Container fluid className="px-0">
                    <h2 className="text-center text-warning fw-bold mb-5 landingSectionHeading">Our Bestsellers</h2>

                    <div className="bestseller-alt-grid">
                        {/* Row 1 */}
                        <div className="bestseller-box image-box">
                            <img src={AnarkaliBiscuit} alt="Anarkali Biscuits" />
                        </div>
                        <div className="bestseller-box text-box">
                            <h3>Anarkali Biscuits</h3>
                            <p>
                                Sweet, buttery shortbread rolled in vibrant, pink-tinged jam and shredded coconut for a delightful, textured bite.
                            </p>
                            <Link to="/menu" variant="light" className="btn explore-btn">Explore Now</Link>
                        </div>

                        <div className="bestseller-box image-box">
                            <img src={RajwadiBiscuit} alt="Rajwadi Biscuits" />
                        </div>
                        <div className="bestseller-box text-box">
                            <h3>Rajwadi Biscuits</h3>
                            <p>
                                A royal, melt-in-your-mouth biscuit, generously studded with almonds and pistachios for a truly majestic tea-time treat.
                            </p>
                            <Link to="/menu" variant="light" className="btn explore-btn">Explore Now</Link>
                        </div>

                        {/* Row 2 */}
                        <div className="bestseller-box text-box">
                            <h3>Barley Biscuits</h3>
                            <p>
                                Wholesome and fiber-rich, these nutty barley biscuits are a guilt-free, crunchy, and satisfying treat topped with a healthy mix of sliced almonds and pistachios.
                            </p>
                            <Link to="/menu" variant="light" className="btn explore-btn">Explore Now</Link>
                        </div>
                        <div className="bestseller-box image-box">
                            <img src={BarleyBiscuit} alt="Barley Biscuits" />
                        </div>

                        <div className="bestseller-box text-box">
                            <h3>Mix-Fruit Biscuits</h3>
                            <p>
                                Buttery, crunchy shortbread biscuits bursting with colorful tutti frutti and chopped nuts for a classic, joyful tea-time treat.
                            </p>
                            <Link to="/menu" variant="light" className="btn explore-btn">Explore Now</Link>
                        </div>
                        <div className="bestseller-box image-box">
                            <img src={MixFruitBiscuit} alt="Mix-Fruit Biscuits" />
                        </div>
                    </div>
                </Container>
            </section>

            {/* --- About Section --- */}
            <section className="about-section py-5 text-light">
                <Container>
                    <Row className="align-items-center flex-column-reverse flex-md-row text-center text-md-start">
                        <Col md={6} className="mt-4 mt-md-0">
                            <h2 className="text-warning fw-bold mb-3">About Us</h2>
                            <p className="text-justify text-md-start">
                                Welcome to <strong>De Bakers & More</strong> — your neighborhood bakery
                                offering a delightful range of <strong>cakes, biscuits, breads, buns,</strong>
                                and other mouthwatering treats. Each product is crafted with passion,
                                premium ingredients, and a sprinkle of joy to ensure every bite feels special.
                            </p>
                            <p className="mb-4 text-justify text-md-start">
                                From freshly baked breads for your breakfast to indulgent cakes for celebrations,
                                we bring the perfect blend of taste, texture, and tradition. Whether it’s a
                                <strong> birthday, anniversary, festive gathering,</strong> or just a sweet craving —
                                we’ve got you covered!
                            </p>
                            <Link to="/menu">
                                <Button variant="outline-warning" className="fw-semibold px-4 py-2">
                                    View Full Menu
                                </Button>
                            </Link>
                        </Col>

                        <Col md={6} className="d-flex justify-content-center">
                            <img
                                src={OpeningImage}
                                alt="Bakery"
                                className="about-img img-fluid rounded-4 shadow"
                            />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- Testimonials --- */}
            <section className="testimonials-section py-5">
                <Container fluid>
                    <h2 className="text-center text-warning fw-bold mb-5 landingSectionHeading">
                        What Our Customers Say
                    </h2>

                    <Carousel
                        indicators={false}
                        interval={4000}
                        pause="hover"
                        controls={true}
                        fade={false}
                    >
                        {window.innerWidth <= 576
                            ? testimonials.map((t, i) => (
                                <Carousel.Item key={i}>
                                    <div className="d-flex justify-content-center py-5">
                                        <div
                                            className="testimonial-card text-light text-center p-4"
                                            style={{
                                                width: "90%",
                                                backgroundColor: "#222",
                                                borderRadius: "12px",
                                                minHeight: "220px",
                                            }}
                                        >
                                            <p className="fst-italic mb-3">“{t.review}”</p>
                                            <h6 className="text-warning mb-0">{t.name}</h6>
                                        </div>
                                    </div>
                                </Carousel.Item>
                            ))
                            : groupedTestimonials.map((group, index) => (
                                <Carousel.Item key={index}>
                                    <div className="d-flex justify-content-center flex-wrap gap-4 py-5">
                                        {group.map((t, i) => (
                                            <div
                                                key={i}
                                                className="testimonial-card text-light text-center p-4"
                                                style={{
                                                    width: "300px",
                                                    backgroundColor: "#222",
                                                    borderRadius: "12px",
                                                    minHeight: "220px",
                                                }}
                                            >
                                                <p className="fst-italic mb-3">“{t.review}”</p>
                                                <h6 className="text-warning mb-0">{t.name}</h6>
                                            </div>
                                        ))}
                                    </div>
                                </Carousel.Item>
                            ))}
                    </Carousel>

                    {/* Google Review Logo */}
                    <div className="google-review-logo text-center mt-5">
                        <img
                            src={GoogleReviewsLogo}
                            alt="Google Reviews"
                            className="google-logo"
                        />
                        <p className="text-light mt-2 mb-0">
                            See more reviews on{" "}
                            <a
                                className="text-warning fw-semibold text-decoration-none"
                                target="_blank"
                                rel="noreferrer"
                                href="https://www.google.com/search?sca_esv=f668a2dbcf0dcc29&sxsrf=AE3TifO2RXLiClyLj7yRT_lCm5T6nPW_fw:1761973891705&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-Ez-4Zf3hZHYVL0AvL4qRnu2Epwk7oYH8bxp0wDUx6ruutEzRsLdXWryFvcvckz7o1vKsheUd2ymL6BPY5G70TkebuUPxl8RWZ1sixntll9ZlvGPKSw%3D%3D&q=De+Baker%27s+%26+more+Reviews&sa=X&ved=2ahUKEwi1rqyfmNCQAxUfQ_EDHdkMHpEQ0bkNegQINRAD&biw=1536&bih=695&dpr=1.25"
                            >
                                Google
                            </a>
                        </p>
                    </div>
                </Container>
            </section>

            {/* --- CTA Section --- */}
            <section className="cta-section text-center text-light py-5">
                <Container>
                    <h2 className="fw-bold mb-3">Ready to Taste the Magic?</h2>
                    <p>Order online or visit us today to indulge in your favorite treats!</p>
                    <Link to="/contact">
                        <Button variant="warning" className="mt-3 fw-semibold px-4 py-2">
                            Contact Us
                        </Button>
                    </Link>
                </Container>
            </section>

            {/* --- Footer --- */}
            <PublicFooter />
        </>
    );
};

export default Home;