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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
  });

  // Fetch Products
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch Categories
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    setCategories(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

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
    await addDoc(collection(db, "categories"), { name: newCategory.trim() });
    setNewCategory("");
    setShowAddCategoryModal(false);
    fetchCategories();
  };

  return (
    <>
      <AppNavbar />
      <div
        className="min-vh-100 bg-dark text-light py-5 px-4"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="container">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-warning">De Bakers & More - Menu Admin Dashboard</h2>
            <div className="d-flex gap-2">
              <Button
                variant="outline-warning"
                className="fw-semibold shadow-sm"
                onClick={() => setShowAddCategoryModal(true)}
              >
                + Add Category
              </Button>
              <Button
                variant="warning"
                className="fw-semibold shadow-sm"
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
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, index) => (
                  <tr key={prod.id} className="align-middle">
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">{prod.name}</td>
                    <td className="text-center">{prod.category}</td>
                    <td className="text-center">
                      {prod.weight ? (
                        <>
                          {prod.weight}
                          <span className="text-warning"> gm</span>
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
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
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
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="text-warning fw-semibold">Weight (grams)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="500"
                      className="bg-dark text-light border-warning"
                      value={newProduct.weight}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, weight: e.target.value })
                      }
                    />
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
        <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)} centered>
          <Modal.Header closeButton className="bg-dark text-warning">
            <Modal.Title>Add New Category</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            <Form.Group>
              <Form.Label className="text-warning fw-semibold">Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Pastry, Bread, Cookies"
                className="bg-dark text-light border-warning"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </Form.Group>
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
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="text-info fw-semibold">Weight (grams)</Form.Label>
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