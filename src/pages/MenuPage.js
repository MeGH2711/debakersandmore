import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import "./MenuPage.css";
import PublicFooter from "../components/PublicFooter";

function ProductList() {
  const [productsByCategory, setProductsByCategory] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => doc.data());

      const grouped = data.reduce((acc, item) => {
        const category = item.category || "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});
      setProductsByCategory(grouped);
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="product-page">
        <h2 className="heading">Our Delicious Menu</h2>

        {Object.keys(productsByCategory).map((category, index) => (
          <div key={index} className="category-section">
            <h3 className="category-title">{category}</h3>

            <Row className="desktop-view">
              {productsByCategory[category].map((p, i) => (
                <Col md={4} key={i} className="mb-4">
                  <Card className="product-card h-100">
                    <Card.Body className="product-body d-flex flex-column justify-content-between">
                      <div>
                        <div className="card-header-section">
                          <Card.Title className="product-title">{p.name}</Card.Title>
                          <span className="price-tag">₹ {p.price}</span>
                        </div>

                        <Card.Text as="div" className="product-info mt-3">
                          <p>
                            <strong>Weight:</strong> {p.weight} gm
                          </p>

                          {p.ingredients &&
                            p.ingredients.length > 0 &&
                            (Array.isArray(p.ingredients)
                              ? p.ingredients.join("").trim() !== ""
                              : p.ingredients.trim() !== "") && (
                              <p>
                                <strong>Ingredients:</strong>{" "}
                                {Array.isArray(p.ingredients)
                                  ? p.ingredients.join(", ")
                                  : p.ingredients}
                              </p>
                            )}

                          {/* Availability Info */}
                          <p>
                            <strong>Status:</strong>{" "}
                            {p.available ? (
                              <span className="text-success fw-semibold">Available</span>
                            ) : (
                              <span className="text-danger fw-semibold">Unavailable</span>
                            )}
                          </p>
                        </Card.Text>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Mobile View */}
            <div className="mobile-view">
              {productsByCategory[category].map((p, i) => (
                <div key={i} className="mobile-product-row">
                  <div className="d-flex flex-column">
                    <span className="mobile-product-name">
                      {p.name} ({p.weight} gm)
                    </span>
                    <small
                      className={`${p.available ? "text-success" : "text-danger"
                        } fw-semibold mt-1`}
                    >
                      {p.available ? "Available" : "Unavailable"}
                    </small>
                  </div>
                  <span className="mobile-product-price">₹ {p.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <PublicFooter />
    </>
  );
}

export default ProductList;