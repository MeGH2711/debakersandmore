import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Modal, Spinner } from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiTrash2, 
  FiMail, 
  FiPhone, 
  FiUser,
  FiCalendar
} from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css"; // Reuse existing styles for structural tokens
import "./AdminResponses.css"; // New specialized styles

const AdminResponses = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    
    // Modal states for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState(null);

    const navigate = useNavigate();
    const auth = getAuth();

    // Auth check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // Fetch responses
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

    // Toggle reviewed status
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

    // Delete Execution
    const handleDeleteClick = (res) => {
        setSelectedResponse(res);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedResponse) return;
        try {
            await deleteDoc(doc(db, "feedback", selectedResponse.id));
            setResponses((prev) => prev.filter((res) => res.id !== selectedResponse.id));
            setShowDeleteModal(false);
            setSelectedResponse(null);
        } catch (error) {
            console.error("Error deleting response:", error);
        }
    };

    // Filtered + searched responses
    const filteredResponses = responses.filter((res) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            res.name?.toLowerCase().includes(query) ||
            res.phone?.toLowerCase().includes(query) ||
            res.email?.toLowerCase().includes(query) ||
            res.message?.toLowerCase().includes(query);

        if (filterStatus === "reviewed") return res.reviewed && matchesSearch;
        if (filterStatus === "unreviewed") return !res.reviewed && matchesSearch;
        return matchesSearch;
    });

    // Metadata / Statistics calculations
    const totalCount = responses.length;
    const reviewedCount = responses.filter(r => r.reviewed).length;
    const unreviewedCount = totalCount - reviewedCount;

    return (
        <>
            <AdminSidebar />
            <div className="sidebar-page-wrapper pt-4 pb-5 px-4">
                <div className="container-fluid">
                    
                    {/* ── Page Heading ─────────────────────────── */}
                    <div className="mb-4">
                        <h1 className="page-title mb-0">
                            User <span>Responses</span>
                        </h1>
                        <p className="page-subtitle mt-1">
                            Monitor and manage user inquiries, reviews, and dynamic feedback pipelines
                        </p>
                    </div>

                    {/* ── Statistics Display Panels ─────────────── */}
                    <div className="row g-4 mb-5">
                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="stat-card unique-card-products">
                                <div className="stat-card-body">
                                    <div className="stat-content">
                                        <p className="stat-label">Total Submissions</p>
                                        <div className="stat-value">{totalCount}</div>
                                    </div>
                                    <div className="stat-icon-box box-gold">
                                        <FiMessageSquare size={24} />
                                    </div>
                                </div>
                                <div className="stat-card-footer">
                                    <span className="stat-trending-neutral">All historic data metrics</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="stat-card unique-card-categories">
                                <div className="stat-card-body">
                                    <div className="stat-content">
                                        <p className="stat-label">Reviewed</p>
                                        <div className="stat-value text-teal">{reviewedCount}</div>
                                    </div>
                                    <div className="stat-icon-box box-teal">
                                        <FiCheckCircle size={24} />
                                    </div>
                                </div>
                                <div className="stat-card-footer">
                                    <span className="stat-trending-success">
                                        {totalCount > 0 ? `${Math.round((reviewedCount / totalCount) * 100)}% Addressed` : "0% Addressed"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-4">
                            <div className="stat-card unique-card-available">
                                <div className="stat-card-body">
                                    <div className="stat-content">
                                        <p className="stat-label">Pending Action</p>
                                        <div className="stat-value text-warning">{unreviewedCount}</div>
                                    </div>
                                    <div className="stat-icon-box box-amber">
                                        <FiAlertCircle size={24} />
                                    </div>
                                </div>
                                <div className="stat-card-footer">
                                    <span className={unreviewedCount > 0 ? "stat-trending-danger" : "stat-trending-neutral"}>
                                        {unreviewedCount > 0 ? `${unreviewedCount} files require attention` : "Queue cleared"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Controls Toolbar ───────────────────────── */}
                    <div className="toolbar">
                        <div className="toolbar-filters w-100">
                            <div className="search-input-container">
                                <FiSearch className="search-icon-inside" />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone, message..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="adm-input search-input-with-icon"
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="adm-select"
                            >
                                <option value="all">All Statuses</option>
                                <option value="unreviewed">Unreviewed / New</option>
                                <option value="reviewed">Reviewed</option>
                            </select>

                            {(searchQuery || filterStatus !== "all") && (
                                <button
                                    className="btn-ghost"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFilterStatus("all");
                                    }}
                                >
                                    ✕ Reset Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Responses Custom Data Table ─────────────── */}
                    <div className="products-table-wrap">
                        <div className="table-scroll">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="warning" className="mb-2" />
                                    <p className="text-muted small">Loading dynamic database records...</p>
                                </div>
                            ) : filteredResponses.length > 0 ? (
                                <table className="adm-table adaptive-responses-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "80px" }}>Status</th>
                                            <th style={{ width: "60px" }}>#</th>
                                            <th>User Details</th>
                                            <th className="text-start" style={{ width: "35%" }}>Message / Inquiry</th>
                                            <th>Timestamp</th>
                                            <th style={{ width: "100px" }}>Actions</th>
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
                                                    hour12: true,
                                                });
                                            }

                                            return (
                                                <tr key={res.id} className={res.reviewed ? "row-reviewed" : "row-unread"}>
                                                    <td>
                                                        <label className="custom-checkbox-wrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!res.reviewed}
                                                                onChange={() => handleReviewToggle(res.id, res.reviewed)}
                                                            />
                                                            <span className="checkmark-box"></span>
                                                        </label>
                                                    </td>
                                                    <td className="tabular-nums">
                                                        {index + 1}
                                                    </td>
                                                    <td className="text-start">
                                                        <div className="user-profile-stack">
                                                            <div className="user-title">
                                                                <FiUser className="me-1 gold-tint" size={13} />
                                                                {res.name || <span className="td-empty">Anonymous</span>}
                                                            </div>
                                                            {res.email && (
                                                                <div className="user-subtext">
                                                                    <FiMail className="me-1" size={12} /> {res.email}
                                                                </div>
                                                            )}
                                                            {res.phone && (
                                                                <div className="user-subtext">
                                                                    <FiPhone className="me-1" size={12} /> {res.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="text-start message-cell-wrap">
                                                        <div className="message-content-text">
                                                            {res.message || <span className="td-empty">— Empty Message —</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="timestamp-wrapper">
                                                            <div className="date-string">
                                                                <FiCalendar size={12} className="me-1" /> {date}
                                                            </div>
                                                            <div className="time-string">
                                                                <FiClock size={12} className="me-1" /> {time}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-danger-icon"
                                                            title="Delete Record"
                                                            onClick={() => handleDeleteClick(res)}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-5 empty-state-box">
                                    <FiMessageSquare size={40} className="mb-3 opacity-25" />
                                    <p className="mb-0">No matching user submissions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Safe Delete Modal ────────────────────── */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Destroy Response Record</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                        Are you sure you want to permanently delete the submission from{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                            {selectedResponse?.name || "this user"}
                        </strong>
                        ? This administrative action is irreversible.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </button>
                    <button 
                        className="btn-danger-sm" 
                        style={{ padding: "0.45rem 1.1rem" }} 
                        onClick={confirmDelete}
                    >
                        Confirm Delete
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminResponses;