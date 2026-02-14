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
            <div ref={ref} className="voucher2-premium-republic-voucher">
                {/* Saffron Top Section */}
                <div className="voucher2-section voucher2-saffron-bg">
                    <div className="voucher2-header-content d-flex justify-content-center">
                        <img src={BakeryLogo} alt="Logo" className="voucher2-brandlogoVoucher" />
                        <div className="voucher2-brand-info">
                            <h2 className="voucher2-brand-name">DE BAKER’S & MORE</h2>
                            <span className="voucher2-brand-subtext">Premium Quality Since 2024</span>
                        </div>
                    </div>
                </div>

                {/* White Middle Section with Decorative Pattern */}
                <div className="voucher2-section voucher2-white-bg">
                    <div className="voucher2-chakra-watermark"></div>
                    <div className="voucher2-offer-content">
                        <div className="voucher2-offer-pill">REPUBLIC DAY SPECIAL</div>
                        <h1 className="voucher2-offer-title">{selectedOffer?.offerText}</h1>
                        <div className="voucher2-divider"></div>
                        <div className="voucher2-expiry-badge">
                            <span className="voucher2-label">OFFER EXPIRES ON</span>
                            <span className="voucher2-expiry-date">{formatDate(selectedOffer?.validUntil)}</span>
                        </div>
                    </div>
                </div>

                {/* Green Bottom Section */}
                <div className="voucher2-section voucher2-green-bg">
                    <div className="voucher2-footer-flex">
                        <div className="voucher2-recipient-details">
                            <span className="voucher2-label-light">EXCLUSIVE FOR</span>
                            <span className="voucher2-customer-name">{customerData.name}</span>
                            <span className="voucher2-customer-phone">{customerData.phone}</span>
                        </div>
                        <div className="voucher2-barcode-zone">
                            <div className="voucher2-security-code">#DBM-{offerCode}</div>
                            <div className="voucher2-issued-date">Issued: {getTodayFormatted()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default VoucherTemplate;