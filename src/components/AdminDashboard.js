import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Modal, Button, Form, Table, Badge } from "react-bootstrap";
import AppNavbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RxDragHandleDots1 } from "react-icons/rx";

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

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    weight: "",
    ingredients: "",
    measurement: "gm",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Fetch Products
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch Categories
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const cats = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // sort categories by order
    cats.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCategories(cats);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "" || prod.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Add Product
  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.weight
    )
      return alert("Please fill all fields!");

    const ingredientsArray = newProduct.ingredients
      ? newProduct.ingredients.split(",").map((i) => i.trim())
      : [];

    await addDoc(collection(db, "products"), {
      ...newProduct,
      ingredients: ingredientsArray,
      available: true,
    });

    setShowAddModal(false);
    setNewProduct({ name: "", price: "", category: "", weight: "", ingredients: "" });
    fetchProducts();
  };

  // Edit Product
  const handleEditProduct = async () => {
    const productRef = doc(db, "products", selectedProduct.id);
    const ingredientsArray = selectedProduct.ingredients
      ? selectedProduct.ingredients.split(",").map((i) => i.trim())
      : [];
    await updateDoc(productRef, {
      ...selectedProduct,
      ingredients: ingredientsArray,
      available: selectedProduct.available,
    });
    setShowEditModal(false);
    fetchProducts();
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

  const [newCategoryOrder, setNewCategoryOrder] = useState("");

  return (
    <>
      <AppNavbar />
      <div
        className="min-vh-100 bg-dark text-light pt-4 pb-5 px-4"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="container-fluid">
          {/* Header */}
          <div className="header-controls mb-4">
            <div className="filters-section d-flex flex-wrap gap-3 align-items-center">
              {/* Search Input */}
              <Form.Control
                type="text"
                placeholder="Search by product name..."
                className="bg-dark text-light border-warning custom-input flex-grow-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Category Filter */}
              <Form.Select
                className="bg-dark text-light border-warning custom-select flex-grow-1"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>

              {/* Reset Button */}
              {(searchTerm || filterCategory) && (
                <Button
                  variant="outline-light"
                  size="sm"
                  className="reset-btn fw-semibold"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("");
                  }}
                >
                  Reset
                </Button>
              )}
            </div>

            <div className="action-buttons d-flex flex-wrap gap-2 mt-3 mt-md-0">
              <Button
                variant="outline-warning"
                className="fw-semibold shadow-sm w-100 w-auto"
                onClick={() => setShowAddCategoryModal(true)}
              >
                + Add Category
              </Button>
              <Button
                variant="warning"
                className="fw-semibold shadow-sm w-100 w-auto"
                onClick={() => setShowAddModal(true)}
              >
                + Add Product
              </Button>
            </div>
          </div>

          {/* Product Table */}
          <div className="card bg-secondary bg-opacity-25 border-0 shadow p-3 rounded-4">
            <Table hover responsive variant="dark" className="align-middle mb-0">
              <thead className="text-warning">
                <tr>
                  <th className="text-center">Sr. No.</th>
                  <th className="text-center">Product Name</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Weight</th>
                  <th className="text-center">Ingredients</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Availability</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod, index) => (
                  <tr key={prod.id} className="align-middle">
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{prod.name}</td>
                    <td className="text-center">{prod.category}</td>
                    <td className="text-center">
                      {prod.weight ? (
                        <>
                          {prod.weight}
                          <span className="text-warning">
                            {" "}{prod.measurement === "piece" ? "piece" : "gm"}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {prod.ingredients && prod.ingredients.length > 0 ? (
                        prod.ingredients.map((ing, i) => (
                          <Badge
                            bg="warning"
                            text="dark"
                            className="me-1 mb-1 rounded-pill px-2 py-1"
                            key={i}
                          >
                            {ing}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      {prod.price ? (
                        <>
                          <span className="text-warning">₹ </span>
                          {prod.price}
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={prod.available}
                        onChange={async () => {
                          const productRef = doc(db, "products", prod.id);
                          await updateDoc(productRef, { available: !prod.available });
                          fetchProducts();
                        }}
                        label={
                          prod.available ? (
                            <span className="text-success fw-semibold">Available</span>
                          ) : (
                            <span className="text-danger fw-semibold">Unavailable</span>
                          )
                        }
                        className=""
                      />
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="px-4 my-1 mx-2"
                        onClick={() => {
                          const ingredientsStr = Array.isArray(prod.ingredients)
                            ? prod.ingredients.join(", ")
                            : prod.ingredients || "";
                          setSelectedProduct({ ...prod, ingredients: ingredientsStr });
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="px-4 my-1 mx-2"
                        onClick={() => {
                          setSelectedProduct(prod);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No products added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Add Product Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
          <Modal.Header closeButton className="bg-dark text-warning">
            <Modal.Title className="fw-semibold">
              <i className="bi bi-plus-circle me-2"></i>Add New Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light px-4 py-3">
            <Form>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Chocolate Cake"
                      className="bg-dark text-light border-warning"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">Category</Form.Label>
                    <Form.Select
                      className="bg-dark text-light border-warning"
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
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g. 500 or 1"
                      className="bg-dark text-light border-warning"
                      value={newProduct.weight}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, weight: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>

                <div className="col-md-2">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">Measurement</Form.Label>
                    <Form.Select
                      className="bg-dark text-light border-warning"
                      value={newProduct.measurement}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, measurement: e.target.value })
                      }
                    >
                      <option value="gm">gm</option>
                      <option value="piece">piece</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="499"
                      className="bg-dark text-light border-warning"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-12">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">
                      Ingredients (comma-separated)
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Flour, Butter, Sugar, Cocoa"
                      className="bg-dark text-light border-warning"
                      value={newProduct.ingredients}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, ingredients: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-top d-flex justify-content-between">
            <Button
              variant="outline-light"
              className="fw-semibold px-4"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              className="fw-semibold px-4 shadow-sm"
              onClick={handleAddProduct}
            >
              <i className="bi bi-plus-lg me-2"></i>Add Product
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Category Modal */}
        <Modal size="xl" show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)} centered>
          <Modal.Header closeButton className="bg-dark text-warning">
            <Modal.Title>Add New Category</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            <div className="row">
              {/* Left Side — Input Fields */}
              <div className="col-md-6 border-end border-warning">
                <Form.Group className="mb-3">
                  <Form.Label className="text-warning fw-semibold">Category Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Pastry, Bread, Cookies"
                    className="bg-dark text-light border-warning"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-warning fw-semibold">Category Order</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 1, 2, 3..."
                    className="bg-dark text-light border-warning"
                    value={newCategoryOrder}
                    onChange={(e) => setNewCategoryOrder(e.target.value)}
                  />
                </Form.Group>
              </div>

              {/* Right Side — Category List */}
              <div className="col-md-6">
                <h6 className="text-warning fw-semibold mb-2">Existing Categories</h6>
                {categories.length > 0 ? (
                  <DragDropContext
                    onDragEnd={async (result) => {
                      if (!result.destination) return;

                      const reordered = Array.from(categories);
                      const [moved] = reordered.splice(result.source.index, 1);
                      reordered.splice(result.destination.index, 0, moved);

                      setCategories(reordered);

                      // Update Firestore order
                      for (let i = 0; i < reordered.length; i++) {
                        const catRef = doc(db, "categories", reordered[i].id);
                        await updateDoc(catRef, { order: i + 1 });
                      }
                    }}
                  >
                    <Droppable droppableId="categories">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {categories.map((cat, index) => (
                            <Draggable key={cat.id} draggableId={cat.id} index={index}>
                              {(provided) => (
                                <div
                                  className="d-flex align-items-center justify-content-between mb-2 bg-dark text-light p-2 rounded border border-warning"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <div className="d-flex align-items-center">
                                    {/* Drag handle icon using React Icon */}
                                    <span
                                      {...provided.dragHandleProps}
                                      className="me-2 text-warning"
                                      style={{ cursor: "grab" }}
                                    >
                                      <RxDragHandleDots1 size={20} />
                                    </span>

                                    <span>{cat.name}</span>
                                  </div>

                                  <Badge bg="warning" text="dark">
                                    {index + 1}
                                  </Badge>
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
                  <p className="text-muted mb-0">No categories added yet.</p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-top d-flex justify-content-between">
            <Button variant="outline-light" onClick={() => setShowAddCategoryModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleAddCategory}>
              <i className="bi bi-plus-lg me-2"></i>Add Category
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Product Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton className="bg-dark text-info">
            <Modal.Title className="fw-semibold">Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light px-4 py-3">
            {selectedProduct && (
              <Form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Product Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Chocolate Cake"
                        className="bg-dark text-light border-info"
                        value={selectedProduct.name}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, name: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Category</Form.Label>
                      <Form.Select
                        className="bg-dark text-light border-info"
                        value={selectedProduct.category}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, category: e.target.value })
                        }
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-4">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="500"
                        className="bg-dark text-light border-info"
                        value={selectedProduct.weight}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, weight: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Measurement</Form.Label>
                      <Form.Select
                        className="bg-dark text-light border-info"
                        value={selectedProduct.measurement || "gm"}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, measurement: e.target.value })
                        }
                      >
                        <option value="gm">gm</option>
                        <option value="piece">piece</option>
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="499"
                        className="bg-dark text-light border-info"
                        value={selectedProduct.price}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, price: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Availability</Form.Label>
                      <Form.Select
                        className="bg-dark text-light border-info"
                        value={selectedProduct.available ? "true" : "false"}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            available: e.target.value === "true"
                          })
                        }
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">
                        Ingredients (comma-separated)
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Flour, Butter, Sugar, Cocoa"
                        className="bg-dark text-light border-info"
                        value={selectedProduct.ingredients}
                        onChange={(e) =>
                          setSelectedProduct({ ...selectedProduct, ingredients: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>
                </div>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark border-top d-flex justify-content-between">
            <Button
              variant="outline-light"
              className="fw-semibold px-4"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="info"
              className="fw-semibold px-4 shadow-sm"
              onClick={handleEditProduct}
            >
              <i className="bi bi-save me-2"></i>Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="bg-dark text-light">
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            Are you sure you want to delete{" "}
            <strong>{selectedProduct?.name}</strong>?
          </Modal.Body>
          <Modal.Footer className="bg-dark text-light">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default AdminDashboard;