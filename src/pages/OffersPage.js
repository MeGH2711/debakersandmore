import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import html2canvas from "html2canvas";
import PublicFooter from "../components/PublicFooter";
import BakeryLogo from "../assets/images/logo.png";
import "./OffersPage.css";
import toast, { Toaster } from "react-hot-toast";

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "" });
    const voucherRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [year, month, day] = dateString.split("-");
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    };

    const getTodayFormatted = () => {
        const today = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    };

    useEffect(() => {
        const fetchOffers = async () => {
            const today = new Date().toISOString().split('T')[0];
            const q = query(
                collection(db, "offers"),
                where("active", "==", true)
            );
            const querySnapshot = await getDocs(q);
            const allActive = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort: Valid offers first, then expired ones
            const sortedOffers = allActive.sort((a, b) => {
                const aExpired = a.validUntil < today;
                const bExpired = b.validUntil < today;
                return aExpired - bExpired;
            });

            setOffers(sortedOffers);
        };
        fetchOffers();
    }, []);

    const handleRedeem = async (e) => {
        e.preventDefault();

        const loadingToast = toast.loading("Verifying your details...");

        try {
            const redeemedRef = collection(db, "redeemed_offers");
            const q = query(
                redeemedRef,
                where("offerId", "==", selectedOffer.id),
                where("customerPhone", "==", customerData.phone)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                toast.dismiss(loadingToast);
                toast.error("This mobile number has already redeemed this specific voucher!", {
                    duration: 4000,
                    style: { background: '#333', color: '#fff' }
                });
                return;
            }

            await addDoc(collection(db, "redeemed_offers"), {
                offerId: selectedOffer.id,
                customerName: customerData.name,
                customerPhone: customerData.phone,
                customerAddress: customerData.address,
                offerText: selectedOffer.offerText,
                redeemedAt: serverTimestamp(),
            });

            toast.success("Voucher generated! Starting download...", { id: loadingToast });

            setTimeout(async () => {
                const element = voucherRef.current;
                if (!element) return;

                const canvas = await html2canvas(element, {
                    backgroundColor: "#ffffff",
                    scale: 3,
                    useCORS: true,
                    logging: false,
                });

                const image = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = image;
                link.download = `DB_Voucher_${customerData.name.replace(/\s+/g, '_')}.png`;
                link.click();

                setShowModal(false);
                setCustomerData({ name: "", phone: "", address: "" });
            }, 500);

        } catch (error) {
            console.error("Redemption error:", error);
            toast.error("Error generating voucher. Please try again.", { id: loadingToast });
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="product-page">
                <div style={{ position: "absolute", left: "-9999px" }}>
                    <div ref={voucherRef} className="designer-voucher">
                        <div className="voucher-sidebar">
                            <span className="sidebar-text">EXCLUSIVE DEALS</span>
                        </div>

                        <div className="voucher-main">
                            <div className="voucher-header">
                                <img src={BakeryLogo} alt="Logo" className="voucher-logo" />
                                <span className="voucher-tagline">De Baker’s & More</span>
                            </div>

                            <div className="voucher-body">
                                <h4 className="voucher-offer-text">{selectedOffer?.offerText}</h4>

                                <div className="voucher-details-grid">
                                    <div className="voucher-info-box">
                                        <strong>Issued To</strong>
                                        <span className="customer-name">{customerData.name} <br /></span>
                                        <span className="customer-number" style={{ fontSize: '0.8rem', opacity: 0.8 }}>{customerData.phone}</span>
                                    </div>
                                    <div className="voucher-info-box text-end">
                                        <strong>Valid Until</strong>
                                        <span style={{ color: '#f7b731', fontWeight: 'bold' }}>
                                            {formatDate(selectedOffer?.validUntil)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="voucher-footer d-flex justify-content-between align-items-end">
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    * Present this image at the counter to redeem. <br />
                                    Generated on: {getTodayFormatted()}
                                </div>
                                <div style={{ fontWeight: 'bold', letterSpacing: '2px', color: '#f7b731' }}>
                                    FRESHLY BAKED
                                </div>
                            </div>
                        </div>

                        <div className="voucher-notch"></div>
                    </div>
                </div>

                <Container>
                    <h2 className="heading">Exclusive Offers</h2>

                    <Row className="desktop-view d-flex justify-content-center">
                        {offers.map((offer) => {
                            const isExpired = offer.validUntil < new Date().toISOString().split('T')[0];
                            return (
                                <Col md={4} key={offer.id} className="mb-4">
                                    <Card className={`product-card h-100 ${isExpired ? "opacity-75 grayscale" : ""}`}>
                                        <Card.Body className="product-body d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="card-header-section d-flex justify-content-between align-items-start">
                                                    <Card.Title className="product-title">{offer.offerText}</Card.Title>
                                                    {isExpired && <span className="badge bg-danger">EXPIRED</span>}
                                                </div>
                                                <div className="product-info mt-3">
                                                    <p>
                                                        <strong>Valid Until:</strong>{" "}
                                                        <span className={isExpired ? "text-danger text-decoration-line-through" : "price-tag"}>
                                                            {formatDate(offer.validUntil)}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant={isExpired ? "secondary" : "warning"}
                                                className="mt-3 fw-bold w-100 py-2"
                                                style={{ borderRadius: "12px" }}
                                                disabled={isExpired}
                                                onClick={() => { setSelectedOffer(offer); setShowModal(true); }}
                                            >
                                                {isExpired ? "Offer Ended" : "Get Voucher"}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    <div className="mobile-view">
                        {offers.map((offer, i) => {
                            const isExpired = offer.validUntil < new Date().toISOString().split('T')[0];
                            return (
                                <div
                                    key={i}
                                    className={`mobile-product-row ${isExpired ? "opacity-50" : ""}`}
                                    onClick={() => { if (!isExpired) { setSelectedOffer(offer); setShowModal(true); } }}
                                    style={{ cursor: isExpired ? "not-allowed" : "pointer" }}
                                >
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        <div className="d-flex flex-column">
                                            <span className={`mobile-product-name ${isExpired ? "text-decoration-line-through" : ""}`}>
                                                {offer.offerText}
                                            </span>
                                            <small className={`${isExpired ? "text-danger" : "text-warning"} mt-1`}>
                                                {isExpired ? "Expired: " : "Valid: "} {formatDate(offer.validUntil)}
                                            </small>
                                        </div>
                                        <span className="mobile-product-price text-warning">
                                            {isExpired ? "✕" : "➔"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="bg-dark text-light">
                    <Modal.Header closeButton closeVariant="white">
                        <Modal.Title>Claim Your Voucher</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleRedeem}>
                            <Form.Group className="mb-3">
                                <Form.Label>Your Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="bg-dark text-light border-secondary"
                                    required
                                    value={customerData.name}
                                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    inputMode="numeric"
                                    className="bg-dark text-light border-secondary"
                                    required
                                    placeholder="10-digit mobile number"
                                    value={customerData.phone}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setCustomerData({ ...customerData, phone: e.target.value });
                                    }}
                                />
                                <Form.Text className="text-warning">
                                    Enter 10 digits without spaces or country code.
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Area / Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    className="bg-dark text-light border-secondary"
                                    required
                                    placeholder="Enter your area or address"
                                    value={customerData.address}
                                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                />
                            </Form.Group>
                            <Button variant="warning" type="submit" className="w-100 fw-bold">Download Your Voucher</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
            <PublicFooter />
        </>
    );
};

export default OffersPage;