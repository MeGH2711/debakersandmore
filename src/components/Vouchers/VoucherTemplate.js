import React, { forwardRef } from "react";
import "./VoucherTemplate.css";
import BakeryLogo from "../../assets/images/logo.png";

const VoucherTemplate = forwardRef(({ selectedOffer, customerData, formatDate, getTodayFormatted }, ref) => {

    // Extract the last 6 characters of offerId or default to 'XXXXXX'
    const offerCode = selectedOffer?.id
        ? selectedOffer.id.slice(-6).toUpperCase()
        : "XXXXXX";

    return (
        <div style={{ position: "absolute", left: "-9999px" }}>
            <div ref={ref} className="premium-voucher">
                {/* Left Branding Strip */}
                <div className="accent-bar"></div>

                <div className="voucher-content">
                    {/* Top Section: Header */}
                    <div className="header-row">
                        <div className="brand-info">
                            <img src={BakeryLogo} alt="Logo" className="brand-logo" />
                            <div className="brand-text">
                                <span className="brand-name">DE BAKER’S & MORE</span>
                                <span className="brand-subtext">Premium Quality Since 2024</span>
                            </div>
                        </div>
                        <div className="date-badge">
                            <span className="label">EXPIRES</span>
                            <span className="value">{formatDate(selectedOffer?.validUntil)}</span>
                        </div>
                    </div>

                    {/* Middle Section: Hero Offer */}
                    <div className="hero-section">
                        <div className="offer-container">
                            <span className="exclusive-tag">LIMITED TIME OFFER</span>
                            <h1 className="main-offer-title">{selectedOffer?.offerText}</h1>
                        </div>
                    </div>

                    {/* Bottom Section: Footer Details */}
                    <div className="footer-details">
                        <div className="recipient-info">
                            <span className="label">ISSUED TO</span>
                            <span className="client-name">{customerData.name}</span>
                            <span className="client-phone">{customerData.phone}</span>
                        </div>
                        <div className="verification-zone">
                            <div className="timestamp">Issued: {getTodayFormatted()}</div>
                            {/* Updated security code logic here */}
                            <div className="security-code">#DBM-{offerCode}</div>
                        </div>
                    </div>
                </div>

                {/* Modern Decorative Element */}
                <div className="background-glow"></div>
            </div>
        </div>
    );
});

export default VoucherTemplate;