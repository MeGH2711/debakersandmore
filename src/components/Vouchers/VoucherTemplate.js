import React, { forwardRef } from "react";
import "./VoucherTemplate.css";
import BakeryLogo from "../../assets/images/logo.png";

const VoucherTemplate = forwardRef(({ selectedOffer, customerData, formatDate, getTodayFormatted, isPreview }, ref) => {

    // Extract the last 6 characters of offerId or default to 'XXXXXX'
    const offerCode = selectedOffer?.id
        ? selectedOffer.id.slice(-6).toUpperCase()
        : "XXXXXX";

    return (
        <div style={isPreview ? { position: "relative" } : { position: "absolute", left: "-9999px" }}>
            <div ref={ref} className="voucher1-premium-voucher">
                {/* Left Branding Strip */}
                <div className="voucher1-accent-bar"></div>

                <div className="voucher1-voucher-content">
                    {/* Top Section: Header */}
                    <div className="voucher1-header-row">
                        <div className="voucher1-brand-info">
                            <img src={BakeryLogo} alt="Logo" className="voucher1-brand-logo" />
                            <div className="voucher1-brand-text">
                                <span className="voucher1-brand-name">DE BAKER’S & MORE</span>
                                <span className="voucher1-brand-subtext">Premium Quality Since 2024</span>
                            </div>
                        </div>
                        <div className="voucher1-date-badge">
                            <span className="voucher1-label">EXPIRES</span>
                            <span className="voucher1-value">{formatDate(selectedOffer?.validUntil)}</span>
                        </div>
                    </div>

                    {/* Middle Section: Hero Offer */}
                    <div className="voucher1-hero-section">
                        <div className="voucher1-offer-container">
                            <span className="voucher1-exclusive-tag">LIMITED TIME OFFER</span>
                            <h1 className="voucher1-main-offer-title">{selectedOffer?.offerText}</h1>
                        </div>
                    </div>

                    {/* Bottom Section: Footer Details */}
                    <div className="voucher1-footer-details">
                        <div className="voucher1-recipient-info">
                            <span className="voucher1-label">ISSUED TO</span>
                            <span className="voucher1-client-name">{customerData.name}</span>
                            <span className="voucher1-client-phone">{customerData.phone}</span>
                        </div>
                        <div className="voucher1-verification-zone">
                            <div className="voucher1-timestamp">Issued: {getTodayFormatted()}</div>
                            <div className="voucher1-security-code">#DBM-{offerCode}</div>
                        </div>
                    </div>
                </div>

                {/* Modern Decorative Element */}
                <div className="voucher1-background-glow"></div>
            </div>
        </div>
    );
});

export default VoucherTemplate;