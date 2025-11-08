import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Table, Badge, Spinner, Form, Row, Col, InputGroup } from "react-bootstrap";
import AppNavbar from "./Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminResponses.css";

const AdminResponses = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const navigate = useNavigate();
    const auth = getAuth();

    // ✅ Auth check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // ✅ Fetch responses
    const fetchResponses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "feedback"));
            const fetchedData = querySnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            setResponses(fetchedData);
        } catch (error) {
            console.error("Error fetching responses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResponses();
    }, []);

    // ✅ Toggle reviewed status
    const handleReviewToggle = async (id, currentStatus) => {
        try {
            const docRef = doc(db, "feedback", id);
            await updateDoc(docRef, { reviewed: !currentStatus });
            setResponses((prev) =>
                prev.map((res) =>
                    res.id === id ? { ...res, reviewed: !currentStatus } : res
                )
            );
        } catch (error) {
            console.error("Error updating reviewed status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this response?")) {
            try {
                await deleteDoc(doc(db, "feedback", id));
                setResponses((prev) => prev.filter((res) => res.id !== id));
            } catch (error) {
                console.error("Error deleting response:", error);
            }
        }
    };

    // ✅ Filtered + searched responses
    const filteredResponses = responses.filter((res) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            res.name?.toLowerCase().includes(query) ||
            res.phone?.toLowerCase().includes(query);

        if (filterStatus === "reviewed") return res.reviewed && matchesSearch;
        if (filterStatus === "unreviewed") return !res.reviewed && matchesSearch;
        return matchesSearch;
    });

    return (
        <>
            <AppNavbar />
            <div
                className="min-vh-100 bg-dark text-light pt-4 pb-5 px-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                <div className="container-fluid">
                    {/* ✅ Search & Filter Section */}
                    <Row className="mb-4 g-3 align-items-center">
                        <Col md={6} sm={12}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name or phone number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-dark text-light border-warning searchResponse"
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3} sm={6}>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-dark text-light border-warning"
                            >
                                <option value="all">All</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="unreviewed">Unreviewed</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    {/* ✅ Table Section */}
                    <div className="card bg-secondary bg-opacity-25 border-0 shadow p-3 rounded-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="warning" />
                            </div>
                        ) : filteredResponses.length > 0 ? (
                            <Table
                                hover
                                responsive
                                variant="dark"
                                className="align-middle mb-0"
                            >
                                <thead className="text-warning">
                                    <tr>
                                        <th className="text-center text-warning">Reviewed</th>
                                        <th className="text-center text-warning">Sr. No.</th>
                                        <th className="text-center text-warning">Name</th>
                                        <th className="text-center text-warning">Email</th>
                                        <th className="text-center text-warning">Phone</th>
                                        <th className="text-center text-warning">Message</th>
                                        <th className="text-center text-warning">Date</th>
                                        <th className="text-center text-warning">Time</th>
                                        <th className="text-center text-warning">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResponses.map((res, index) => {
                                        let date = "—";
                                        let time = "—";

                                        if (res.timestamp) {
                                            const ts = res.timestamp.seconds
                                                ? new Date(res.timestamp.seconds * 1000)
                                                : new Date(res.timestamp);

                                            date = ts.toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            });

                                            time = ts.toLocaleTimeString("en-IN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                hour12: true,
                                            });
                                        }

                                        return (
                                            <tr key={res.id}>
                                                <td className="text-center">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={res.reviewed === true}
                                                        onChange={() =>
                                                            handleReviewToggle(
                                                                res.id,
                                                                res.reviewed
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-center text-warning fw-semibold">
                                                    {res.name || (
                                                        <Badge bg="secondary">N/A</Badge>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {res.email || (
                                                        <Badge bg="secondary">N/A</Badge>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {res.phone || (
                                                        <Badge bg="secondary">N/A</Badge>
                                                    )}
                                                </td>
                                                <td className="text-center text-warning fw-semibold">
                                                    {res.message || (
                                                        <Badge bg="secondary">N/A</Badge>
                                                    )}
                                                </td>
                                                <td className="text-center">{date}</td>
                                                <td className="text-center">{time}</td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm w-100 btn-danger"
                                                        onClick={() => handleDelete(res.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center py-4 mb-0">
                                No responses found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminResponses;