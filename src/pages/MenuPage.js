import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./MenuPage.css";
import PublicFooter from "../components/PublicFooter";

/* ─── Status renderer ─── */
function StatusBadge({ status }) {
  if (status === true || status === "true")
    return <span className="menuPageStatusAvailable">Available</span>;
  if (status === false || status === "false")
    return <span className="menuPageStatusUnavailable">Unavailable</span>;
  if (status === "check")
    return <span className="menuPageStatusCheck">On Request</span>;
  return null;
}

/* ─── Single product card ─── */
function ProductCard({ p }) {
  const hasIngredients =
    p.ingredients &&
    ((Array.isArray(p.ingredients) && p.ingredients.join("").trim() !== "") ||
      (typeof p.ingredients === "string" && p.ingredients.trim() !== ""));

  const hasBrand = p.isOutsourced && p.brandName && p.brandName.trim() !== "";

  return (
    <div className="menuPageMenuProductCard">
      {/* Top row: name + price */}
      <div className="menuPageCardTop">
        <h4 className="menuPageCardName">{p.name}</h4>
        <span className="menuPageCardPrice">₹{p.price}</span>
      </div>

      {/* Weight pill */}
      <span className="menuPageCardWeightPill">
        {p.weight}&nbsp;{p.measurement === "piece" ? "pc" : "gm"}
      </span>

      {/* Ingredients */}
      {hasIngredients && (
        <p className="menuPageCardIngredients">
          <strong>Ingredients - </strong>
          {Array.isArray(p.ingredients)
            ? p.ingredients.join(", ")
            : p.ingredients}
        </p>
      )}

      {/* Brand */}
      {hasBrand && (
        <p className="menuPageCardBrand">
          Brand: <span>{p.brandName}</span>
        </p>
      )}

      {/* Footer: status + CTA */}
      <div className="menuPageCardFooter">
        <StatusBadge status={p.available} />
      </div>

      {p.available === "check" && (
        <a href="tel:+919879718228" className="menuPageCheckAvailBtn">
          Check Availability
        </a>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
function MenuPage() {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [sortedCategories, setSortedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    available: false,
    unavailable: false,
    onRequest: false,
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const categoryRefs = useRef({});

  /* ─── Fetch data ─── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productSnapshot = await getDocs(collection(db, "products"));
        const products = productSnapshot.docs.map((doc) => doc.data());

        const grouped = products.reduce((acc, item) => {
          const category = item.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});

        Object.keys(grouped).forEach((cat) => {
          grouped[cat].sort((a, b) => a.price - b.price);
        });

        setProductsByCategory(grouped);

        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoryData = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        categoryData.sort((a, b) => a.order - b.order);
        setSortedCategories(categoryData);
        if (categoryData.length > 0) setActiveCategory(categoryData[0].name);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ─── Filter logic ─── */
  const anyFilterActive = activeFilters.available || activeFilters.unavailable || activeFilters.onRequest;

  const matchesFilter = (p) => {
    if (!anyFilterActive) return true;
    if (activeFilters.available && (p.available === true || p.available === "true")) return true;
    if (activeFilters.unavailable && (p.available === false || p.available === "false")) return true;
    if (activeFilters.onRequest && p.available === "check") return true;
    return false;
  };

  const getFilteredProducts = (categoryName) => {
    const all = productsByCategory[categoryName] || [];
    return all.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch && matchesFilter(p);
    });
  };

  /* ─── Total visible count ─── */
  const totalVisible = sortedCategories.reduce((sum, cat) => {
    return sum + getFilteredProducts(cat.name).length;
  }, 0);

  /* ─── Scroll to category ─── */
  const scrollToCategory = (catName) => {
    setActiveCategory(catName);
    setSidebarOpen(false);
    const el = categoryRefs.current[catName];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ─── Toggle availability filter ─── */
  const toggleFilter = (key) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="menuPageMenuPage">

      {/* ─── BREADCRUMBS ─── */}
      <nav className="menuPageBreadcrumbs" aria-label="Breadcrumb">
        <Link to="/" className="crumbLink">Home</Link>
        <span className="crumbSeparator">/</span>
        <span className="crumbCurrent" aria-current="page">Menu</span>
      </nav>

      {/* ─── MOBILE FILTER TOGGLE ─── */}
      <button
        className="menuPageMobileFilterToggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-expanded={sidebarOpen}
      >
        <span>Filter &amp; Browse</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>
          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ─── BODY ─── */}
      <div className="menuPageMenuBody">

        {/* ─── SIDEBAR ─── */}
        <aside className={`menuPageMenuSidebar ${sidebarOpen ? "menuPageOpen" : ""}`}>

          {/* Search */}
          <div className="menuPageSidebarSearchWrap">
            <svg className="menuPageSidebarSearchIcon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="menuPageSidebarSearch"
              placeholder="Search menu…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Availability filter */}
          <span className="menuPageSidebarSectionLabel">Availability</span>
          <div className="menuPageSidebarFilterGroup">
            {[
              { key: "available", label: "Available" },
              { key: "unavailable", label: "Unavailable" },
              { key: "onRequest", label: "On Request" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className={`menuPageFilterOption ${activeFilters[key] ? "menuPageActive" : ""}`}
                onClick={() => toggleFilter(key)}
                role="checkbox"
                aria-checked={activeFilters[key]}
              >
                <div className="menuPageFilterCheck">
                  <div className="menuPageFilterCheckTick" />
                </div>
                {label}
              </div>
            ))}
          </div>

          <div className="menuPageSidebarDivider" />

          {/* Category nav */}
          {!loading && (
            <>
              <span className="menuPageSidebarSectionLabel">Categories</span>
              <nav className="menuPageSidebarCatNav">
                {sortedCategories.map((cat) => {
                  const count = getFilteredProducts(cat.name).length;
                  return (
                    <div
                      key={cat.id}
                      className={`menuPageCatNavItem ${activeCategory === cat.name ? "menuPageActive" : ""}`}
                      onClick={() => scrollToCategory(cat.name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && scrollToCategory(cat.name)}
                    >
                      <span>{cat.name}</span>
                      <span className="menuPageCatNavCount">{count}</span>
                    </div>
                  );
                })}
              </nav>
            </>
          )}

          {/* Results summary */}
          {!loading && (
            <div className="menuPageSidebarResultsSummary">
              <div className="menuPageResultsCountNum">{totalVisible}</div>
              <div className="menuPageResultsCountLabel">items shown</div>
            </div>
          )}
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="menuPageMenuContent">
          {loading ? (
            <div className="menuPageMenuLoader">
              <div className="menuPageLoaderRing" />
              <p className="menuPageLoaderText">Fetching delicious items…</p>
            </div>
          ) : totalVisible === 0 ? (
            <div className="menuPageMenuEmpty">
              <p className="menuPageMenuEmptyTitle">Nothing found</p>
              <p className="menuPageMenuEmptySub">Try adjusting your search or filters.</p>
            </div>
          ) : (
            sortedCategories.map((cat) => {
              const filteredProducts = getFilteredProducts(cat.name);
              if (filteredProducts.length === 0) return null;
              return (
                <section
                  key={cat.id}
                  className="menuPageMenuCategory"
                  ref={(el) => (categoryRefs.current[cat.name] = el)}
                >
                  <div className="menuPageMenuCategoryHeader">
                    <h2 className="menuPageMenuCategoryName">{cat.name}</h2>
                    <div className="menuPageMenuCategoryLine" />
                    <span className="menuPageMenuCategoryCount">
                      {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="menuPageMenuProductGrid">
                    {filteredProducts.map((p, i) => (
                      <ProductCard key={i} p={p} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}

export default MenuPage;