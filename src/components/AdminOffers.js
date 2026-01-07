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
    InputGroup,
    Button,
    Modal
} from "react-bootstrap";
import AppNavbar from "./Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminOffers.css";

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newOffer, setNewOffer] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [validUntil, setValidUntil] = useState("");

    const [redemptions, setRedemptions] = useState([]);
    const [showRedemptionModal, setShowRedemptionModal] = useState(false);
    const [loadingRedemptions, setLoadingRedemptions] = useState(false);
    const [viewingOffer, setViewingOffer] = useState(null);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    const navigate = useNavigate();
    const auth = getAuth();

    // Helper function to format YYYY-MM-DD to "13 Jan 2026"
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [year, month, day] = dateString.split("-");
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    const fetchOffers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "offers"));
            const fetchedData = querySnapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
            setOffers(fetchedData);
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
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
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRedemptions(data);
        } catch (error) {
            console.error("Error fetching redemptions:", error);
        } finally {
            setLoadingRedemptions(false);
        }
    };

    const handleToggleClaimed = async (redemptionId, currentStatus) => {
        try {
            const docRef = doc(db, "redeemed_offers", redemptionId);
            await updateDoc(docRef, { claimed: !currentStatus });
            setRedemptions(prev =>
                prev.map(r => r.id === redemptionId ? { ...r, claimed: !currentStatus } : r)
            );
        } catch (error) {
            console.error("Error updating claimed status:", error);
        }
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleAddOffer = async () => {
        if (!newOffer.trim() || !validUntil) return alert("Please fill in both offer text and validity date!");
        try {
            const docRef = await addDoc(collection(db, "offers"), {
                offerText: newOffer,
                validUntil: validUntil,
                active: true,
                createdAt: Date.now(),
            });
            setOffers((prev) => [
                ...prev,
                { id: docRef.id, offerText: newOffer, validUntil, active: true },
            ]);
            setNewOffer("");
            setValidUntil("");
        } catch (error) {
            console.error("Error adding offer:", error);
        }
    };

    const handleToggleActive = async (id, current) => {
        try {
            const docRef = doc(db, "offers", id);
            await updateDoc(docRef, { active: !current });
            setOffers((prev) => prev.map((o) => o.id === id ? { ...o, active: !current } : o));
        } catch (error) {
            console.error("Error updating offer:", error);
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

    const filteredCustomers = redemptions.filter((r) =>
        r.customerName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        r.customerPhone.includes(customerSearchQuery)
    );

    return (
        <>
            <AppNavbar />
            <div className="min-vh-100 bg-dark text-light pt-4 pb-5 px-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                <div className="container-fluid">
                    <div className="card bg-secondary bg-opacity-25 p-3 mb-4 rounded-4">
                        <Row className="g-3 align-items-center">
                            <Col md={5}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter new offer..."
                                    value={newOffer}
                                    onChange={(e) => setNewOffer(e.target.value)}
                                    className="bg-dark text-light border-warning"
                                />
                            </Col>
                            <Col md={4}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-dark text-warning border-warning">Valid Until:</InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        value={validUntil}
                                        onChange={(e) => setValidUntil(e.target.value)}
                                        className="bg-dark text-light border-warning"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Button variant="warning" className="w-100 fw-semibold" onClick={handleAddOffer}>Add Offer</Button>
                            </Col>
                        </Row>
                    </div>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Search offers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-dark text-light border-warning offerSearchBar"
                            />
                        </Col>
                    </Row>

                    <div className="card bg-secondary bg-opacity-25 border-0 shadow p-3 rounded-4">
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>
                        ) : (
                            <Table hover responsive variant="dark" className="align-middle mb-0">
                                <thead className="text-warning">
                                    <tr>
                                        <th className="text-center">Active</th>
                                        <th className="text-center">Sr. No.</th>
                                        <th className="text-center">Offer</th>
                                        <th className="text-center">Valid Until</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOffers.map((offer, index) => (
                                        <tr key={offer.id}>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={offer.active}
                                                    onChange={() => handleToggleActive(offer.id, offer.active)}
                                                />
                                            </td>
                                            <td className="text-center">{index + 1}</td>
                                            <td className="text-warning fw-semibold text-center">{offer.offerText}</td>
                                            {/* Changed display here */}
                                            <td className="text-center">{formatDate(offer.validUntil)}</td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button variant="info" size="sm" onClick={() => fetchRedemptions(offer)}>
                                                        View Customers
                                                    </Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDelete(offer.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showRedemptionModal} onHide={() => setShowRedemptionModal(false)} size="xl" centered contentClassName="bg-dark text-light">
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title>Customer Details: {viewingOffer?.offerText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search by name or phone..."
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            className="bg-dark text-light border-warning"
                        />
                    </div>

                    {loadingRedemptions ? (
                        <div className="text-center py-4"><Spinner animation="border" variant="warning" /></div>
                    ) : filteredCustomers.length > 0 ? (
                        <Table hover responsive variant="dark" className="align-middle">
                            <thead className="text-warning">
                                <tr>
                                    <th className="text-center">Claimed</th>
                                    <th>Customer Name</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Date Generated</th>
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
                                                onChange={() => handleToggleClaimed(r.id, r.claimed)}
                                            />
                                        </td>
                                        <td>{r.customerName}</td>
                                        <td>{r.customerPhone}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{r.customerAddress}</td>
                                        {/* Added formatted date for voucher generation */}
                                        <td>{r.redeemedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || "N/A"}</td>
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