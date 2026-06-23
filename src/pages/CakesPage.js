import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./CakesPage.css";
import PublicFooter from "../components/PublicFooter";

/* ─── Base path where cake images live in /public ─── */
const CAKE_IMG_BASE = "/cakes/";

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
    if (status === true || status === "true")
        return <span className="cakesPageStatusAvailable">Available</span>;
    if (status === false || status === "false")
        return <span className="cakesPageStatusUnavailable">Unavailable</span>;
    if (status === "check")
        return <span className="cakesPageStatusCheck">On Request</span>;
    return null;
}

/* ─── Cake Placeholder SVG ─── */
function CakePlaceholder() {
    return (
        <div className="cakesPageCakeImgPlaceholder">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="24" width="38" height="22" rx="2" stroke="rgba(200,134,26,0.35)" strokeWidth="1.2" fill="rgba(200,134,26,0.05)" />
                <rect x="14" y="16" width="26" height="12" rx="1.5" stroke="rgba(200,134,26,0.3)" strokeWidth="1.2" fill="rgba(200,134,26,0.04)" />
                <line x1="27" y1="8" x2="27" y2="16" stroke="rgba(200,134,26,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="27" cy="7" r="2" fill="rgba(232,168,50,0.6)" />
                <line x1="8" y1="30" x2="46" y2="30" stroke="rgba(200,134,26,0.12)" strokeWidth="1" />
                <path d="M8 30 Q14 26 20 30 Q26 34 32 30 Q38 26 46 30" stroke="rgba(200,134,26,0.22)" strokeWidth="1" fill="none" />
            </svg>
            <span>Add Photo</span>
        </div>
    );
}

/* ─── Cake Image with fallback + skeleton-until-loaded reveal ─── */
function CakeImage({ photoId, name }) {
    const [errored, setErrored] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Reset load/error state whenever the source changes
    useEffect(() => {
        setErrored(false);
        setLoaded(false);
    }, [photoId]);

    if (!photoId || errored) return <CakePlaceholder />;

    return (
        <>
            {/* Shimmer skeleton sits behind the image; fades out once loaded */}
            {!loaded && (
                <div className="cakesPageImgSkeleton" aria-hidden="true">
                    <div className="cakesPageImgSkeletonShimmer" />
                </div>
            )}
            <img
                src={`${CAKE_IMG_BASE}${photoId}`}
                alt={name}
                className={`cakesPageCakeCardImage ${loaded ? "cakesPageImgLoaded" : "cakesPageImgLoading"}`}
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)}
            />
        </>
    );
}

/* ─── Format a variation's underlying numeric value for display ───
   unitType "quantity" → pcs (e.g. "6 pcs")
   unitType "weight" (default) → grams/kg (e.g. "500g" / "1kg") */
function formatVariationLabel(value, unitType) {
    if (unitType === "quantity") {
        return `${value} pc${value === 1 ? "" : "s"}`;
    }
    return value >= 1000 ? `${value / 1000}kg` : `${value}g`;
}

