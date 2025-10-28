import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Table, Badge, Spinner } from "react-bootstrap";
import AppNavbar from "./Navbar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminResponses = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const auth = getAuth();

    // Auth check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    // 📥 Fetch responses
    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "feedback"));
                const fetchedData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setResponses(fetchedData);
            } catch (error) {
                console.error("Error fetching responses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, []);

    return (
        <>
            <AppNavbar />
            <div
                className="min-vh-100 bg-dark text-light py-5 px-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold text-warning">
                            Customer Responses & Feedback
                        </h2>
                    </div>

                    <div className="card bg-secondary bg-opacity-25 border-0 shadow p-3 rounded-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="warning" />
                            </div>
                        ) : responses.length > 0 ? (
                            <Table hover responsive variant="dark" className="align-middle mb-0">
                                <thead className="text-warning">
                                    <tr>
                                        <th className="text-center">Sr. No.</th>
                                        <th className="text-center">Name</th>
                                        <th className="text-center">Email</th>
                                        <th className="text-center">Phone</th>
                                        <th className="text-center">Message</th>
                                        <th className="text-center">Date</th>
                                        <th className="text-center">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map((res, index) => {
                                        let date = "—";
                                        let time = "—";

                                        if (res.timestamp) {
                                            const ts = res.timestamp.seconds
                                                ? new Date(res.timestamp.seconds * 1000)
                                                : new Date(res.timestamp);

                                            // Format Date and Time separately
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
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-center text-warning fw-semibold">
                                                    {res.name || <Badge bg="secondary">N/A</Badge>}
                                                </td>
                                                <td className="text-center">
                                                    {res.email || <Badge bg="secondary">N/A</Badge>}
                                                </td>
                                                <td className="text-center">
                                                    {res.phone || <Badge bg="secondary">N/A</Badge>}
                                                </td>
                                                <td className="text-center text-warning fw-semibold">
                                                    {res.message || <Badge bg="secondary">N/A</Badge>}
                                                </td>
                                                <td className="text-center">{date}</td>
                                                <td className="text-center">{time}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center py-4 mb-0">
                                No responses have been submitted yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminResponses;