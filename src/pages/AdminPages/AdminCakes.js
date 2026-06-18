import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Modal } from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminCakes.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FiImage, FiPlus, FiTrash2, FiEdit2, FiFolder, FiCheck, FiX } from "react-icons/fi";
import { LuCakeSlice } from "react-icons/lu";

/* ─── Availability badge helper ─── */
function AvailBadge({ status }) {
    if (status === true || status === "true")
        return <span className="ac-badge ac-badge--avail">Available</span>;
    if (status === false || status === "false")
        return <span className="ac-badge ac-badge--unavail">Unavailable</span>;
    if (status === "check")
        return <span className="ac-badge ac-badge--check">On Request</span>;
    return null;
}

/* ─── Empty variation row ─── */
const emptyVariation = () => ({ weight: "", price: "" });

/* ─── Blank cake form ─── */
const blankCake = {
    name: "",
    available: "true",
    photoId: "",
    category: "",
    unitType: "weight", // "weight" (grams) | "quantity" (pcs)
    variations: [emptyVariation()],
};

/* ─────────────────────────────────────────────────────────────
   VariationRows & CakeFormBody are defined OUTSIDE AdminCakes.
   Defining them inside would create a new component type on
   every render, causing React to unmount/remount them and
   making every input lose focus after a single keystroke.
───────────────────────────────────────────────────────────── */

/* ─── Variation rows sub-form ───
   unitType controls whether the first column represents
   weight (gm) or quantity (pcs). The underlying field name
   stored on each variation stays "weight" for both cases —
   only the label and placeholder change — so existing data
   and downstream code (price range calc, etc.) keep working. */
function VariationRows({ variations, onAdd, onRemove, onUpdate, unitType = "weight" }) {
    const isQty = unitType === "quantity";
    const colLabel = isQty ? "Quantity (pcs)" : "Weight (gm)";
    const placeholder = isQty ? "6" : "500";

    return (
        <div className="ac-variations-wrap">
            <div className="ac-variations-header">
                <span className="form-label-adm" style={{ margin: 0 }}>
                    {isQty ? "Quantity & Price Variations" : "Weight & Price Variations"}
                </span>
                <button type="button" className="ac-btn-add-var" onClick={onAdd}>
                    <FiPlus size={13} /> Add Row
                </button>
            </div>

            <div className="ac-var-grid-head">
                <span>{colLabel}</span>
                <span>Price (₹)</span>
                <span />
            </div>

            {variations.map((v, i) => (
                <div className="ac-var-row" key={i}>
                    <input
                        type="number"
                        className="form-control-adm"
                        placeholder={placeholder}
                        value={v.weight}
                        onChange={(e) => onUpdate(i, "weight", e.target.value)}
                    />
                    <input
                        type="number"
                        className="form-control-adm"
                        placeholder="650"
                        value={v.price}
                        onChange={(e) => onUpdate(i, "price", e.target.value)}
                    />
                    <button
                        type="button"
                        className="ac-btn-remove-var"
                        onClick={() => onRemove(i)}
                        disabled={variations.length === 1}
                        title="Remove row"
                    >
                        <FiTrash2 size={13} />
                    </button>
                </div>
            ))}
        </div>
    );
}

/* ─── Base path where cake images are stored ─── */
const CAKE_IMG_BASE = "/cakes/";

/* ─── Live image preview for the photoId field ─── */
function PhotoPreview({ photoId }) {
    const [status, setStatus] = useState("loading"); // "loading" | "ok" | "error"
    const src = `${CAKE_IMG_BASE}${photoId}`;

    // Reset whenever the photoId changes
    useEffect(() => { setStatus("loading"); }, [photoId]);

    return (
        <div className="ac-img-preview-wrap">
            {status === "loading" && (
                <div className="ac-img-preview-placeholder">
                    <FiImage size={22} style={{ opacity: 0.35 }} />
                </div>
            )}
            {status === "error" && (
                <div className="ac-img-preview-placeholder ac-img-preview-error">
                    <FiImage size={18} style={{ marginBottom: 4 }} />
                    <span>Image not found</span>
                    <code>{src}</code>
                </div>
            )}
            <img
                src={src}
                alt="Cake preview"
                className="ac-img-preview"
                style={{ display: status === "ok" ? "block" : "none" }}
                onLoad={() => setStatus("ok")}
                onError={() => setStatus("error")}
            />
        </div>
    );
}

