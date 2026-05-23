import React, { useEffect, useState, useCallback } from "react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "firebase/firestore";
import { db } from "../../firebase";
import {
    Spinner,
    Modal
} from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";
import "./AdminOffers.css";

// Voucher Templates
import RegularVoucher from "../../components/Vouchers/VoucherTemplate";
import RepublicDayVoucher from "../../components/Vouchers/RepublicDayVoucher";

// Icons
import {
    FiPlus,
    FiPercent,
    FiCheckSquare,
    FiClock,
    FiEye,
    FiEdit2,
    FiUsers,
    FiTrash2,
    FiDownload,
    FiAlertCircle,
    FiX
} from "react-icons/fi";

// Registry Map for Multiple Vouchers
const VOUCHER_TEMPLATES = {
    RepublicDay: { label: "Republic Day Voucher", component: RepublicDayVoucher },
    SecondTemplate: { label: "Regular Voucher", component: RegularVoucher },
};

const DEFAULT_TEMPLATE_KEY = "RegularVoucher";

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({});

    // States for the Offer Modal
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentOfferId, setCurrentOfferId] = useState(null);
    const [newOfferTitle, setNewOfferTitle] = useState("");
    const [newOfferDescription, setNewOfferDescription] = useState("");
    const [validUntil, setValidUntil] = useState("");

    // States for Voucher Preview
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewOffer, setPreviewOffer] = useState(null);

    const [redemptions, setRedemptions] = useState([]);
    const [showRedemptionModal, setShowRedemptionModal] = useState(false);
    const [loadingRedemptions, setLoadingRedemptions] = useState(false);
    const [viewingOffer, setViewingOffer] = useState(null);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [claimFilter, setClaimFilter] = useState("all");

    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE_KEY);

    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    // Dynamic Confirmation Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => {}
    });

    const navigate = useNavigate();
    const auth = getAuth();

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [year, month, day] = dateString.split("-");
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    };

    const getTodayFormatted = () => {
        return new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [offersSnap, redemptionsSnap] = await Promise.all([
                getDocs(collection(db, "offers")),
                getDocs(collection(db, "redeemed_offers"))
            ]);

            const fetchedOffers = offersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

            const counts = {};
            redemptionsSnap.docs.forEach(doc => {
                const data = doc.data();
                const text = data.offerText;
                if (!counts[text]) {
                    counts[text] = { redeemed: 0, claimed: 0 };
                }
                counts[text].redeemed += 1;
                if (data.claimed) {
                    counts[text].claimed += 1;
                }
            });

            setOffers(fetchedOffers);
            setStats(counts);
        } catch (error) {
            console.error("Error fetching data:", error);
            triggerToast("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleShowPreview = (offer) => {
        setPreviewOffer(offer);
        setShowPreviewModal(true);
    };

    const handleShowAdd = () => {
        setIsEditing(false);
        setCurrentOfferId(null);
        setNewOfferTitle("");
        setNewOfferDescription("");
        setValidUntil("");
        setShowOfferModal(true);
        setSelectedTemplate(DEFAULT_TEMPLATE_KEY);
    };

    const handleShowEdit = (offer) => {
        setIsEditing(true);
        setCurrentOfferId(offer.id);
        setNewOfferTitle(offer.offerText);
        setNewOfferDescription(offer.description || "");
        setValidUntil(offer.validUntil);
        setShowOfferModal(true);
        setSelectedTemplate(offer.template && VOUCHER_TEMPLATES[offer.template] ? offer.template : DEFAULT_TEMPLATE_KEY);
    };

    const handleSaveOffer = async () => {
        if (!newOfferTitle.trim() || !newOfferDescription.trim() || !validUntil) {
            return triggerToast("Please fill in all fields!");
        }

        const offerData = {
            offerText: newOfferTitle,
            description: newOfferDescription,
            validUntil: validUntil,
            template: selectedTemplate,
        };

        try {
            if (isEditing) {
                const docRef = doc(db, "offers", currentOfferId);
                await updateDoc(docRef, offerData);
                setOffers((prev) => prev.map((o) => (o.id === currentOfferId ? { ...o, ...offerData } : o)));
            } else {
                const fullNewOffer = {
                    ...offerData,
                    active: true,
                    createdAt: Date.now()
                };
                const docRef = await addDoc(collection(db, "offers"), fullNewOffer);
                setOffers((prev) => [...prev, { id: docRef.id, ...fullNewOffer }]);
            }
            setShowOfferModal(false);
        } catch (error) {
            console.error("Error saving offer:", error);
            triggerToast("Error saving offer adjustments.");
        }
    };

    const exportToExcel = () => {
        if (filteredCustomers.length === 0) return;
        const excelData = filteredCustomers.map((r, index) => ({
            "Sr. No.": index + 1,
            "Security Code": r.securityCode || "N/A",
            "Offer": viewingOffer?.offerText,
            "Customer Name": r.customerName,
            "Phone Number": r.customerPhone,
            "Address": r.customerAddress,
            "Date Generated": r.redeemedAt?.toDate().toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            }) || "N/A",
            "Claimed Status": r.claimed ? "Claimed" : "Pending"
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Redemptions");
        XLSX.writeFile(workbook, `${viewingOffer?.offerText.replace(/[^a-z0-9]/gi, '_')}_Customers.xlsx`);
    };

    const fetchRedemptions = async (offer) => {
        setLoadingRedemptions(true);
        setViewingOffer(offer);
        setCustomerSearchQuery("");
        setShowRedemptionModal(true);
        try {
            const q = query(
                collection(db, "redeemed_offers"),
                where("offerText", "==", offer.offerText)
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRedemptions(data);
        } catch (error) {
            console.error("Error fetching redemptions:", error);
        } finally {
            setLoadingRedemptions(false);
        }
    };

    const handleToggleClaimed = async (redemptionId, currentStatus, offerText) => {
        try {
            const docRef = doc(db, "redeemed_offers", redemptionId);
            await updateDoc(docRef, { claimed: !currentStatus });
            setRedemptions(prev => prev.map(r => r.id === redemptionId ? { ...r, claimed: !currentStatus } : r));
            setStats(prev => ({
                ...prev,
                [offerText]: {
                    ...prev[offerText],
                    claimed: (prev[offerText]?.claimed || 0) + (!currentStatus ? 1 : -1)
                }
            }));
        } catch (error) {
            console.error("Error updating claimed status:", error);
        }
    };

    // Modified to use Custom Confirmation Modal
    const handleDeleteRedemption = (redemptionId, isClaimed, offerText) => {
        setConfirmConfig({
            title: "Delete Customer Record",
            message: "Are you sure you want to delete this customer record permanently from the ledger?",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "redeemed_offers", redemptionId));
                    setRedemptions(prev => prev.filter(r => r.id !== redemptionId));
                    setStats(prev => ({
                        ...prev,
                        [offerText]: {
                            ...prev[offerText],
                            redeemed: Math.max(0, (prev[offerText]?.redeemed || 0) - 1),
                            claimed: isClaimed ? Math.max(0, (prev[offerText]?.claimed || 0) - 1) : (prev[offerText]?.claimed || 0)
                        }
                    }));
                    setShowConfirmModal(false);
                } catch (error) {
                    console.error("Error deleting redemption:", error);
                    triggerToast("Error adjusting ledger.");
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleToggleDisplay = async (id, currentStatus) => {
        try {
            const docRef = doc(db, "offers", id);
            await updateDoc(docRef, { active: !currentStatus });
            setOffers((prev) => prev.map((o) => o.id === id ? { ...o, active: !currentStatus } : o));
        } catch (error) {
            console.error("Error updating display status:", error);
        }
    };

    // Modified to use Custom Confirmation Modal
    const handleDelete = (id) => {
        setConfirmConfig({
            title: "Delete Promotional Offer",
            message: "Are you sure you want to permanently delete this offer? This process cannot be undone.",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, "offers", id));
                    setOffers((prev) => prev.filter((o) => o.id !== id));
                    setShowConfirmModal(false);
                } catch (error) {
                    console.error("Error deleting offer:", error);
                    triggerToast("Error discarding promotional campaign.");
                }
            }
        });
        setShowConfirmModal(true);
    };

    const filteredOffers = offers.filter((o) =>
        o.offerText.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCustomers = redemptions.filter((r) => {
        const matchesSearch =
            r.customerName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            r.customerPhone.includes(customerSearchQuery) ||
            (r.securityCode && r.securityCode.toLowerCase().includes(customerSearchQuery.toLowerCase()));

        if (claimFilter === "claimed") return matchesSearch && r.claimed === true;
        if (claimFilter === "pending") return matchesSearch && !r.claimed;
        return matchesSearch;
    });

    const totalOffersCount = offers.length;
    const liveOffersCount = offers.filter(o => o.active).length;
    const totalRedemptionsCount = Object.values(stats).reduce((acc, curr) => acc + (curr.redeemed || 0), 0);

    const hasActiveFilters = searchQuery;

    const getPreviewComponent = () => {
        if (!previewOffer) return null;
        const targetTemplate = VOUCHER_TEMPLATES[previewOffer.template] || VOUCHER_TEMPLATES[DEFAULT_TEMPLATE_KEY];
        const Component = targetTemplate.component;

        return (
            <Component
                selectedOffer={previewOffer}
                customerData={{ name: "John Doe", phone: "+91 9876543210", securityCode: "SAMPLE" }}
                formatDate={formatDate}
                getTodayFormatted={getTodayFormatted}
                isPreview={true}
            />
        );
    };

    return (
        <>
            <AdminSidebar />
            <div className="sidebar-page-wrapper pt-4 pb-5 px-4">
                <div className="container-fluid">

                    {/* ── Page Heading ─────────────────────────── */}
                    <div className="mb-4">
                        <h1 className="page-title mb-0">
                            Promotions &amp; <span>Offers</span>
                        </h1>
                        <p className="page-subtitle mt-1">
                            Create vouchers, manage customer redemptions &amp; configure display visibility
                        </p>
                    </div>

                    {/* ── Redesigned Theme Stats Cards ───────────────── */}
                    <div className="row g-4 mb-5">
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="stat-card unique-card-products">
                                <div className="stat-card-body">
                                    <div className="stat-content">
                                        <p className="stat-label">Total Campaigns</p>
                                        <div className="stat-value">{totalOffersCount}</div>
                                    </div>
                                    <div className="stat-icon-box box-gold">
                                        <FiPercent size={24} />
                                    </div>
                                </div>
                                <div className="stat-card-footer">
                                    <span className="stat-trending-neutral">Historical voucher creations</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="stat-card unique-card-categories">
                                <div className="stat-card-body">
                                    <div className="stat-content">
                                        <p className="stat-label">Active on Feed</p>
                                        <div className="stat-value">
                                            {liveOffersCount}
                                            <span className="stat-value-sep">/</span>
                                            <span className="stat-value-total">{totalOffersCount}</span>
                                        </div>
                                    </div>
                                    <div className="stat-icon-box box-teal">
                                        <FiCheckSquare size={24} />
                                    </div>
                                </div>
                                <div className="stat-card-footer">
                                    <span className="stat-trending-neutral">Currently visible to clients</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="stat-card unique-card-available">
                                <div className="stat-card-body">
                                    <div className="stat-content">
                                        <p className="stat-label">Total Claimed Vouchers</p>
                                        <div className="stat-value">{totalRedemptionsCount}</div>
                                    </div>
                                    <div className="stat-icon-box box-amber">
                                        <FiClock size={24} />
                                    </div>
                                </div>
                                <div className="stat-card-footer">
                                    <span className="stat-trending-success">Generated customer rewards</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Toolbar ──────────────────────────────── */}
                    <div className="toolbar">
                        <div className="toolbar-filters">
                            <div className="position-relative search-input-wrapper flex-grow-1">
                                <input
                                    type="text"
                                    className="adm-input w-100"
                                    placeholder="Search promotional campaigns..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {hasActiveFilters && (
                                <button className="btn-ghost" onClick={() => setSearchQuery("")}>
                                    ✕ Reset
                                </button>
                            )}
                        </div>
                        <div className="toolbar-actions">
                            <button className="btn-gold" onClick={handleShowAdd}>
                                <FiPlus size={16} className="me-2" /> Create New Offer
                            </button>
                        </div>
                    </div>

                    {/* ── Products-style Offers Table ──────────────── */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="warning" />
                        </div>
                    ) : (
                        <div className="products-table-wrap">
                            <div className="table-scroll">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Feed Status</th>
                                            <th>#</th>
                                            <th className="text-start">Campaign Details</th>
                                            <th>Claimed / Redeemed</th>
                                            <th>Valid Until</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOffers.map((offer, index) => {
                                            const redeemed = stats[offer.offerText]?.redeemed || 0;
                                            const claimed = stats[offer.offerText]?.claimed || 0;
                                            return (
                                                <tr key={offer.id}>
                                                    <td>
                                                        <div className="d-flex flex-column align-items-center justify-content-center">
                                                            <div className="form-check-adm p-0 m-0 custom-switch-container">
                                                                <input
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    className="form-check-input m-0 custom-toggle-input"
                                                                    id={`display-switch-${offer.id}`}
                                                                    checked={offer.active}
                                                                    onChange={() => handleToggleDisplay(offer.id, offer.active)}
                                                                />
                                                            </div>
                                                            <small className="mt-1 font-monospace" style={{ fontSize: '0.65rem', color: offer.active ? 'var(--gold)' : 'var(--text-muted)' }}>
                                                                {offer.active ? "LIVE FEED" : "HIDDEN"}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{index + 1}</td>
                                                    <td className="text-start">
                                                        <div className="td-name text-gold fw-semibold">{offer.offerText}</div>
                                                        <div className="text-secondary small opacity-75 mt-1" style={{ maxWidth: "340px" }}>
                                                            {offer.description || "No strategic overview written."}
                                                        </div>
                                                    </td>
                                                    <td className="td-price">
                                                        <span className="text-primary">{claimed}</span>
                                                        <span className="mx-1">/</span>
                                                        <span className="text-gold">{redeemed}</span>
                                                    </td>
                                                    <td>
                                                        <span className="ing-badge px-2 py-1">
                                                            {formatDate(offer.validUntil)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <button className="btn-ghost py-1 px-2" onClick={() => handleShowPreview(offer)}>
                                                                <FiEye size={14} className="me-1" /> Preview
                                                            </button>
                                                            <button className="btn-teal py-1 px-2" onClick={() => handleShowEdit(offer)}>
                                                                <FiEdit2 size={13} className="me-1" /> Edit
                                                            </button>
                                                            <button className="btn-gold-outline py-1 px-2" onClick={() => fetchRedemptions(offer)} style={{ fontSize: "0.78rem" }}>
                                                                <FiUsers size={14} className="me-1" /> Customers
                                                            </button>
                                                            <button className="btn-danger-sm py-1 px-2" onClick={() => handleDelete(offer.id)}>
                                                                <FiTrash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredOffers.length === 0 && (
                                            <tr className="empty-state">
                                                <td colSpan={6}>No matching promotional offers documented.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    )}

                </div>
            </div>

            {/* ── MODAL: Design Voucher Preview ───────────────── */}
            <Modal className="vh-100" show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Design Voucher Configuration</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center align-items-center py-4 bg-base-darkened voucher-preview-body">
                    <div className="voucher-preview-scaler">
                        {getPreviewComponent()}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-gold w-100" onClick={() => setShowPreviewModal(false)}>
                        Dismiss Design Screen
                    </button>
                </Modal.Footer>
            </Modal>

            {/* ── MODAL: Add/Edit Offer Component ────────────── */}
            <Modal show={showOfferModal} onHide={() => setShowOfferModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Modify Campaign Layout" : "Configure New Marketing Campaign"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label-adm">Voucher Template *</label>
                            <select
                                className="adm-select w-100"
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                            >
                                {Object.keys(VOUCHER_TEMPLATES).map((key) => (
                                    <option key={key} value={key}>
                                        {VOUCHER_TEMPLATES[key].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label-adm">Offer Title / Core Text *</label>
                            <input
                                type="text"
                                className="form-control-adm"
                                placeholder="e.g., 20% Off flat discount on Bakery Goods"
                                value={newOfferTitle}
                                onChange={(e) => setNewOfferTitle(e.target.value)}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label-adm">Strategic Campaign Description *</label>
                            <textarea
                                className="form-control-adm"
                                rows={4}
                                placeholder="Detail structural rules, limits or customer eligibility guidelines..."
                                value={newOfferDescription}
                                onChange={(e) => setNewOfferDescription(e.target.value)}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label-adm">Maturity / Validity Deadline *</label>
                            <input
                                type="date"
                                className="form-control-adm"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowOfferModal(false)}>
                        Cancel
                    </button>
                    <button className="btn-gold" onClick={handleSaveOffer}>
                        {isEditing ? "Save Campaign Variables" : "Push Offer Live"}
                    </button>
                </Modal.Footer>
            </Modal>

            {/* ── MODAL: Redemptions Customer Breakdown ─────────── */}
            <Modal show={showRedemptionModal} onHide={() => setShowRedemptionModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Redemption Registries: <span className="text-gold">{viewingOffer?.offerText}</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className="redemption-modal-body">
                    <div className="toolbar align-items-center mb-4">
                        <div className="toolbar-filters m-0">
                            <input
                                type="text"
                                className="adm-input"
                                placeholder="Filter ledger by name, code..."
                                value={customerSearchQuery}
                                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                style={{ minWidth: "260px" }}
                            />
                            <select
                                className="adm-select"
                                value={claimFilter}
                                onChange={(e) => setClaimFilter(e.target.value)}
                            >
                                <option value="all">Filter Claim Status: All</option>
                                <option value="claimed">State: Claimed Only</option>
                                <option value="pending">State: Pending Collection</option>
                            </select>
                        </div>
                        <div className="toolbar-actions">
                            <button
                                className="btn-gold"
                                onClick={exportToExcel}
                                disabled={filteredCustomers.length === 0}
                                style={{ background: "var(--teal) !important", color: "var(--bg-base) !important" }}
                            >
                                <FiDownload size={15} className="me-2" /> Extract Sheet ({filteredCustomers.length})
                            </button>
                        </div>
                    </div>

                    {loadingRedemptions ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
                    ) : filteredCustomers.length > 0 ? (
                        <div className="products-table-wrap border-0">
                            <div className="table-scroll">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Claim Swapped</th>
                                            <th>Security Token</th>
                                            <th className="text-start">Beneficiary Name</th>
                                            <th>Contact Channel</th>
                                            <th className="text-start">Demographic Address</th>
                                            <th>Timestamp</th>
                                            <th>Ledger Adjustment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCustomers.map((r) => (
                                            <tr key={r.id}>
                                                <td>
                                                    <div className="custom-switch-container">
                                                        <input
                                                            type="checkbox"
                                                            role="switch"
                                                            className="custom-toggle-input"
                                                            checked={r.claimed || false}
                                                            onChange={() => handleToggleClaimed(r.id, r.claimed, r.offerText)}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="brand-badge font-monospace px-3 py-1 bg-dark" style={{ borderColor: 'var(--border-gold)', color: 'var(--gold-light)' }}>
                                                        {r.securityCode || "VOID"}
                                                    </span>
                                                </td>
                                                <td className="td-name text-start">{r.customerName}</td>
                                                <td className="font-monospace">{r.customerPhone}</td>
                                                <td className="text-start td-address">{r.customerAddress}</td>
                                                <td style={{ fontSize: "0.8rem" }}>{r.redeemedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || "N/A"}</td>
                                                <td>
                                                    <button className="btn-danger-sm py-1 px-2" onClick={() => handleDeleteRedemption(r.id, r.claimed, r.offerText)}>
                                                        Remove Record
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted small">No target customer redemptions match selection criteria.</div>
                    )}
                </Modal.Body>
            </Modal>

            {/* ── MODAL: Centralized Action Confirmation System ── */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="md" className="confirm-action-modal">
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger-custom d-flex align-items-center">
                        <FiAlertCircle className="me-2" size={20} /> {confirmConfig.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="m-0 confirm-modal-text">{confirmConfig.message}</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </button>
                    <button className="btn-danger-action" onClick={confirmConfig.onConfirm}>
                        Confirm Delete
                    </button>
                </Modal.Footer>
            </Modal>

            {/* ── Centralized System Feedback Notification Toast ── */}
            {showToast && (
                <div className="adm-toast">
                    <span><FiAlertCircle size={16} className="me-2" /> {toastMsg}</span>
                    <button className="toast-close" onClick={() => setShowToast(false)}>
                        <FiX size={14} />
                    </button>
                </div>
            )}
        </>
    );
};

export default AdminOffers;