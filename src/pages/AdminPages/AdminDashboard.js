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
import "./AdminDashboard.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RxDragHandleDots1 } from "react-icons/rx";
import { FiBox, FiTag, FiCheckCircle } from "react-icons/fi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryOrder, setNewCategoryOrder] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    weight: "",
    ingredients: "",
    measurement: "gm",
    isOutsourced: false,
    brandName: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  // Fetch Products
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    setProducts(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  // Fetch Categories
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const cats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    cats.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCategories(cats);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "" || prod.category === filterCategory;
    const matchesAvailability =
      filterAvailability === "" ||
      prod.available === (filterAvailability === "true");
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Add Product
  const handleAddProduct = async () => {
    if (
      !newProduct.name.trim() ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.weight
    ) {
      triggerToast("Please fill all required fields");
      return;
    }
    if (newProduct.isOutsourced && !newProduct.brandName.trim()) {
      triggerToast("Please fill the brand name for outsourced product");
      return;
    }
    try {
      const ingredientsArray = newProduct.ingredients
        ? newProduct.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
        : [];
      await addDoc(collection(db, "products"), {
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        category: newProduct.category,
        weight: newProduct.weight,
        measurement: newProduct.measurement,
        ingredients: ingredientsArray,
        available: true,
        isOutsourced: newProduct.isOutsourced,
        brandName: newProduct.isOutsourced ? newProduct.brandName.trim() : "",
      });
      setNewProduct({
        name: "",
        price: "",
        category: "",
        weight: "",
        ingredients: "",
        measurement: "gm",
        isOutsourced: false,
        brandName: "",
      });
      setShowAddModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      triggerToast("Something went wrong while adding the product");
    }
  };

  // Edit Product
  const handleEditProduct = async () => {
    if (
      selectedProduct.isOutsourced &&
      (!selectedProduct.brandName || !selectedProduct.brandName.trim())
    ) {
      triggerToast("Please fill the brand name for outsourced product");
      return;
    }
    if (
      !selectedProduct.name.trim() ||
      !selectedProduct.price ||
      !selectedProduct.category ||
      !selectedProduct.weight
    ) {
      triggerToast("Please fill all required fields");
      return;
    }
    try {
      const productRef = doc(db, "products", selectedProduct.id);
      const ingredientsArray = selectedProduct.ingredients
        ? selectedProduct.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
        : [];
      await updateDoc(productRef, {
        name: selectedProduct.name.trim(),
        price: Number(selectedProduct.price) || 0,
        category: selectedProduct.category || "",
        weight: selectedProduct.weight || "",
        measurement: selectedProduct.measurement || "gm",
        ingredients: ingredientsArray,
        available: selectedProduct.available ?? true,
        isOutsourced: !!selectedProduct.isOutsourced,
        brandName: selectedProduct.isOutsourced
          ? selectedProduct.brandName?.trim() || ""
          : "",
      });
      setShowEditModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      triggerToast("Something went wrong while updating the product");
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    await deleteDoc(doc(db, "products", selectedProduct.id));
    setShowDeleteModal(false);
    fetchProducts();
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Enter a valid category name!");
    if (!newCategoryOrder.trim()) return alert("Enter an order number!");
    await addDoc(collection(db, "categories"), {
      name: newCategory.trim(),
      order: parseInt(newCategoryOrder),
    });
    setNewCategory("");
    setNewCategoryOrder("");
    setShowAddCategoryModal(false);
    fetchCategories();
  };

  const hasActiveFilters = searchTerm || filterCategory || filterAvailability;

  return (
    <>
      <AdminSidebar />

      <div className="sidebar-page-wrapper pt-4 pb-5 px-4">
        <div className="container-fluid">

          {/* ── Page Heading ─────────────────────────── */}
          <div className="mb-4">
            <h1 className="page-title mb-0">
              Product <span>Catalogue</span>
            </h1>
            <p className="page-subtitle mt-1">
              Manage your items, categories &amp; availability
            </p>
          </div>

          {/* ── Stats Cards (Redesigned) ─────────────────────────── */}
          <div className="row g-4 mb-5">
            {/* Total Products Card */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="stat-card unique-card-products">
                <div className="stat-card-body">
                  <div className="stat-content">
                    <p className="stat-label">Total Products</p>
                    <div className="stat-value">{products.length}</div>
                  </div>
                  <div className="stat-icon-box box-gold">
                    <FiBox size={24} />
                  </div>
                </div>
                <div className="stat-card-footer">
                  <span className="stat-trending-neutral">Live inventory catalog</span>
                </div>
              </div>
            </div>

            {/* Total Categories Card */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="stat-card unique-card-categories">
                <div className="stat-card-body">
                  <div className="stat-content">
                    <p className="stat-label">Total Categories</p>
                    <div className="stat-value">{categories.length}</div>
                  </div>
                  <div className="stat-icon-box box-teal">
                    <FiTag size={24} />
                  </div>
                </div>
                <div className="stat-card-footer">
                  <span className="stat-trending-neutral">Organized structure</span>
                </div>
              </div>
            </div>

            {/* Available Items Card */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="stat-card unique-card-available">
                <div className="stat-card-body">
                  <div className="stat-content">
                    <p className="stat-label">Available Items</p>
                    <div className="stat-value">
                      {products.filter((p) => p.available === true || p.available === "true").length}
                      <span className="stat-value-sep">/</span>
                      <span className="stat-value-total">{products.length}</span>
                    </div>
                  </div>
                  <div className="stat-icon-box box-amber">
                    <FiCheckCircle size={24} />
                  </div>
                </div>
                <div className="stat-card-footer">
                  <span className="stat-trending-success">
                    {products.length > 0
                      ? `${Math.round((products.filter((p) => p.available === true || p.available === "true").length / products.length) * 100)}% Stock Active`
                      : "0% Stock Active"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Toolbar ──────────────────────────────── */}
          <div className="toolbar">
            <div className="toolbar-filters">
              {/* Search */}
              <input
                type="text"
                className="adm-input"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flexGrow: 1 }}
              />

              {/* Category Filter */}
              <select
                className="adm-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                className="adm-select"
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
              >
                <option value="">All Availability</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("");
                    setFilterAvailability("");
                  }}
                >
                  ✕ Reset
                </button>
              )}
            </div>

            <div className="toolbar-actions">
              <button
                className="btn-gold-outline"
                onClick={() => setShowAddCategoryModal(true)}
              >
                + Category
              </button>
              <button
                className="btn-gold"
                onClick={() => setShowAddModal(true)}
              >
                + Add Product
              </button>
            </div>
          </div>

          {/* ── Product Table ─────────────────────────── */}
          <div className="products-table-wrap">
            <div className="table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Weight</th>
                    <th>Ingredients</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Brand</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod, index) => {
                    return (
                      <tr key={prod.id}>
                        <td style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                          {index + 1}
                        </td>
                        <td className="td-name">{prod.name}</td>
                        <td>{prod.category}</td>
                        <td>
                          {prod.weight ? (
                            <>
                              {prod.weight}{" "}
                              <span style={{ color: "var(--gold)", fontSize: "0.78rem" }}>
                                {prod.measurement === "piece" ? "pc" : "gm"}
                              </span>
                            </>
                          ) : (
                            <span className="td-empty">—</span>
                          )}
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          {prod.ingredients && prod.ingredients.length > 0 ? (
                            prod.ingredients.map((ing, i) => (
                              <span className="ing-badge" key={i}>
                                {ing}
                              </span>
                            ))
                          ) : (
                            <span className="td-empty">—</span>
                          )}
                        </td>
                        <td className="td-price">
                          {prod.price ? (
                            <>₹{prod.price}</>
                          ) : (
                            <span className="td-empty">—</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="avail-select"
                            value={String(prod.available)}
                            onChange={async (e) => {
                              const productRef = doc(db, "products", prod.id);
                              await updateDoc(productRef, {
                                available: e.target.value,
                              });
                              fetchProducts();
                            }}
                          >
                            <option value="true">Available</option>
                            <option value="false">Unavailable</option>
                            <option value="check">Check</option>
                          </select>
                        </td>
                        <td>
                          {prod.isOutsourced ? (
                            <span className="brand-badge">
                              {prod.brandName || "Other Brand"}
                            </span>
                          ) : (
                            <span className="inhouse-tag">In-house</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                            <button
                              className="btn-teal"
                              onClick={() => {
                                const ingredientsStr = Array.isArray(prod.ingredients)
                                  ? prod.ingredients.join(", ")
                                  : prod.ingredients || "";
                                setSelectedProduct({
                                  ...prod,
                                  ingredients: ingredientsStr,
                                });
                                setShowEditModal(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-danger-sm"
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr className="empty-state">
                      <td colSpan={9}>No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MODALS
        ══════════════════════════════════════════ */}

        {/* ── Add Product Modal ─────────────────────── */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-adm">Product Name *</label>
                <input
                  type="text"
                  className="form-control-adm"
                  placeholder="e.g. Chocolate Cake"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-adm">Category *</label>
                <select
                  className="form-select-adm"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-adm">Quantity *</label>
                <input
                  type="number"
                  className="form-control-adm"
                  placeholder="e.g. 500"
                  value={newProduct.weight}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, weight: e.target.value })
                  }
                />
              </div>
              <div className="col-md-2">
                <label className="form-label-adm">Unit</label>
                <select
                  className="form-select-adm"
                  value={newProduct.measurement}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      measurement: e.target.value,
                    })
                  }
                >
                  <option value="gm">gm</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label-adm">Price (₹) *</label>
                <input
                  type="number"
                  className="form-control-adm"
                  placeholder="499"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label-adm">
                  Ingredients (comma-separated)
                </label>
                <textarea
                  className="form-control-adm"
                  rows={2}
                  placeholder="Flour, Butter, Sugar, Cocoa"
                  value={newProduct.ingredients}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      ingredients: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-check-adm">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={newProduct.isOutsourced}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        isOutsourced: e.target.checked,
                        brandName: e.target.checked ? newProduct.brandName : "",
                      })
                    }
                  />
                  <span className="form-check-label">
                    This product is from another brand (Outsourced)
                  </span>
                </label>
              </div>
              {newProduct.isOutsourced && (
                <div className="col-12">
                  <label className="form-label-adm">Brand Name *</label>
                  <input
                    type="text"
                    className="form-control-adm"
                    placeholder="e.g. Britannia, Amul, Cadbury"
                    value={newProduct.brandName}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        brandName: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn-ghost"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button className="btn-gold" onClick={handleAddProduct}>
              + Add Product
            </button>
          </Modal.Footer>
        </Modal>

        {/* ── Add Category Modal ────────────────────── */}
        <Modal
          size="xl"
          show={showAddCategoryModal}
          onHide={() => setShowAddCategoryModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Manage Categories</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-4">
              {/* Left — Inputs */}
              <div className="col-md-5 modal-section-border">
                <p
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  Add New Category
                </p>
                <div className="mb-3">
                  <label className="form-label-adm">Category Name</label>
                  <input
                    type="text"
                    className="form-control-adm"
                    placeholder="e.g. Pastry, Bread, Cookies"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label-adm">Display Order</label>
                  <input
                    type="number"
                    className="form-control-adm"
                    placeholder="e.g. 1, 2, 3…"
                    value={newCategoryOrder}
                    onChange={(e) => setNewCategoryOrder(e.target.value)}
                  />
                </div>
              </div>

              {/* Right — Drag List */}
              <div className="col-md-7">
                <p
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  Existing Categories — drag to reorder
                </p>
                {categories.length > 0 ? (
                  <DragDropContext
                    onDragEnd={async (result) => {
                      if (!result.destination) return;
                      const reordered = Array.from(categories);
                      const [moved] = reordered.splice(result.source.index, 1);
                      reordered.splice(result.destination.index, 0, moved);
                      setCategories(reordered);
                      for (let i = 0; i < reordered.length; i++) {
                        const catRef = doc(db, "categories", reordered[i].id);
                        await updateDoc(catRef, { order: i + 1 });
                      }
                    }}
                  >
                    <Droppable droppableId="categories">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {categories.map((cat, index) => (
                            <Draggable
                              key={cat.id}
                              draggableId={cat.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  className="cat-drag-item"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      {...provided.dragHandleProps}
                                      className="cat-drag-handle"
                                    >
                                      <RxDragHandleDots1 size={18} />
                                    </span>
                                    <span className="cat-order-badge">
                                      {index + 1}
                                    </span>
                                    <span className="cat-name">{cat.name}</span>
                                  </div>
                                  <button
                                    className="btn-danger-sm"
                                    onClick={async () => {
                                      if (
                                        !window.confirm(
                                          `Delete category '${cat.name}'?`
                                        )
                                      )
                                        return;
                                      await deleteDoc(
                                        doc(db, "categories", cat.id)
                                      );
                                      fetchCategories();
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    No categories added yet.
                  </p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn-ghost"
              onClick={() => setShowAddCategoryModal(false)}
            >
              Cancel
            </button>
            <button className="btn-gold" onClick={handleAddCategory}>
              + Add Category
            </button>
          </Modal.Footer>
        </Modal>

        {/* ── Edit Product Modal ────────────────────── */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label-adm">Product Name *</label>
                  <input
                    type="text"
                    className="form-control-adm"
                    placeholder="Chocolate Cake"
                    value={selectedProduct.name}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-adm">Category *</label>
                  <select
                    className="form-select-adm"
                    value={selectedProduct.category}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label-adm">Quantity *</label>
                  <input
                    type="number"
                    className="form-control-adm"
                    placeholder="500"
                    value={selectedProduct.weight}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        weight: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label-adm">Unit</label>
                  <select
                    className="form-select-adm"
                    value={selectedProduct.measurement || "gm"}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        measurement: e.target.value,
                      })
                    }
                  >
                    <option value="gm">gm</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-adm">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control-adm"
                    placeholder="499"
                    value={selectedProduct.price}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-adm">Availability</label>
                  <select
                    className="form-select-adm"
                    value={String(selectedProduct.available)}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        available: e.target.value,
                      })
                    }
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                    <option value="check">Check for Availability</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label-adm">
                    Ingredients (comma-separated)
                  </label>
                  <textarea
                    className="form-control-adm"
                    rows={2}
                    placeholder="Flour, Butter, Sugar, Cocoa"
                    value={selectedProduct.ingredients}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        ingredients: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="form-check-adm">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedProduct.isOutsourced || false}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          isOutsourced: e.target.checked,
                          brandName: e.target.checked
                            ? selectedProduct.brandName
                            : "",
                        })
                      }
                    />
                    <span className="form-check-label">
                      This product is from another brand (Outsourced)
                    </span>
                  </label>
                </div>
                {selectedProduct.isOutsourced && (
                  <div className="col-12">
                    <label className="form-label-adm">Brand Name *</label>
                    <input
                      type="text"
                      className="form-control-adm"
                      placeholder="Brand name"
                      value={selectedProduct.brandName || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          brandName: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn-ghost"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button className="btn-teal" onClick={handleEditProduct}>
              Save Changes
            </button>
          </Modal.Footer>
        </Modal>

        {/* ── Delete Confirmation Modal ─────────────── */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {selectedProduct?.name}
              </strong>
              ? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn-ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button className="btn-danger-sm" onClick={handleDeleteProduct}
              style={{ padding: "0.45rem 1.1rem" }}
            >
              Delete
            </button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* ── Toast ────────────────────────────────────── */}
      {showToast && (
        <div className="adm-toast">
          <span>⚠ {toastMsg}</span>
          <button
            className="toast-close"
            onClick={() => setShowToast(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