/* ─── Full cake form used in both Add and Edit modals ─── */
function CakeFormBody({ state, onField, onAddVariation, onRemoveVariation, onUpdateVariation, categories }) {
    return (
        <div className="row g-3">
            {/* Name */}
            <div className="col-md-6">
                <label className="form-label-adm">Cake Name *</label>
                <input
                    type="text"
                    className="form-control-adm"
                    placeholder="e.g. Classic Black Forest"
                    value={state.name}
                    onChange={(e) => onField("name", e.target.value)}
                />
            </div>

            {/* Category */}
            <div className="col-md-6">
                <label className="form-label-adm">Category</label>
                <select
                    className="form-select-adm"
                    value={state.category || ""}
                    onChange={(e) => onField("category", e.target.value)}
                >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Availability */}
            <div className="col-md-6">
                <label className="form-label-adm">Availability</label>
                <select
                    className="form-select-adm"
                    value={String(state.available)}
                    onChange={(e) => onField("available", e.target.value)}
                >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                    <option value="check">On Request</option>
                </select>
            </div>

            {/* Sold By (unit type) */}
            <div className="col-md-6">
                <label className="form-label-adm">Sold By</label>
                <select
                    className="form-select-adm"
                    value={state.unitType || "weight"}
                    onChange={(e) => onField("unitType", e.target.value)}
                >
                    <option value="weight">Weight (gm)</option>
                    <option value="quantity">Quantity (pcs)</option>
                </select>
            </div>

            {/* Photo ID */}
            <div className="col-12">
                <label className="form-label-adm">Photo ID / Filename</label>
                <div className="ac-photo-id-wrap">
                    <FiImage size={15} className="ac-photo-id-icon" />
                    <input
                        type="text"
                        className="form-control-adm"
                        placeholder="e.g. black-forest.jpg  or  cake_001"
                        value={state.photoId || ""}
                        onChange={(e) => onField("photoId", e.target.value)}
                    />
                </div>
                <p className="ac-field-hint">
                    Enter the filename of the image as stored in your project's assets / public folder.
                    The frontend will resolve the full path from this ID.
                </p>

                {/* ── Live image preview ── */}
                {state.photoId?.trim() && (
                    <PhotoPreview photoId={state.photoId.trim()} />
                )}
            </div>

            {/* Separator */}
            <div className="col-12"><hr className="ac-divider" /></div>

            {/* Variations */}
            <div className="col-12">
                <VariationRows
                    variations={state.variations}
                    onAdd={onAddVariation}
                    onRemove={onRemoveVariation}
                    onUpdate={onUpdateVariation}
                    unitType={state.unitType}
                />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Main page component
═══════════════════════════════════════════════════════════════ */
const AdminCakes = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    /* ── Auth guard ── */
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) navigate("/login");
        });
        return () => unsub();
    }, [auth, navigate]);

    /* ── State ── */
    const [cakes, setCakes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAvail, setFilterAvail] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const [newCake, setNewCake] = useState(blankCake);
    const [editCake, setEditCake] = useState(null);
    const [deleteCake, setDeleteCake] = useState(null);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);

    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    /* ── Helpers ── */
    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
    };

    const fetchCakes = async () => {
        const snap = await getDocs(collection(db, "cakes"));
        setCakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    const fetchCategories = async () => {
        const snap = await getDocs(collection(db, "cakescategories"));
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => { fetchCakes(); fetchCategories(); }, []);

    /* ── Resolve a category id to its display name ── */
    const getCategoryName = (id) => {
        if (!id) return null;
        const found = categories.find((c) => c.id === id);
        return found ? found.name : null;
    };

    /* ── Filtered list ── */
    const filtered = cakes.filter((c) => {
        const matchName = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchAvail =
            filterAvail === "" ||
            String(c.available) === filterAvail;
        const matchCategory =
            filterCategory === "" ||
            String(c.category || "") === filterCategory;
        return matchName && matchAvail && matchCategory;
    });

    /* ─────────────────────────────────────────────────
       Variation callbacks — newCake
    ───────────────────────────────────────────────── */
    const newCakeField = (field, val) =>
        setNewCake((p) => ({ ...p, [field]: val }));
    const newCakeAddVar = () =>
        setNewCake((p) => ({ ...p, variations: [...p.variations, emptyVariation()] }));
    const newCakeRemoveVar = (idx) =>
        setNewCake((p) => ({ ...p, variations: p.variations.filter((_, i) => i !== idx) }));
    const newCakeUpdateVar = (idx, field, val) =>
        setNewCake((p) => {
            const vars = [...p.variations];
            vars[idx] = { ...vars[idx], [field]: val };
            return { ...p, variations: vars };
        });

    /* ─────────────────────────────────────────────────
       Variation callbacks — editCake
    ───────────────────────────────────────────────── */
    const editCakeField = (field, val) =>
        setEditCake((p) => ({ ...p, [field]: val }));
    const editCakeAddVar = () =>
        setEditCake((p) => ({ ...p, variations: [...p.variations, emptyVariation()] }));
    const editCakeRemoveVar = (idx) =>
        setEditCake((p) => ({ ...p, variations: p.variations.filter((_, i) => i !== idx) }));
    const editCakeUpdateVar = (idx, field, val) =>
        setEditCake((p) => {
            const vars = [...p.variations];
            vars[idx] = { ...vars[idx], [field]: val };
            return { ...p, variations: vars };
        });

    /* ─────────────────────────────────────────────────
       CATEGORY MANAGEMENT
    ───────────────────────────────────────────────── */
    const openCategoryModal = () => {
        setNewCategoryName("");
        setEditingCategoryId(null);
        setEditingCategoryName("");
        setDeletingCategoryId(null);
        setShowCategoryModal(true);
    };

    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return triggerToast("Category name is required");
        if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase()))
            return triggerToast("That category already exists");

        try {
            await addDoc(collection(db, "cakescategories"), {
                name,
                createdAt: new Date().toISOString(),
            });
            setNewCategoryName("");
            fetchCategories();
        } catch (err) {
            console.error(err);
            triggerToast("Something went wrong while adding the category");
        }
    };

    const startEditCategory = (cat) => {
        setDeletingCategoryId(null);
        setEditingCategoryId(cat.id);
        setEditingCategoryName(cat.name);
    };

    const cancelEditCategory = () => {
        setEditingCategoryId(null);
        setEditingCategoryName("");
    };

    const saveEditCategory = async () => {
        const name = editingCategoryName.trim();
        if (!name) return triggerToast("Category name is required");
        if (
            categories.some(
                (c) => c.id !== editingCategoryId && c.name.toLowerCase() === name.toLowerCase()
            )
        )
            return triggerToast("That category already exists");

        try {
            await updateDoc(doc(db, "cakescategories", editingCategoryId), { name });
            cancelEditCategory();
            fetchCategories();
        } catch (err) {
            console.error(err);
            triggerToast("Something went wrong while updating the category");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteDoc(doc(db, "cakescategories", id));
            setDeletingCategoryId(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
            triggerToast("Something went wrong while deleting the category");
        }
    };

    /* ─────────────────────────────────────────────────
       ADD
    ───────────────────────────────────────────────── */
    const handleAdd = async () => {
        if (!newCake.name.trim()) return triggerToast("Cake name is required");
        const validVars = newCake.variations.filter(
            (v) => v.weight !== "" && v.price !== ""
        );
        if (validVars.length === 0)
            return triggerToast("Add at least one weight / price variation");

        try {
            await addDoc(collection(db, "cakes"), {
                name: newCake.name.trim(),
                available: newCake.available,
                photoId: newCake.photoId.trim() || null,
                category: newCake.category || null,
                unitType: newCake.unitType || "weight",
                variations: validVars.map((v) => ({
                    weight: Number(v.weight),
                    price: Number(v.price),
                })),
                createdAt: new Date().toISOString(),
            });
            setNewCake(blankCake);
            setShowAddModal(false);
            fetchCakes();
        } catch (err) {
            console.error(err);
            triggerToast("Something went wrong while adding the cake");
        }
    };

    /* ─────────────────────────────────────────────────
       EDIT
    ───────────────────────────────────────────────── */
    const openEdit = (cake) => {
        setEditCake({
            ...cake,
            category: cake.category || "",
            unitType: cake.unitType || "weight",
            variations:
                cake.variations?.map((v) => ({
                    weight: String(v.weight),
                    price: String(v.price),
                })) || [emptyVariation()],
        });
        setShowEditModal(true);
    };

    const handleEdit = async () => {
        if (!editCake.name.trim()) return triggerToast("Cake name is required");
        const validVars = editCake.variations.filter(
            (v) => v.weight !== "" && v.price !== ""
        );
        if (validVars.length === 0)
            return triggerToast("At least one valid variation is required");

        try {
            await updateDoc(doc(db, "cakes", editCake.id), {
                name: editCake.name.trim(),
                available: editCake.available,
                photoId: editCake.photoId?.trim() || null,
                category: editCake.category || null,
                unitType: editCake.unitType || "weight",
                variations: validVars.map((v) => ({
                    weight: Number(v.weight),
                    price: Number(v.price),
                })),
            });
            setShowEditModal(false);
            fetchCakes();
        } catch (err) {
            console.error(err);
            triggerToast("Something went wrong while updating the cake");
        }
    };

    /* ─────────────────────────────────────────────────
       DELETE
    ───────────────────────────────────────────────── */
    const openDelete = (cake) => { setDeleteCake(cake); setShowDeleteModal(true); };

    const handleDelete = async () => {
        await deleteDoc(doc(db, "cakes", deleteCake.id));
        setShowDeleteModal(false);
        fetchCakes();
    };

    /* ─────────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────────── */
    return (
        <>
            <AdminSidebar />

            <div className="sidebar-page-wrapper pt-4 pb-5 px-4">
                <div className="container-fluid">

                    {/* ── Heading ── */}
                    <div className="mb-4 d-flex align-items-start justify-content-between flex-wrap gap-3">
                        <div>
                            <h1 className="page-title mb-0">
                                Cake <span>Catalogue</span>
                            </h1>
                            <p className="page-subtitle mt-1">
                                Manage cake listings, weight / quantity variants &amp; availability
                            </p>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <button className="btn-ghost" onClick={openCategoryModal}>
                                <FiFolder style={{ marginRight: 6 }} />
                                Manage Categories
                            </button>
                            <button className="btn-gold" onClick={() => { setNewCake(blankCake); setShowAddModal(true); }}>
                                <FiPlus style={{ marginRight: 6 }} />
                                Add Cake
                            </button>
                        </div>
                    </div>

                    {/* ── Stats strip ── */}
                    <div className="ac-stats-row mb-4">
                        <div className="ac-stat-pill">
                            <LuCakeSlice size={15} className="ac-stat-icon gold" />
                            <span className="ac-stat-num">{cakes.length}</span>
                            <span className="ac-stat-label">Total Cakes</span>
                        </div>
                        <div className="ac-stat-pill">
                            <FiFolder size={14} className="ac-stat-icon gold" />
                            <span className="ac-stat-num">{categories.length}</span>
                            <span className="ac-stat-label">Categories</span>
                        </div>
                        <div className="ac-stat-pill">
                            <span className="avail-dot avail" />
                            <span className="ac-stat-num">
                                {cakes.filter((c) => c.available === true || c.available === "true").length}
                            </span>
                            <span className="ac-stat-label">Available</span>
                        </div>
                        <div className="ac-stat-pill">
                            <span className="avail-dot check" />
                            <span className="ac-stat-num">
                                {cakes.filter((c) => c.available === "check").length}
                            </span>
                            <span className="ac-stat-label">On Request</span>
                        </div>
                        <div className="ac-stat-pill">
                            <span className="avail-dot unavail" />
                            <span className="ac-stat-num">
                                {cakes.filter((c) => c.available === false || c.available === "false").length}
                            </span>
                            <span className="ac-stat-label">Unavailable</span>
                        </div>
                    </div>

                    {/* ── Toolbar ── */}
                    <div className="toolbar mb-3">
                        <div className="toolbar-filters">
                            <input
                                className="adm-input"
                                placeholder="Search cakes…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="adm-select"
                                value={filterAvail}
                                onChange={(e) => setFilterAvail(e.target.value)}
                            >
                                <option value="">All Availability</option>
                                <option value="true">Available</option>
                                <option value="false">Unavailable</option>
                                <option value="check">On Request</option>
                            </select>
                            <select
                                className="adm-select"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {(searchTerm || filterAvail || filterCategory) && (
                                <button className="btn-ghost" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                                    onClick={() => { setSearchTerm(""); setFilterAvail(""); setFilterCategory(""); }}>
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="ac-result-count">
                            {filtered.length} {filtered.length === 1 ? "cake" : "cakes"}
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="ac-table-wrap">
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 44 }}>#</th>
                                    <th className="text-start">Name</th>
                                    <th>Category</th>
                                    <th>Photo ID</th>
                                    <th>Sold By</th>
                                    <th>Variations</th>
                                    <th>Price Range</th>
                                    <th>Availability</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr className="empty-state">
                                        <td colSpan={9}>No cakes found. Try adjusting your search or add a new cake.</td>
                                    </tr>
                                ) : (
                                    filtered.map((cake, idx) => {
                                        const prices = cake.variations?.map((v) => v.price) || [];
                                        const minP = prices.length ? Math.min(...prices) : null;
                                        const maxP = prices.length ? Math.max(...prices) : null;
                                        const priceStr =
                                            minP === null ? "—"
                                                : minP === maxP ? `₹${minP}`
                                                    : `₹${minP} – ₹${maxP}`;
                                        const isQty = cake.unitType === "quantity";
                                        const unitSuffix = isQty ? " pcs" : "g";

                                        return (
                                            <tr key={cake.id}>
                                                <td className="text-center" style={{ fontSize: "0.78rem" }}>
                                                    {idx + 1}
                                                </td>
                                                <td className="td-name text-start">{cake.name}</td>
                                                <td>
                                                    {getCategoryName(cake.category) ? (
                                                        <span className="ac-cat-chip">{getCategoryName(cake.category)}</span>
                                                    ) : (
                                                        <span className="td-empty">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {cake.photoId ? (
                                                        <span className="ac-photo-chip" title={cake.photoId}>
                                                            <FiImage size={11} />
                                                            {cake.photoId}
                                                        </span>
                                                    ) : (
                                                        <span className="td-empty">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="ac-cat-chip">{isQty ? "Quantity" : "Weight"}</span>
                                                </td>
                                                <td>
                                                    <div className="ac-var-chips">
                                                        {cake.variations?.map((v, i) => (
                                                            <span className="ac-var-chip" key={i}>{v.weight}{unitSuffix}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="td-price">{priceStr}</td>
                                                <td>
                                                    <AvailBadge status={cake.available} />
                                                </td>
                                                <td>
                                                    <div className="ac-action-group">
                                                        <button
                                                            className="ac-btn-icon ac-btn-icon--edit"
                                                            title="Edit cake"
                                                            onClick={() => openEdit(cake)}
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="ac-btn-icon ac-btn-icon--delete"
                                                            title="Delete cake"
                                                            onClick={() => openDelete(cake)}
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
          ADD MODAL
      ══════════════════════════════════════ */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Cake</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CakeFormBody
                        state={newCake}
                        onField={newCakeField}
                        onAddVariation={newCakeAddVar}
                        onRemoveVariation={newCakeRemoveVar}
                        onUpdateVariation={newCakeUpdateVar}
                        categories={categories}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button className="btn-gold" onClick={handleAdd}>Add Cake</button>
                </Modal.Footer>
            </Modal>

            {/* ══════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════ */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Cake</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editCake && (
                        <CakeFormBody
                            state={editCake}
                            onField={editCakeField}
                            onAddVariation={editCakeAddVar}
                            onRemoveVariation={editCakeRemoveVar}
                            onUpdateVariation={editCakeUpdateVar}
                            categories={categories}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button className="btn-gold" onClick={handleEdit}>Save Changes</button>
                </Modal.Footer>
            </Modal>

            {/* ══════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════ */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                        Are you sure you want to delete{" "}
                        <strong style={{ color: "var(--text-primary)" }}>{deleteCake?.name}</strong>?
                        This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button className="btn-danger-sm" style={{ padding: "0.45rem 1.1rem" }} onClick={handleDelete}>
                        Delete
                    </button>
                </Modal.Footer>
            </Modal>

            {/* ══════════════════════════════════════
          MANAGE CATEGORIES MODAL
      ══════════════════════════════════════ */}
            <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Categories</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="ac-cat-add-row">
                        <input
                            type="text"
                            className="form-control-adm"
                            placeholder="e.g. Pastry"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                        />
                        <button type="button" className="ac-btn-add-var" onClick={handleAddCategory}>
                            <FiPlus size={13} /> Add
                        </button>
                    </div>

                    <hr className="ac-divider" style={{ margin: "1rem 0" }} />

                    {categories.length === 0 ? (
                        <p className="ac-field-hint" style={{ textAlign: "center" }}>
                            No categories yet. Add one above — e.g. Cakes, Pastry, Pudding.
                        </p>
                    ) : (
                        <div className="ac-cat-list">
                            {categories.map((cat) => (
                                <div className="ac-cat-list-item" key={cat.id}>
                                    {editingCategoryId === cat.id ? (
                                        <>
                                            <input
                                                type="text"
                                                className="form-control-adm"
                                                value={editingCategoryName}
                                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && saveEditCategory()}
                                                autoFocus
                                            />
                                            <div className="ac-action-group">
                                                <button className="ac-btn-icon ac-btn-icon--edit" title="Save" onClick={saveEditCategory}>
                                                    <FiCheck size={14} />
                                                </button>
                                                <button className="ac-btn-icon" title="Cancel" onClick={cancelEditCategory}>
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        </>
                                    ) : deletingCategoryId === cat.id ? (
                                        <>
                                            <span className="ac-cat-confirm-text">Delete "{cat.name}"?</span>
                                            <div className="ac-action-group">
                                                <button
                                                    className="ac-btn-icon ac-btn-icon--delete"
                                                    title="Confirm delete"
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                >
                                                    <FiCheck size={14} />
                                                </button>
                                                <button className="ac-btn-icon" title="Cancel" onClick={() => setDeletingCategoryId(null)}>
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="ac-cat-name">{cat.name}</span>
                                            <span className="ac-cat-count">
                                                {cakes.filter((c) => c.category === cat.id).length} cakes
                                            </span>
                                            <div className="ac-action-group">
                                                <button className="ac-btn-icon ac-btn-icon--edit" title="Edit" onClick={() => startEditCategory(cat)}>
                                                    <FiEdit2 size={13} />
                                                </button>
                                                <button className="ac-btn-icon ac-btn-icon--delete" title="Delete" onClick={() => setDeletingCategoryId(cat.id)}>
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-ghost" onClick={() => setShowCategoryModal(false)}>Close</button>
                </Modal.Footer>
            </Modal>

            {/* ── Toast ── */}
            {showToast && (
                <div className="adm-toast">
                    <span>⚠ {toastMsg}</span>
                    <button className="toast-close" onClick={() => setShowToast(false)}>✕</button>
                </div>
            )}
        </>
    );
};

export default AdminCakes;