import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Home.css";
import PublicFooter from "../components/PublicFooter";
import AnarkaliBiscuit from "../assets/images/productimages/anarkalibiscuit.png";
import RajwadiBiscuit from "../assets/images/productimages/rajwadibiscuit.png";
import BarleyBiscuit from "../assets/images/productimages/barleybiscuit.png";
import MixFruitBiscuit from "../assets/images/productimages/mixfruitbiscuit.png";
import OpeningImage from "../assets/images/landingpageimage.jpeg";

const Home = () => {
    return (
        <>
            {/* --- landing Section --- */}
            <section className="landing-section text-center text-light d-flex flex-column justify-content-center align-items-center">
                <div className="landing-content">
                    <h1 className="display-4 fw-bold">De Bakers & More</h1>
                    <p className="lead mt-3">
                        Freshly baked happiness — cakes, pastries, and more made with love
                    </p>
                    <Link to="/menu">
                        <Button variant="warning" className="fw-semibold mt-3 px-4 py-2">
                            Explore Menu
                        </Button>
                    </Link>
                </div>
            </section>

            {/* --- Featured Products --- */}
            <section className="bestsellers-alt py-5">
                <Container fluid className="px-0">
                    <h2 className="text-center text-warning fw-bold mb-5">Our Bestsellers</h2>

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
                    <Row className="align-items-center">
                        <Col md={6}>
                            <img
                                src={OpeningImage}
                                alt="Bakery"
                                className="img-fluid rounded-4 w-75 shadow"
                            />
                        </Col>
                        <Col md={6}>
                            <h2 className="text-warning fw-bold mb-3">About Us</h2>
                            <p>
                                Welcome to <strong>De Bakers & More</strong> — your neighborhood bakery
                                offering a delightful range of <strong>cakes, pastries, biscuits, breads, buns,</strong>
                                and other mouthwatering treats. Each product is crafted with passion,
                                premium ingredients, and a sprinkle of joy to ensure every bite feels special.
                            </p>
                            <p className="mb-4">
                                From freshly baked breads for your breakfast to indulgent cakes for celebrations,
                                we bring the perfect blend of taste, texture, and tradition. Whether it’s a
                                <strong>birthday, anniversary, festive gathering,</strong> or just a sweet craving —
                                we’ve got you covered!
                            </p>
                            <Link to="/menu">
                                <Button variant="outline-warning" className="fw-semibold">
                                    View Full Menu
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- Testimonials --- */}
            <section className="testimonials-section py-5">
                <Container fluid>
                    <h2 className="text-center text-warning fw-bold mb-5">What Our Customers Say</h2>

                    <div className="testimonial-carousel">
                        <div className="testimonial-track">
                            {[
                                {
                                    name: "Megh",
                                    review: "Amazing Experience, Especially the Puff, Cream Rolls & Biscuits taste awesome😋✨",
                                },
                                {
                                    name: "Akshay Ramani",
                                    review: "I regularly purchase bakery items from here, and I'm always impressed with the quality. The products are consistently fresh and delicious. I especially love the nutritional cookies, puffs, and bread — they taste great and feel healthy too. Highly recommended for anyone looking for quality baked goods",
                                },
                                {
                                    name: "Pravesh Shah",
                                    review: "Newly launched bakery shop in Gota area. All items are fresh and made on daily basis. Puff quality was outstanding. All other items are also good. Gujarati snacks items are also available. People stay near by Gota, Godrej garden city, vande mataram area. Good quality with reasonable prices only at De Baker's & More.",
                                },
                                {
                                    name: "Devang Vora",
                                    review: "Here puff is awesome. Rajwadi and healthy cookies are unbeatable. Nice bakery place in ahmedabad.",
                                },
                                {
                                    name: "Sanjay Ramani",
                                    review: "Good Quality Bakery items, Must go for Fresh and Healthy items. 👌",
                                },
                                {
                                    name: "Vaidehi Patel",
                                    review: "Me and my friends bought a puff and the puff was very fresh and the taste was amazing .love it❤️",
                                },
                                {
                                    name: "M Patel",
                                    review: "Amazing bakery!! The biscuits and puffs were fresh and delicious. Would definitely come back again and again.",
                                },
                                {
                                    name: "Dharmdeep Chouhan",
                                    review: "Excellent place and healthy product and owner is very nice person",
                                },
                            ].map((t, i) => (
                                <div key={i} className="testimonial-card text-light d-flex justify-content-center align-items-center flex-column">
                                    <div>
                                        <p className="fst-italic">“{t.review}”</p>
                                    </div>
                                    <div>
                                        <h6 className="text-warning mt-3 mb-0">{t.name}</h6>
                                    </div>
                                </div>
                            ))}

                            {/* Duplicate the list for smooth infinite scrolling */}
                            {[
                                {
                                    name: "Megh",
                                    review: "Amazing Experience, Especially the Puff, Cream Rolls & Biscuits taste awesome😋✨",
                                },
                                {
                                    name: "Akshay Ramani",
                                    review: "I regularly purchase bakery items from here, and I'm always impressed with the quality. The products are consistently fresh and delicious. I especially love the nutritional cookies, puffs, and bread — they taste great and feel healthy too. Highly recommended for anyone looking for quality baked goods",
                                },
                                {
                                    name: "Pravesh Shah",
                                    review: "Newly launched bakery shop in Gota area. All items are fresh and made on daily basis. Puff quality was outstanding. All other items are also good. Gujarati snacks items are also available. People stay near by Gota, Godrej garden city, vande mataram area. Good quality with reasonable prices only at De Baker's & More.",
                                },
                                {
                                    name: "Devang Vora",
                                    review: "Here puff is awesome. Rajwadi and healthy cookies are unbeatable. Nice bakery place in ahmedabad.",
                                },
                                {
                                    name: "Sanjay Ramani",
                                    review: "Good Quality Bakery items, Must go for Fresh and Healthy items. 👌",
                                },
                                {
                                    name: "Vaidehi Patel",
                                    review: "Me and my friends bought a puff and the puff was very fresh and the taste was amazing .love it❤️",
                                },
                                {
                                    name: "M Patel",
                                    review: "Amazing bakery!! The biscuits and puffs were fresh and delicious. Would definitely come back again and again.",
                                },
                                {
                                    name: "Dharmdeep Chouhan",
                                    review: "Excellent place and healthy product and owner is very nice person",
                                },
                            ].map((t, i) => (
                                <div key={`dup-${i}`} className="testimonial-card text-light">
                                    <p className="fst-italic">“{t.review}”</p>
                                    <h6 className="text-warning mt-3 mb-0">{t.name}</h6>
                                </div>
                            ))}
                        </div>
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