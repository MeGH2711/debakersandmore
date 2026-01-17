import React, { forwardRef } from "react";
import "./RepublicDayVoucher.css";
import BakeryLogo from "../../assets/images/logo.png";

const VoucherTemplate = forwardRef(({ selectedOffer, customerData, formatDate, getTodayFormatted, isPreview }, ref) => {

    // Priority: 1. Random Security Code, 2. Sliced Offer ID, 3. Placeholder
    const offerCode = customerData?.securityCode
        ? customerData.securityCode
        : (selectedOffer?.id ? selectedOffer.id.slice(-6).toUpperCase() : "XXXXXX");

    // Dynamic style to switch between "Hidden for printing" and "Visible for preview"
    const containerStyle = isPreview
        ? { position: "relative", display: "inline-block" }
        : { position: "absolute", left: "-9999px" };

    return (
        <div style={containerStyle}>
            <div ref={ref} className="premium-republic-voucher">
                {/* Saffron Top Section */}
                <div className="section saffron-bg">
                    <div className="header-content">
                        <img src={BakeryLogo} alt="Logo" className="brand-logo" />
                        <div className="brand-info">
                            <h2 className="brand-name">DE BAKER’S & MORE</h2>
                            <span className="brand-subtext">Premium Quality Since 2024</span>
                        </div>
                    </div>
                </div>

                {/* White Middle Section with Decorative Pattern */}
                <div className="section white-bg">
                    <div className="chakra-watermark"></div>
                    <div className="offer-content">
                        <div className="offer-pill">REPUBLIC DAY SPECIAL</div>
                        <h1 className="offer-title">{selectedOffer?.offerText}</h1>
                        <div className="divider"></div>
                        <div className="expiry-badge">
                            <span className="label">OFFER EXPIRES ON</span>
                            <span className="expiry-date">{formatDate(selectedOffer?.validUntil)}</span>
                        </div>
                    </div>
                </div>

                {/* Green Bottom Section */}
                <div className="section green-bg">
                    <div className="footer-flex">
                        <div className="recipient-details">
                            <span className="label-light">EXCLUSIVE FOR</span>
                            <span className="customer-name">{customerData.name}</span>
                            <span className="customer-phone">{customerData.phone}</span>
                        </div>
                        <div className="barcode-zone">
                            <div className="security-code">#DBM-{offerCode}</div>
                            <div className="issued-date">Issued: {getTodayFormatted()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default VoucherTemplate;