/* ─── Cake Card ─── */
function CakeCard({ cake, selectedWeight, onWeightChange }) {
    const isQty = cake.unitType === "quantity";
    const defaultWeight = cake.variations?.[0]?.weight ?? (isQty ? 1 : 500);
    const currentWeight = selectedWeight[cake.id] ?? defaultWeight;

    const variation = cake.variations?.find(v => v.weight === currentWeight);
    const displayPrice = variation ? variation.price : 0;

    const isUnavailable = cake.available === false || cake.available === "false";

    return (
        <div className={`cakesPageCakeCard ${isUnavailable ? "cakesPageCakeCardUnavailable" : ""}`}>
            <div className="cakesPageCakeCardImageWrap">
                <CakeImage photoId={cake.photoId} name={cake.name} />
                <div className="cakesPageCakeCardOverlayGradient" />
            </div>

            <div className="cakesPageCakeCardBody">
                <div className="cakesPageCakeCardTop">
                    <h3 className="cakesPageCakeCardName">{cake.name}</h3>
                    <div className="cakesPageCakeCardPriceWrap">
                        <span className="cakesPageCakeCardPrice">₹{displayPrice}</span>
                    </div>
                </div>

                {cake.variations && cake.variations.length > 0 && (
                    <div className="cakesPageCakeWeightSelector stackedLayout">
                        <span className="cakesPageCakeWeightLabel">{isQty ? "Quantity" : "Weight"}</span>
                        <div className="cakesPageCakeWeightPills">
                            {cake.variations.map((v) => (
                                <button
                                    key={v.weight}
                                    className={`cakesPageWeightPill ${currentWeight === v.weight ? "cakesPageActive" : ""}`}
                                    onClick={() => onWeightChange(cake.id, v.weight)}
                                >
                                    {formatVariationLabel(v.weight, cake.unitType)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="cakesPageCakeCardFooter">
                    <StatusBadge status={cake.available} />
                </div>

                {cake.available === "check" && (
                    <a href="tel:+919879718228" className="cakesPageCakeCtaBtn">
                        Check Availability
                    </a>
                )}
            </div>
        </div>
    );
}

/* ─── Loading Skeleton ─── */
function SkeletonCard() {
    return (
        <div className="cakesPageCakeCard cakesPageCakeSkeleton">
            <div className="cakesPageCakeCardImageWrap cakesPageSkeletonImg" />
            <div className="cakesPageCakeCardBody">
                <div className="cakesPageSkeletonLine cakesPageSkeletonTitle" />
                <div className="cakesPageSkeletonLine cakesPageSkeletonPrice" />
                <div className="cakesPageSkeletonLine cakesPageSkeletonBadge" />
            </div>
        </div>
    );
}

/* ─── Main CakesPage ─── */
export default function CakesPage() {
    const [cakes, setCakes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [availabilityFilter, setAvailabilityFilter] = useState({
        available: false,
        unavailable: false,
        onRequest: false,
    });
    const [sortBy, setSortBy] = useState("default");
    const [activeCategory, setActiveCategory] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedWeight, setSelectedWeight] = useState({});
    const [viewMode, setViewMode] = useState("grid");
    const categoryRefs = useRef({});

    /* ── Fetch from Firestore ── */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const snap = await getDocs(collection(db, "cakes"));
                setCakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

                const catSnap = await getDocs(collection(db, "cakescategories"));
                const catData = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                catData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                setCategories(catData);
                if (catData.length > 0) setActiveCategory(catData[0].id);
            } catch (err) {
                console.error("Failed to fetch cakes:", err);
                setFetchError("Unable to load cakes right now. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleWeightChange = (id, w) => {
        setSelectedWeight((prev) => ({ ...prev, [id]: w }));
    };

    /* ── Scroll to a category section ── */
    const scrollToCategory = (catId) => {
        setActiveCategory(catId);
        setSidebarOpen(false);
        const el = categoryRefs.current[catId];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const anyAvailFilter =
        availabilityFilter.available ||
        availabilityFilter.unavailable ||
        availabilityFilter.onRequest;

    const toggleAvail = (key) =>
        setAvailabilityFilter((prev) => ({ ...prev, [key]: !prev[key] }));

    const getCakePrice = (cake) => {
        const isQty = cake.unitType === "quantity";
        const defaultWeight = cake.variations?.[0]?.weight ?? (isQty ? 1 : 500);
        const currentWeight = selectedWeight[cake.id] ?? defaultWeight;
        const variation = cake.variations?.find(v => v.weight === currentWeight);
        return variation ? variation.price : 0;
    };

    const filtered = cakes
        .filter((c) => {
            const q = searchQuery.toLowerCase();
            const nameMatch = c.name?.toLowerCase().includes(q);

            if (!nameMatch) return false;

            if (anyAvailFilter) {
                const av = c.available;
                const ok =
                    (availabilityFilter.available && (av === true || av === "true")) ||
                    (availabilityFilter.unavailable && (av === false || av === "false")) ||
                    (availabilityFilter.onRequest && av === "check");
                if (!ok) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "price-asc") return getCakePrice(a) - getCakePrice(b);
            if (sortBy === "price-desc") return getCakePrice(b) - getCakePrice(a);
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });

    const activeFilterCount = [
        anyAvailFilter,
        searchQuery !== "",
    ].filter(Boolean).length;

    const clearAll = () => {
        setSearchQuery("");
        setAvailabilityFilter({ available: false, unavailable: false, onRequest: false });
        setSortBy("default");
    };

    /* ── Group filtered cakes by category id ── */
    const cakesByCategory = filtered.reduce((acc, cake) => {
        const catId = cake.category || "uncategorized";
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(cake);
        return acc;
    }, {});

    /* ── Category list to render: known categories (in order) + Uncategorized last, only if non-empty ── */
    const categorySections = [
        ...categories.map((c) => ({ id: c.id, name: c.name })),
        { id: "uncategorized", name: "Other" },
    ].filter((c) => (cakesByCategory[c.id] || []).length > 0);

    return (
        <div className="cakesPage">
            <nav className="cakesPageBreadcrumbs" aria-label="Breadcrumb">
                <Link to="/" className="crumbLink">Home</Link>
                <span className="crumbSeparator">/</span>
                <Link to="/menu" className="crumbLink">Menu</Link>
                <span className="crumbSeparator">/</span>
                <span className="crumbCurrent" aria-current="page">Cakes</span>
            </nav>

            <button
                className="cakesPageMobileFilterToggle"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-expanded={sidebarOpen}
            >
                <span>
                    Filter &amp; Browse
                    {activeFilterCount > 0 && (
                        <span className="cakesPageFilterBadge">{activeFilterCount}</span>
                    )}
                </span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{
                        transform: sidebarOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.25s",
                    }}
                >
                    <path
                        d="M2 5l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <div className="cakesPageBody">
                <aside className={`cakesPageSidebar ${sidebarOpen ? "cakesPageOpen" : ""}`}>
                    <div className="cakesPageSidebarSearchWrap">
                        <svg className="cakesPageSidebarSearchIcon" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            className="cakesPageSidebarSearch"
                            placeholder="Search cakes…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="cakesPageSearchClear" onClick={() => setSearchQuery("")}>✕</button>
                        )}
                    </div>

                    <span className="cakesPageSidebarSectionLabel">Sort By</span>
                    <div className="cakesPageSidebarSortGroup">
                        {[
                            { val: "default", label: "Default" },
                            { val: "price-asc", label: "Price: Low → High" },
                            { val: "price-desc", label: "Price: High → Low" },
                            { val: "name", label: "Name A–Z" },
                        ].map(({ val, label }) => (
                            <div
                                key={val}
                                className={`cakesPageSortOption ${sortBy === val ? "cakesPageActive" : ""}`}
                                onClick={() => setSortBy(val)}
                            >
                                <div className="cakesPageSortRadio">
                                    <div className="cakesPageSortRadioDot" />
                                </div>
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="cakesPageSidebarDivider" />

                    <span className="cakesPageSidebarSectionLabel">Availability</span>
                    <div className="cakesPageSidebarFilterGroup">
                        {[
                            { key: "available", label: "Available" },
                            { key: "unavailable", label: "Unavailable" },
                            { key: "onRequest", label: "On Request" },
                        ].map(({ key, label }) => (
                            <div
                                key={key}
                                className={`cakesPageFilterOption ${availabilityFilter[key] ? "cakesPageActive" : ""}`}
                                onClick={() => toggleAvail(key)}
                                role="checkbox"
                                aria-checked={availabilityFilter[key]}
                            >
                                <div className="cakesPageFilterCheck">
                                    <div className="cakesPageFilterCheckTick" />
                                </div>
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="cakesPageSidebarDivider" />

                    {!loading && categorySections.length > 0 && (
                        <>
                            <span className="cakesPageSidebarSectionLabel">Categories</span>
                            <nav className="cakesPageSidebarCatNav">
                                {categorySections.map((cat) => {
                                    const count = (cakesByCategory[cat.id] || []).length;
                                    return (
                                        <div
                                            key={cat.id}
                                            className={`cakesPageCatNavItem ${activeCategory === cat.id ? "cakesPageActive" : ""}`}
                                            onClick={() => scrollToCategory(cat.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === "Enter" && scrollToCategory(cat.id)}
                                        >
                                            <span>{cat.name}</span>
                                            <span className="cakesPageCatNavCount">{count}</span>
                                        </div>
                                    );
                                })}
                            </nav>
                            <div className="cakesPageSidebarDivider" />
                        </>
                    )}

                    <div className="cakesPageSidebarResultsSummary">
                        <div className="cakesPageResultsCountNum">{loading ? "—" : filtered.length}</div>
                        <div className="cakesPageResultsCountLabel">
                            {filtered.length === 1 ? "product found" : "products found"}
                        </div>
                        {activeFilterCount > 0 && (
                            <button className="cakesPageClearFiltersBtn" onClick={clearAll}>
                                Clear all filters
                            </button>
                        )}
                    </div>
                </aside>

                <main className="cakesPageContent">
                    {/* ── Fetch error ── */}
                    {fetchError && (
                        <div className="cakesPageEmpty">
                            <p className="cakesPageEmptyTitle">Something went wrong</p>
                            <p className="cakesPageEmptySub">{fetchError}</p>
                            <button
                                className="cakesPageEmptyReset"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ── Toolbar (hide while loading) ── */}
                    {!fetchError && (
                        <>
                            <div className="cakesPageToolbar">
                                <div className="cakesPageToolbarLeft">
                                    <span className="cakesPageToolbarCount">
                                        {loading ? (
                                            <span className="cakesPageSkeletonInline" />
                                        ) : (
                                            <>
                                                <strong>{filtered.length}</strong>{" "}
                                                {filtered.length === 1 ? "cake" : "cakes"}
                                                {activeFilterCount > 0 && (
                                                    <span className="cakesPageToolbarFilterNote"> · filtered</span>
                                                )}
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="cakesPageToolbarRight">
                                    <button
                                        className={`cakesPageViewToggle ${viewMode === "grid" ? "cakesPageActive" : ""}`}
                                        onClick={() => setViewMode("grid")}
                                        title="Grid view"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                                            <rect x="8" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                                            <rect x="1" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                                            <rect x="8" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                                        </svg>
                                    </button>
                                    <button
                                        className={`cakesPageViewToggle ${viewMode === "list" ? "cakesPageActive" : ""}`}
                                        onClick={() => setViewMode("list")}
                                        title="List view"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <rect x="1" y="2" width="12" height="2" rx="0.5" fill="currentColor" />
                                            <rect x="1" y="6" width="12" height="2" rx="0.5" fill="currentColor" />
                                            <rect x="1" y="10" width="12" height="2" rx="0.5" fill="currentColor" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {activeFilterCount > 0 && (
                                <div className="cakesPageActiveFilterChips">
                                    {searchQuery && (
                                        <span className="cakesPageActiveChip">
                                            "{searchQuery}"
                                            <button onClick={() => setSearchQuery("")}>✕</button>
                                        </span>
                                    )}
                                    {anyAvailFilter && (
                                        <span className="cakesPageActiveChip">
                                            Availability filtered
                                            <button
                                                onClick={() =>
                                                    setAvailabilityFilter({
                                                        available: false,
                                                        unavailable: false,
                                                        onRequest: false,
                                                    })
                                                }
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    <button className="cakesPageChipClearAll" onClick={clearAll}>
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* ── Loading skeletons ── */}
                            {loading ? (
                                <div className="cakesPageGrid">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="cakesPageEmpty">
                                    <div className="cakesPageEmptyIcon">
                                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                                            <circle cx="28" cy="28" r="26" stroke="rgba(200,134,26,0.2)" strokeWidth="1" />
                                            <path d="M18 32 Q28 20 38 32" stroke="rgba(200,134,26,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                                            <circle cx="21" cy="24" r="2" fill="rgba(200,134,26,0.3)" />
                                            <circle cx="35" cy="24" r="2" fill="rgba(200,134,26,0.3)" />
                                        </svg>
                                    </div>
                                    <p className="cakesPageEmptyTitle">No cakes found</p>
                                    <p className="cakesPageEmptySub">
                                        Try adjusting your search or filters.
                                    </p>
                                    <button className="cakesPageEmptyReset" onClick={clearAll}>
                                        Reset filters
                                    </button>
                                </div>
                            ) : (
                                categorySections.map((cat) => {
                                    const catCakes = cakesByCategory[cat.id] || [];
                                    if (catCakes.length === 0) return null;
                                    return (
                                        <section
                                            key={cat.id}
                                            className="cakesPageCategorySection"
                                            ref={(el) => (categoryRefs.current[cat.id] = el)}
                                        >
                                            <div className="cakesPageCategoryHeader">
                                                <h2 className="cakesPageCategoryName">{cat.name}</h2>
                                                <div className="cakesPageCategoryLine" />
                                                <span className="cakesPageCategoryCount">
                                                    {catCakes.length} {catCakes.length === 1 ? "item" : "items"}
                                                </span>
                                            </div>

                                            <div className={`cakesPageGrid ${viewMode === "list" ? "cakesPageGridList" : ""}`}>
                                                {catCakes.map((cake) => (
                                                    <CakeCard
                                                        key={cake.id}
                                                        cake={cake}
                                                        selectedWeight={selectedWeight}
                                                        onWeightChange={handleWeightChange}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })
                            )}
                        </>
                    )}
                </main>
            </div>

            <PublicFooter />
        </div>
    );
}