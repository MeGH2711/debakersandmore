import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Modal, Form } from "react-bootstrap";
import html2canvas from "html2canvas";
import PublicFooter from "../components/PublicFooter";
import VoucherTemplate from "../components/Vouchers/VoucherTemplate";
import "./OffersPage.css";
import toast, { Toaster } from "react-hot-toast";
import { FiArrowRight } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "", securityCode: "" });
    const voucherRef = useRef(null);
    const ticketRefs = useRef([]);

    const generateSecurityCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
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

    /* Fetch offers */
    useEffect(() => {
        const fetchOffers = async () => {
            const today = new Date().toLocaleDateString("en-CA");
            const q = query(collection(db, "offers"), where("active", "==", true));
            const snap = await getDocs(q);
            const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const sorted = all.sort((a, b) => (a.validUntil < today) - (b.validUntil < today));
            setOffers(sorted);
        };
        fetchOffers();
    }, []);

    /* Scroll-reveal for ticket cards */
    useEffect(() => {
        if (!offers.length) return;
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting) e.target.classList.add("offersPageTicketVisible");
            }),
            { threshold: 0.08 }
        );
        ticketRefs.current.forEach((el, i) => {
            if (!el) return;
            el.style.transitionDelay = `${i * 0.08}s`;
            el.style.transition = "opacity 0.65s ease, transform 0.65s ease, border-color 0.35s ease, box-shadow 0.35s ease";
            obs.observe(el);
        });
        return () => obs.disconnect();
    }, [offers]);

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
            const snap = await getDocs(q);
            if (!snap.empty) {
                toast.dismiss(loadingToast);
                toast.error("This number has already redeemed this voucher.", {
                    duration: 4000,
                    style: { background: "#1A1612", color: "#F5EDD8", border: "1px solid rgba(200,134,26,0.25)", borderRadius: "8px" }
                });
                return;
            }
            const newSecurityCode = generateSecurityCode();
            await addDoc(collection(db, "redeemed_offers"), {
                offerId: selectedOffer.id,
                customerName: customerData.name,
                customerPhone: customerData.phone,
                customerAddress: customerData.address,
                offerText: selectedOffer.offerText,
                securityCode: newSecurityCode,
                redeemedAt: serverTimestamp(),
            });
            setCustomerData(prev => ({ ...prev, securityCode: newSecurityCode }));
            toast.success("Voucher generated! Downloading...", {
                id: loadingToast,
                style: { background: "#1A1612", color: "#F5EDD8", border: "1px solid rgba(200,134,26,0.25)", borderRadius: "8px" }
            });
            setTimeout(async () => {
                const element = voucherRef.current;
                if (!element) return;
                const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 3, useCORS: true, logging: false });
                const image = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = image;
                link.download = `DB_Voucher_${customerData.name.replace(/\s+/g, "_")}.png`;
                link.click();
                setShowModal(false);
                setCustomerData({ name: "", phone: "", address: "", securityCode: "" });
            }, 600);
        } catch (err) {
            console.error("Redemption error:", err);
            toast.error("Error generating voucher. Please try again.", { id: loadingToast });
        }
    };

    const todayStr = new Date().toLocaleDateString("en-CA");
    const activeCount = offers.filter(o => o.validUntil >= todayStr).length;

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#1A1612",
                        color: "#F5EDD8",
                        border: "1px solid rgba(200,134,26,0.22)",
                        borderRadius: "8px",
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.85rem",
                    }
                }}
            />

            <div className="offersPage">
                {/* Hidden voucher for screenshot */}
                <VoucherTemplate
                    ref={voucherRef}
                    selectedOffer={selectedOffer}
                    customerData={customerData}
                    formatDate={formatDate}
                    getTodayFormatted={getTodayFormatted}
                />

                {/* ── HERO ── */}
                <section className="offersPageOffersHero">
                    <div className="offersPageOffersHeroBgWord">Offers</div>
                    <div className="offersPageOffersHeroInner">
                        <p className="offersPageOffersEyebrow">De Bakers &amp; More</p>
                        <h1 className="offersPageOffersHeroTitle">
                            Exclusive <em>Offers</em><br />for You
                        </h1>
                        <p className="offersPageOffersHeroSub">
                            Claim your voucher · Freshly baked savings · Limited time only
                        </p>
                        <div className="offersPageOffersDivider" />
                    </div>
                </section>

                {/* ── LIST ── */}
                <div className="offersPageOffersBody">

                    {/* Count bar */}
                    <div className="offersPageOffersCountBar">
                        <span className="offersPageOffersCountLabel">Available Offers</span>
                        <span className="offersPageOffersCountNum">
                            {activeCount > 0 ? `${activeCount} active` : "None right now"}
                        </span>
                    </div>

                    {/* ── DESKTOP TICKET LIST ── */}
                    <div className="offersPageDesktopView">
                        {offers.length === 0 && (
                            <div className="offersPageOffersEmpty">
                                <div className="offersPageOffersEmptyGlyph">◇</div>
                                <p>No offers available at the moment. Check back soon.</p>
                            </div>
                        )}

                        {offers.map((offer, i) => {
                            const isExpired = offer.validUntil < todayStr;
                            const isLastDay = offer.validUntil === todayStr;
                            const offerCode = `#DB-${String(1000 + i).slice(1)}`;

                            return (
                                <div
                                    key={offer.id}
                                    className={`offersPageOfferTicket${isExpired ? " offersPageTicketExpired" : ""}`}
                                    ref={el => ticketRefs.current[i] = el}
                                >

                                    {/* Gold left strip */}
                                    <div className="offersPageTicketStubLeft">
                                        <span className="offersPageTicketStubWord">
                                            {isExpired ? "Expired" : "Promo"}
                                        </span>
                                    </div>

                                    {/* Perforation line */}
                                    <div className="offersPageTicketPerf" />

                                    {/* Main body */}
                                    <div className="offersPageTicketBody">
                                        <div className="offersPageTicketTagRow">
                                            <span className="offersPageTicketCategory">Special Offer</span>
                                            {!isExpired && isLastDay && (
                                                <span className="offersPageTicketBadge offersPageBadgeEndsToday">Ends Today</span>
                                            )}
                                            {isExpired && (
                                                <span className="offersPageTicketBadge offersPageBadgeExpired">Offer Ended</span>
                                            )}
                                        </div>

                                        <h2 className="offersPageTicketHeadline">{offer.offerText}</h2>

                                        {offer.description && (
                                            <p className="offersPageTicketDesc">{offer.description}</p>
                                        )}

                                        <div className="offersPageTicketMeta">
                                            <span className="offersPageTicketMetaLabel">
                                                {isExpired ? "Expired On" : "Valid Until"}
                                            </span>
                                            <span className="offersPageTicketMetaSep" />
                                            <span className="offersPageTicketMetaDate">{formatDate(offer.validUntil)}</span>
                                        </div>
                                    </div>

                                    {/* CTA stub */}
                                    <div className="offersPageTicketStubRight">
                                        {isExpired ? (
                                            <div className="offersPageTicketExpiredBtn">Expired</div>
                                        ) : (
                                            <button
                                                className="offersPageTicketClaimBtn"
                                                onClick={() => { setSelectedOffer(offer); setShowModal(true); }}
                                            >
                                                <span>Claim Now</span>
                                            </button>
                                        )}
                                        <span className="offersPageTicketId">{offerCode}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── MOBILE LIST ── */}
                    <div className="offersPageMobileView">
                        {offers.map((offer, i) => {
                            const isExpired = offer.validUntil < todayStr;
                            const isLastDay = offer.validUntil === todayStr;
                            return (
                                <div
                                    key={i}
                                    className={`offersPageMobileProductRow ${isExpired ? "offersPageExpiredRow opacity-50" : ""}`}
                                    onClick={() => { if (!isExpired) { setSelectedOffer(offer); setShowModal(true); } }}
                                    style={{ cursor: isExpired ? "not-allowed" : "pointer" }}
                                >
                                    <div className="offersPageMobileRowTop">
                                        <span className="offersPageMobileProductName">{offer.offerText}</span>
                                        {isExpired
                                            ? <div className="offersPageMobileRowExpiredIcon">
                                                <RxCross1 size={14} />
                                            </div>
                                            : <div className="offersPageMobileRowArrow">
                                                <FiArrowRight size={14} />
                                            </div>
                                        }
                                    </div>

                                    {offer.description && (
                                        <p className="offersPageMobileRowDesc">{offer.description}</p>
                                    )}

                                    <div className="offersPageMobileRowFooter">
                                        <span className={`offersPageMobileRowDate ${isExpired ? "offersPageDateExpired" : ""}`}>
                                            {isExpired ? "Expired: " : "Valid until: "}
                                            {formatDate(offer.validUntil)}
                                        </span>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {!isExpired && <span className="offersPageMobileRowCategory">Special Offer</span>}
                                            {isLastDay && !isExpired && (
                                                <span className="offersPageMobileRowBadge">Ends Tonight</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── CLAIM MODAL ── */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                className="offersPageOffersModal"
            >
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title>Claim Your Voucher</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOffer && (
                        <div className="offersPageModalOfferChip">{selectedOffer.offerText}</div>
                    )}
                    <Form onSubmit={handleRedeem}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                placeholder="Your full name"
                                value={customerData.name}
                                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                inputMode="numeric"
                                required
                                placeholder="10-digit mobile number"
                                value={customerData.phone}
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setCustomerData({ ...customerData, phone: e.target.value });
                                }}
                            />
                            <Form.Text>Without spaces or country code.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Area / Address</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                required
                                placeholder="Your area or address"
                                value={customerData.address}
                                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                            />
                        </Form.Group>
                        <button type="submit" className="offersPageModalSubmitBtn">
                            <span>Download Your Voucher</span>
                        </button>
                    </Form>
                </Modal.Body>
            </Modal>

            <PublicFooter />
        </>
    );
};

export default OffersPage;