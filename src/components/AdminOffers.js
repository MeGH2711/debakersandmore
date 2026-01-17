import React, { useEffect, useState } from "react";
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
import { db } from "../firebase";
import {
    Table,
    Spinner,
    Form,
    Row,
    Col,
    Button,
    Modal
} from "react-bootstrap";
import AppNavbar from "./Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import VoucherTemplate from "./Vouchers/RepublicDayVoucher"; // Imported the Template
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminOffers.css";

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

    const navigate = useNavigate();
    const auth = getAuth();

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

    const fetchData = async () => {
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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
    };

    const handleShowEdit = (offer) => {
        setIsEditing(true);
        setCurrentOfferId(offer.id);
        setNewOfferTitle(offer.offerText);
        setNewOfferDescription(offer.description || "");
        setValidUntil(offer.validUntil);
        setShowOfferModal(true);
    };

    const handleSaveOffer = async () => {
        if (!newOfferTitle.trim() || !newOfferDescription.trim() || !validUntil) {
            return alert("Please fill in all fields!");
        }

        const offerData = {
            offerText: newOfferTitle,
            description: newOfferDescription,
            validUntil: validUntil,
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

    const handleDeleteRedemption = async (redemptionId, isClaimed, offerText) => {
        if (!window.confirm("Are you sure you want to delete this customer record?")) return;
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
        } catch (error) {
            console.error("Error deleting redemption:", error);
        }
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

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this offer?")) return;
        try {
            await deleteDoc(doc(db, "offers", id));
            setOffers((prev) => prev.filter((o) => o.id !== id));
        } catch (error) {
            console.error("Error deleting offer:", error);
        }
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

    return (
        <>
            <AppNavbar />
            <div className="min-vh-100 bg-dark text-light pt-4 pb-5 px-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                <div className="container-fluid">
                    <Row className="mb-4 align-items-center">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Search offers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-dark text-light border-warning offerSearchBar"
                            />
                        </Col>
                        <Col md={{ span: 3, offset: 3 }}>
                            <Button variant="warning" className="w-100 fw-bold" onClick={handleShowAdd}>
                                + Create New Offer
                            </Button>
                        </Col>
                    </Row>

                    <div className="card bg-secondary bg-opacity-25 border-0 shadow p-3 rounded-4">
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
                        ) : (
                            <Table hover responsive variant="dark" className="align-middle mb-0">
                                <thead className="text-warning">
                                    <tr>
                                        <th className="text-center">Display Status</th>
                                        <th className="text-center">Sr. No.</th>
                                        <th>Offer Details</th>
                                        <th className="text-center">Claimed / Redeemed</th>
                                        <th className="text-center">Valid Until</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOffers.map((offer, index) => {
                                        const redeemed = stats[offer.offerText]?.redeemed || 0;
                                        const claimed = stats[offer.offerText]?.claimed || 0;
                                        return (
                                            <tr key={offer.id}>
                                                <td className="text-center">
                                                    <div className="d-flex flex-column align-items-center">
                                                        <Form.Check
                                                            type="switch"
                                                            id={`display-switch-${offer.id}`}
                                                            checked={offer.active}
                                                            onChange={() => handleToggleDisplay(offer.id, offer.active)}
                                                            className="mb-1"
                                                        />
                                                        <small style={{ fontSize: '0.7rem', color: offer.active ? '#ffc107' : '#6c757d' }}>
                                                            {offer.active ? "DISPLAYING" : "HIDDEN"}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td className="text-center">{index + 1}</td>
                                                <td>
                                                    <div className="text-warning fw-semibold">{offer.offerText}</div>
                                                    <div className="text-light small opacity-75">{offer.description || "No description provided."}</div>
                                                </td>
                                                <td className="text-center fw-bold">
                                                    {claimed} / <span className="text-warning">{redeemed}</span>
                                                </td>
                                                <td className="text-center">{formatDate(offer.validUntil)}</td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <Button variant="outline-info" size="sm" onClick={() => handleShowPreview(offer)}>Preview</Button>
                                                        <Button variant="outline-warning" size="sm" onClick={() => handleShowEdit(offer)}>Edit</Button>
                                                        <Button variant="info" size="sm" onClick={() => fetchRedemptions(offer)}>View Customers</Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleDelete(offer.id)}>Delete</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL: Voucher Preview */}
            <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="md" contentClassName="bg-dark">
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title className="text-warning">Design Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center bg-secondary py-4" style={{ overflow: "hidden" }}>
                    <div className="voucher-modal-wrapper">
                        {previewOffer && (
                            <VoucherTemplate 
                                selectedOffer={previewOffer} 
                                customerData={{ name: "John Doe", phone: "+91 9876543210", securityCode: "SAMPLE" }} 
                                formatDate={formatDate} 
                                getTodayFormatted={getTodayFormatted}
                                isPreview={true} 
                            />
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="warning" onClick={() => setShowPreviewModal(false)}>Close Preview</Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL: Add/Edit Offer */}
            <Modal show={showOfferModal} onHide={() => setShowOfferModal(false)} centered contentClassName="bg-dark text-light">
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title className="text-warning">{isEditing ? "Edit Offer" : "Create New Offer"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Offer Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. 20% Off on Haircut"
                                value={newOfferTitle}
                                onChange={(e) => setNewOfferTitle(e.target.value)}
                                className="bg-dark text-light border-secondary"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Offer Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newOfferDescription}
                                onChange={(e) => setNewOfferDescription(e.target.value)}
                                className="bg-dark text-light border-secondary"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valid Until</Form.Label>
                            <Form.Control
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className="bg-dark text-light border-secondary"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-light" onClick={() => setShowOfferModal(false)}>Cancel</Button>
                    <Button variant="warning" onClick={handleSaveOffer}>{isEditing ? "Update Offer" : "Save Offer"}</Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL: View Redemptions */}
            <Modal show={showRedemptionModal} onHide={() => setShowRedemptionModal(false)} size="xl" centered contentClassName="bg-dark text-light">
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title>Customer Details: {viewingOffer?.offerText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3 g-2">
                        <Col md={5}>
                            <Form.Control
                                type="text"
                                placeholder="Search by name, phone, or code..."
                                value={customerSearchQuery}
                                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                className="bg-dark text-light border-warning offerSearchBar"
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={claimFilter}
                                onChange={(e) => setClaimFilter(e.target.value)}
                                className="bg-dark text-light border-warning"
                            >
                                <option value="all">All Status</option>
                                <option value="claimed">Claimed</option>
                                <option value="pending">Pending</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Button variant="success" className="w-100 fw-bold" onClick={exportToExcel} disabled={filteredCustomers.length === 0}>
                                Download Excel ({filteredCustomers.length})
                            </Button>
                        </Col>
                    </Row>

                    {loadingRedemptions ? (
                        <div className="text-center py-4"><Spinner animation="border" variant="warning" /></div>
                    ) : filteredCustomers.length > 0 ? (
                        <Table hover responsive variant="dark" className="align-middle">
                            <thead className="text-warning">
                                <tr>
                                    <th className="text-center">Claimed</th>
                                    <th className="text-center">Code</th>
                                    <th>Customer Name</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Date Generated</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((r) => (
                                    <tr key={r.id}>
                                        <td className="text-center">
                                            <Form.Check
                                                type="switch"
                                                id={`custom-switch-${r.id}`}
                                                checked={r.claimed || false}
                                                onChange={() => handleToggleClaimed(r.id, r.claimed, r.offerText)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-warning text-dark font-monospace" style={{ fontSize: '0.9rem' }}>
                                                {r.securityCode || "N/A"}
                                            </span>
                                        </td>
                                        <td>{r.customerName}</td>
                                        <td>{r.customerPhone}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{r.customerAddress}</td>
                                        <td>{r.redeemedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || "N/A"}</td>
                                        <td className="text-center">
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRedemption(r.id, r.claimed, r.offerText)}>Delete Record</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="text-center py-3">No matching records found.</p>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminOffers;