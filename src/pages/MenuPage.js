import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { Card, Col, Row, Spinner, Container } from "react-bootstrap";
import "./MenuPage.css";
import PublicFooter from "../components/PublicFooter";

function ProductList() {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [sortedCategories, setSortedCategories] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Fetch all products
        const productSnapshot = await getDocs(collection(db, "products"));
        const products = productSnapshot.docs.map((doc) => doc.data());

        // 🔹 Group products by category
        const grouped = products.reduce((acc, item) => {
          const category = item.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});

        // 🔹 Sort products inside each category
        Object.keys(grouped).forEach((cat) => {
          grouped[cat].sort((a, b) => a.price - b.price);
        });

        setProductsByCategory(grouped);

        // 🔹 Fetch and sort categories
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoryData = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        categoryData.sort((a, b) => a.order - b.order);
        setSortedCategories(categoryData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // 🔹 Hide loader once data is fetched
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (key) => {
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  const renderStatus = (status) => {
    if (status === "true" || status === true)
      return <span className="text-success fw-semibold">Available</span>;
    if (status === "false" || status === false)
      return <span className="text-danger fw-semibold">Unavailable</span>;
    if (status === "check")
      return <span className="text-warning fw-semibold">Check for Availability</span>;
    return null;
  };

  return (
    <>
      <div className="product-page">
        <h2 className="heading">Our Delicious Menu</h2>

        <div className="search-wrapper text-center mb-4">
          <input
            type="text"
            className="form-control w-75 mx-auto search-input"
            placeholder="Search for a product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>

        {loading ? (
          <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="text-center">
              <Spinner animation="border" role="status" variant="warning" style={{ width: "4rem", height: "4rem" }}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 fw-semibold">Fetching delicious items...</p>
            </div>
          </Container>
        ) : (
          sortedCategories.map((cat, index) => {
            const category = cat.name;
            if (!productsByCategory[category]) return null;

            // 🔎 Filter products by search text
            const filteredProducts = productsByCategory[category].filter((p) =>
              p.name.toLowerCase().includes(searchQuery)
            );

            // If no match in this category → hide the whole category
            if (filteredProducts.length === 0) return null;

            return (
              <div key={index} className="category-section">
                <h3 className="category-title">{category}</h3>

                {/* ===== Desktop View ===== */}
                <Row className="desktop-view">
                  {filteredProducts.map((p, i) => (
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
                                <strong>{p.measurement === "piece" ? "Units:" : "Weight:"}</strong>{" "}
                                {p.weight} {p.measurement === "piece" ? "piece" : "gm"}
                              </p>

                              {p.ingredients &&
                                p.ingredients.length > 0 &&
                                (Array.isArray(p.ingredients)
                                  ? p.ingredients.join("").trim() !== ""
                                  : p.ingredients.trim() !== "") && (
                                  <p>
                                    <strong>Ingredients:</strong>{" "}
                                    {Array.isArray(p.ingredients) ? p.ingredients.join(", ") : p.ingredients}
                                  </p>
                                )}

                              {p.isOutsourced && p.brandName && (
                                <p>
                                  <strong>Brand:</strong>{" "}
                                  <span className="fw-semibold">{p.brandName}</span>
                                </p>
                              )}

                              <p>
                                <strong>Status:</strong> {renderStatus(p.available)}
                              </p>

                              {p.available === "check" && (
                                <a href="tel:+919879718228" className="btn btn-warning btn-sm w-100 mt-2 fw-bold">
                                  Check for Availability
                                </a>
                              )}
                            </Card.Text>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* ===== Mobile View ===== */}
                <div className="mobile-view">
                  {filteredProducts.map((p, i) => {
                    const key = `${category}-${i}`;
                    const hasIngredients =
                      p.ingredients &&
                      ((Array.isArray(p.ingredients) && p.ingredients.join("").trim() !== "") ||
                        (typeof p.ingredients === "string" && p.ingredients.trim() !== ""));

                    const hasBrand = p.isOutsourced && p.brandName && p.brandName.trim() !== "";

                    const canExpand = hasIngredients || hasBrand;

                    const isExpanded = expandedIndex === key;

                    return (
                      <div
                        key={i}
                        className={`mobile-product-row ${isExpanded ? "expanded" : ""}`}
                        onClick={() => {
                          if (canExpand) toggleExpand(key);
                        }}
                        style={{ cursor: canExpand ? "pointer" : "default" }}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div className="d-flex flex-column">
                            <span className="mobile-product-name">
                              {p.name} ({p.weight} {p.measurement === "piece" ? "piece" : "gm"})
                            </span>
                            <small className="mt-1">
                              {renderStatus(p.available)}
                            </small>
                          </div>

                          <span className="mobile-product-price">₹ {p.price}</span>

                        </div>
                        {p.available === "check" && (
                          <a
                            href="tel:+919879718228"
                            className="btn btn-warning btn-sm mt-2 py-1 fw-bold w-100"
                            onClick={(e) => e.stopPropagation()} // Prevents collapsing the row when clicking button
                          >
                            Check Availability
                          </a>
                        )}
                        {canExpand && isExpanded && (
                          <div className="mobile-ingredients mt-3">
                            {hasIngredients && (
                              <p className="mb-1">
                                <strong>Ingredients:</strong>{" "}
                                {Array.isArray(p.ingredients)
                                  ? p.ingredients.join(", ")
                                  : p.ingredients}
                              </p>
                            )}

                            {hasBrand && (
                              <p className="mb-0">
                                <strong>Brand:</strong>{" "}
                                <span className="fw-semibold">{p.brandName}</span>
                              </p>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <PublicFooter />
    </>
  );
}

export default ProductList;