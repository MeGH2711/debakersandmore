import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import html2canvas from "html2canvas";
import PublicFooter from "../components/PublicFooter";
import VoucherTemplate from "../components/Vouchers/VoucherTemplate";
import BakeryLogo from "../assets/images/logo.png";
import "./OffersPage.css";
import toast, { Toaster } from "react-hot-toast";

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "", securityCode: "" });
    const voucherRef = useRef(null);

    // Helper to generate a unique 6-digit alphanumeric code
    const generateSecurityCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

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
            const today = new Date().toLocaleDateString('en-CA');
            const q = query(
                collection(db, "offers"),
                where("active", "==", true)
            );
            const querySnapshot = await getDocs(q);
            const allToDisplay = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const sortedOffers = allToDisplay.sort((a, b) => {
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

            // 1. Generate the unique code
            const newSecurityCode = generateSecurityCode();

            // 2. Save to Firestore with the security code
            await addDoc(collection(db, "redeemed_offers"), {
                offerId: selectedOffer.id,
                customerName: customerData.name,
                customerPhone: customerData.phone,
                customerAddress: customerData.address,
                offerText: selectedOffer.offerText,
                securityCode: newSecurityCode, // Stored in DB
                redeemedAt: serverTimestamp(),
            });

            // 3. Update local state so the voucher template can see the code
            setCustomerData(prev => ({ ...prev, securityCode: newSecurityCode }));

            toast.success("Voucher generated! Starting download...", { id: loadingToast });

            // Small delay to ensure state update is reflected in the DOM before capture
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
                setCustomerData({ name: "", phone: "", address: "", securityCode: "" });
            }, 600);

        } catch (error) {
            console.error("Redemption error:", error);
            toast.error("Error generating voucher. Please try again.", { id: loadingToast });
        }
    };

    const todayStr = new Date().toLocaleDateString('en-CA');

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="product-page">

                <VoucherTemplate
                    ref={voucherRef}
                    selectedOffer={selectedOffer}
                    customerData={customerData}
                    formatDate={formatDate}
                    getTodayFormatted={getTodayFormatted}
                />

                <Container>
                    <h2 className="heading">Exclusive Offers</h2>

                    <Row className="desktop-view">
                        {offers.map((offer) => {
                            const isExpired = offer.validUntil < todayStr;
                            const isLastDay = offer.validUntil === todayStr;
                            return (
                                <Col md={12} key={offer.id} className="mb-4">
                                    <div className={`full-width-offer-card ${isExpired ? "expired" : ""}`}>
                                        <div className="offer-visual">
                                            <div className="promo-badge">PROMO</div>
                                            <img src={BakeryLogo} alt="Bakery" className="offer-mini-logo" />
                                        </div>

                                        <div className="offer-content">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h3 className="offer-main-text">{offer.offerText}</h3>
                                                    <p className="offer-description-text">{offer.description}</p>
                                                    <p className="offer-expiry">
                                                        <span className="label">VALID UNTIL:</span>
                                                        <span className="date">{formatDate(offer.validUntil)}</span>
                                                    </p>
                                                </div>
                                                <div className="d-flex flex-column align-items-end gap-2">
                                                    {isExpired && <span className="status-pill">OFFER ENDED</span>}
                                                    {isLastDay && <span className="status-pill last-day-pill">ENDS TODAY</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="offer-action">
                                            <div className="dash-divider"></div>
                                            <Button
                                                variant={isExpired ? "secondary" : "warning"}
                                                className="redeem-btn"
                                                disabled={isExpired}
                                                onClick={() => { setSelectedOffer(offer); setShowModal(true); }}
                                            >
                                                {isExpired ? "EXPIRED" : "CLAIM NOW"}
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>

                    <div className="mobile-view">
                        {offers.map((offer, i) => {
                            const isExpired = offer.validUntil < todayStr;
                            const isLastDay = offer.validUntil === todayStr;

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
                                            {isLastDay && <small className="last-day-text">Ends Tonight!</small>}
                                            <small className="text-light opacity-50 d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                                {offer.description}
                                            </small>
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