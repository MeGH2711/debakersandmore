import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
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

    const navigate = useNavigate();
    const auth = getAuth();

    // 🔐 Auth check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // 📌 Fetch offers
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

    useEffect(() => {
        fetchOffers();
    }, []);

    // ➕ Add new offer
    const handleAddOffer = async () => {
        if (!newOffer.trim()) return alert("Offer cannot be empty!");

        try {
            const docRef = await addDoc(collection(db, "offers"), {
                offerText: newOffer,
                active: true,
                createdAt: Date.now(),
            });

            setOffers((prev) => [
                ...prev,
                { id: docRef.id, offerText: newOffer, active: true },
            ]);
            setNewOffer("");
        } catch (error) {
            console.error("Error adding offer:", error);
        }
    };

    // 🔄 Toggle active/inactive
    const handleToggleActive = async (id, current) => {
        try {
            const docRef = doc(db, "offers", id);
            await updateDoc(docRef, { active: !current });

            setOffers((prev) =>
                prev.map((o) =>
                    o.id === id ? { ...o, active: !current } : o
                )
            );
        } catch (error) {
            console.error("Error updating offer:", error);
        }
    };

    // 🗑 Delete offer
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this offer?")) return;

        try {
            await deleteDoc(doc(db, "offers", id));
            setOffers((prev) => prev.filter((o) => o.id !== id));
        } catch (error) {
            console.error("Error deleting offer:", error);
        }
    };

    // 🔍 Search filter
    const filteredOffers = offers.filter((o) =>
        o.offerText.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <AppNavbar />
            <div
                className="min-vh-100 bg-dark text-light pt-4 pb-5 px-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                <div className="container-fluid">

                    {/* ➕ Add Offer Section */}
                    <div className="card bg-secondary bg-opacity-25 p-3 mb-4 rounded-4">
                        <Row className="g-3 align-items-center">
                            <Col md={8}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter new offer..."
                                    value={newOffer}
                                    onChange={(e) => setNewOffer(e.target.value)}
                                    className="bg-dark text-light border-warning"
                                />
                            </Col>
                            <Col md={4}>
                                <Button
                                    variant="warning"
                                    className="w-100 fw-semibold"
                                    onClick={handleAddOffer}
                                >
                                    Add Offer
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {/* 🔍 Search */}
                    <Row className="mb-3 g-3">
                        <Col md={6}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Search offers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-dark text-light border-warning offerSearchBar"
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {/* 📋 Offers Table */}
                    <div className="card bg-secondary bg-opacity-25 border-0 shadow p-3 rounded-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="warning" />
                            </div>
                        ) : filteredOffers.length > 0 ? (
                            <Table
                                hover
                                responsive
                                variant="dark"
                                className="align-middle mb-0"
                            >
                                <thead className="text-warning">
                                    <tr>
                                        <th className="text-center">Active</th>
                                        <th className="text-center">Sr. No.</th>
                                        <th className="text-center">Offer</th>
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
                                                    onChange={() =>
                                                        handleToggleActive(offer.id, offer.active)
                                                    }
                                                />
                                            </td>
                                            <td className="text-center">{index + 1}</td>
                                            <td className="text-warning fw-semibold text-center">
                                                {offer.offerText}
                                            </td>

                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-danger w-100"
                                                    onClick={() => handleDelete(offer.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center py-4 mb-0">No offers found.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminOffers;