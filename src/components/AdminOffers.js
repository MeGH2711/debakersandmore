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
import * as XLSX from "xlsx"; // Added for Excel Export
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminOffers.css";

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // State for tracking voucher counts locally
    const [stats, setStats] = useState({});

    // States for the Create Offer Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOffer, setNewOffer] = useState("");
    const [validUntil, setValidUntil] = useState("");

    const [redemptions, setRedemptions] = useState([]);
    const [showRedemptionModal, setShowRedemptionModal] = useState(false);
    const [loadingRedemptions, setLoadingRedemptions] = useState(false);
    const [viewingOffer, setViewingOffer] = useState(null);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    const navigate = useNavigate();
    const auth = getAuth();

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

    // Fetch offers and calculate voucher stats
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

    // NEW: Function to Export Customer Data to Excel
    const exportToExcel = () => {
        if (filteredCustomers.length === 0) return;

        // Map the filtered data to a clean format for Excel
        const excelData = filteredCustomers.map((r, index) => ({
            "Sr. No.": index + 1,
            "Offer": viewingOffer?.offerText,
            "Customer Name": r.customerName,
            "Phone Number": r.customerPhone,
            "Address": r.customerAddress,
            "Date Generated": r.redeemedAt?.toDate().toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            }) || "N/A",
            "Claimed Status": r.claimed ? "Claimed" : "Pending"
        }));

        // Create Worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Redemptions");

        // Set column widths for better readability
        const wscols = [
            { wch: 8 },  // Sr. No.
            { wch: 25 }, // Offer
            { wch: 20 }, // Name
            { wch: 15 }, // Phone
            { wch: 40 }, // Address
            { wch: 15 }, // Date
            { wch: 12 }  // Status
        ];
        worksheet['!cols'] = wscols;

        // Generate Filename
        const safeOfferName = viewingOffer?.offerText.replace(/[^a-z0-9]/gi, '_');
        const fileName = `${safeOfferName}_Customers.xlsx`;

        // Export file
        XLSX.writeFile(workbook, fileName);
    };

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
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding offer:", error);
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

    const handleToggleClaimed = async (redemptionId, currentStatus, offerText) => {
        try {
            const docRef = doc(db, "redeemed_offers", redemptionId);
            await updateDoc(docRef, { claimed: !currentStatus });

            setRedemptions(prev =>
                prev.map(r => r.id === redemptionId ? { ...r, claimed: !currentStatus } : r)
            );

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
            setStats(prev => {
                const currentRedeemed = prev[offerText]?.redeemed || 0;
                const currentClaimed = prev[offerText]?.claimed || 0;
                return {
                    ...prev,
                    [offerText]: {
                        ...prev[offerText],
                        redeemed: Math.max(0, currentRedeemed - 1),
                        claimed: isClaimed ? Math.max(0, currentClaimed - 1) : currentClaimed
                    }
                };
            });
        } catch (error) {
            console.error("Error deleting redemption:", error);
            alert("Failed to delete record.");
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
                            <Button
                                variant="warning"
                                className="w-100 fw-bold"
                                onClick={() => setShowAddModal(true)}
                            >
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
                                        <th className="text-center">Active</th>
                                        <th className="text-center">Sr. No.</th>
                                        <th className="text-center">Offer</th>
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
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={offer.active}
                                                        onChange={() => handleToggleActive(offer.id, offer.active)}
                                                    />
                                                </td>
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-warning fw-semibold text-center">{offer.offerText}</td>
                                                <td className="text-center fw-bold">
                                                    {claimed} / <span className="text-warning">{redeemed}</span>
                                                </td>
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
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL: Add New Offer */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered contentClassName="bg-dark text-light">
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title className="text-warning">Create New Offer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Offer Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. 20% Off on Haircut"
                                value={newOffer}
                                onChange={(e) => setNewOffer(e.target.value)}
                                className="bg-dark text-light border-secondary focus-warning"
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
                    <Button variant="outline-light" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="warning" className="px-4 fw-bold" onClick={handleAddOffer}>
                        Save Offer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL: View Redemptions (UPDATED WITH EXCEL DOWNLOAD) */}
            <Modal show={showRedemptionModal} onHide={() => setShowRedemptionModal(false)} size="xl" centered contentClassName="bg-dark text-light">
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title>Customer Details: {viewingOffer?.offerText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3 g-2">
                        <Col md={8}>
                            <Form.Control
                                type="text"
                                placeholder="Search by name or phone..."
                                value={customerSearchQuery}
                                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                className="bg-dark text-light border-warning offerSearchBar"
                            />
                        </Col>
                        <Col md={4}>
                            <Button
                                variant="success"
                                className="w-100 fw-bold"
                                onClick={exportToExcel}
                                disabled={filteredCustomers.length === 0}
                            >
                                Download Excel
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
                                        <td>{r.customerName}</td>
                                        <td>{r.customerPhone}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{r.customerAddress}</td>
                                        <td>{r.redeemedAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || "N/A"}</td>
                                        <td className="text-center">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteRedemption(r.id, r.claimed, r.offerText)}
                                            >
                                                Delete Record
                                            </Button>
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