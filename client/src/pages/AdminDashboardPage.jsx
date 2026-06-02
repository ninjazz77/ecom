import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  CreditCard,
  Edit3,
  FolderKanban,
  Gauge,
  ImagePlus,
  LayoutDashboard,
  ListFilter,
  Megaphone,
  Package,
  Percent,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  Users,
  X,
  Menu,
} from "lucide-react";
import api from "@/lib/api";
import { setProducts as setReduxProducts } from "@/redux/productsSlice";

/* ─── Config ─────────────────────────────────────────────── */
const SECTIONS = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard },
  products: { label: "Products", icon: Package },
  categories: { label: "Categories", icon: FolderKanban },
  orders: { label: "Orders", icon: Truck },
  customers: { label: "Customers", icon: Users },
  coupons: { label: "Coupons", icon: Percent },
  reviews: { label: "Reviews", icon: Star },
  promotions: { label: "Promotions", icon: Megaphone },
  media: { label: "Media", icon: ImagePlus },
  reports: { label: "Reports", icon: BarChart3 },
  settings: { label: "Settings", icon: Settings },
};
const SECTION_ORDER = Object.keys(SECTIONS);

const MAX_IMGS = 10;
const productDraftKey = "flux-admin-product-draft";
const categoryDraftKey = "flux-admin-category-draft";
const recentCatsKey = "flux-admin-recent-cats";

const emptyProduct = {
  productName: "",
  productDesc: "",
  productPrice: "",
  category: "",
  subCategory: "",
  brand: "",
  stock: 0,
  isFeatured: false,
  isActive: true,
};
const emptyCategory = {
  name: "",
  description: "",
  parentCategory: "",
  sortOrder: 0,
  isActive: true,
};
const emptyCoupon = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  minPurchase: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};
const emptyPromo = {
  title: "",
  description: "",
  targetType: "banner",
  productIds: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};
const emptyReview = {
  productId: "",
  userId: "",
  rating: 5,
  comment: "",
  status: "pending",
};
const emptyMedia = { folder: "admin_media", tags: "", altText: "" };

const fmt = (v) => `₹${Number(v || 0).toLocaleString()}`;
const furl = (f) => URL.createObjectURL(f);

/* ─── Small shared components ─────────────────────────────── */
const Chip = ({ children, tone = "slate" }) => {
  const cls =
    {
      slate: "bg-white/8 text-white/50 border-white/10",
      purple: "bg-violet-500/15 text-violet-300 border-violet-500/25",
      green: "bg-green-500/15 text-green-300 border-green-500/25",
      red: "bg-red-500/15 text-red-300 border-red-500/25",
      amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
      cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    }[tone] || "bg-white/8 text-white/50 border-white/10";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {children}
    </span>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  detail,
  color = "from-violet-500 to-pink-500",
}) => (
  <div className="glass rounded-3xl p-5 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200">
    <div
      className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="font-display text-2xl font-black text-white mt-1">
        {value}
      </p>
      <p className="text-xs text-white/35 mt-1">{detail}</p>
    </div>
  </div>
);

const SkeletonRow = () => <div className="h-16 rounded-2xl animate-shimmer" />;

const Empty = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="h-14 w-14 rounded-3xl glass flex items-center justify-center text-white/20">
      <Icon className="h-6 w-6" />
    </div>
    <p className="font-display text-lg text-white/30">{title}</p>
    <p className="text-sm text-white/20 max-w-xs">{desc}</p>
  </div>
);

const Field = ({ label, required, children, span2 }) => (
  <div className={`space-y-1.5 ${span2 ? "md:col-span-2" : ""}`}>
    <label className="text-xs font-semibold uppercase tracking-wider text-white/35">
      {label}
      {required && <span className="text-pink-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? "bg-gradient-to-r from-violet-500 to-pink-500" : "bg-white/15"}`}
    >
      <div
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-5" : ""}`}
      />
    </div>
    <span className="text-sm text-white/60 font-medium">{label}</span>
  </label>
);

/* ─── Main Component ─────────────────────────────────────── */
const AdminDashboardPage = () => {
  const { section: routeSection } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.user);

  const activeSection = SECTION_ORDER.includes(routeSection)
    ? routeSection
    : "dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState(null);

  const [productFiles, setProductFiles] = useState([]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [couponFile, setCouponFile] = useState(null);
  const [promotionFile, setPromotionFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);

  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [promoForm, setPromoForm] = useState(emptyPromo);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [mediaForm, setMediaForm] = useState(emptyMedia);

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      toast.error("Admin access required");
    }
  }, [user, navigate]);

  useEffect(() => {
    const pd = localStorage.getItem(productDraftKey);
    const cd = localStorage.getItem(categoryDraftKey);
    if (pd) {
      try {
        setProductForm((p) => ({ ...p, ...JSON.parse(pd) }));
      } catch {
        localStorage.removeItem(productDraftKey);
      }
    }
    if (cd) {
      try {
        setCategoryForm((p) => ({ ...p, ...JSON.parse(cd) }));
      } catch {
        localStorage.removeItem(categoryDraftKey);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(productDraftKey, JSON.stringify(productForm));
  }, [productForm]);
  useEffect(() => {
    localStorage.setItem(categoryDraftKey, JSON.stringify(categoryForm));
  }, [categoryForm]);

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, uRes, oRes, cRes, ovRes, rpRes, cpRes, rvRes, prRes, mRes] =
        await Promise.all([
          api.get("/product/getallproducts?includeInactive=true"),
          api.get("/user/all-user"),
          api.get("/order/all-orders"),
          api.get("/category/all?includeInactive=true"),
          api.get("/admin/overview"),
          api.get("/admin/reports"),
          api.get("/coupon/all"),
          api.get("/review/all"),
          api.get("/promotion/all"),
          api.get("/media/all"),
        ]);
      const prods = pRes.data.products || [];
      setProducts(prods);
      dispatch(setReduxProducts(prods));
      setUsers(uRes.data.users || []);
      setOrders(oRes.data.orders || []);
      setCategories(cRes.data.categories || []);
      setOverview(ovRes.data.overview || null);
      setReports(rpRes.data.reports || null);
      setCoupons(cpRes.data.coupons || []);
      setReviews(rvRes.data.reviews || []);
      setPromotions(prRes.data.promotions || []);
      setMediaItems(mRes.data.media || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/admin-login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  /* ─── Derived data ──────────────────── */
  const stats = useMemo(
    () => ({
      products: products.length,
      active:
        overview?.activeProducts ??
        products.filter((p) => p.isActive !== false).length,
      revenue:
        overview?.revenue ??
        orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
      customers: users.length,
      orders: orders.length,
      categories: categories.length,
    }),
    [overview, products, orders, users, categories],
  );

  const categorySuggestions = useMemo(
    () => [...new Set(categories.map((c) => c.name).filter(Boolean))],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          !t ||
          [p.productName, p.category, p.brand]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(t),
      )
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [products, searchTerm]);

  const filteredCategories = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return categories.filter(
      (c) =>
        !t ||
        [c.name, c.slug, c.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [categories, searchTerm]);

  const filteredUsers = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return users.filter(
      (u) =>
        !t ||
        [u.firstName, u.lastName, u.email, u.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [users, searchTerm]);

  const filteredOrders = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return orders.filter(
      (o) =>
        !t ||
        [o._id, o.status, o.paymentStatus, o.userId?.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [orders, searchTerm]);

  const filteredCoupons = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return coupons.filter(
      (c) =>
        !t ||
        [c.code, c.description, c.discountType]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [coupons, searchTerm]);

  const filteredReviews = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        !t ||
        [r.comment, r.status, r.productId?.productName, r.userId?.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [reviews, searchTerm]);

  const filteredPromos = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return promotions.filter(
      (p) =>
        !t ||
        [p.title, p.description, p.targetType]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [promotions, searchTerm]);

  const filteredMedia = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return mediaItems.filter(
      (m) =>
        !t ||
        [m.filename, m.altText, m.folder, ...(m.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(t),
    );
  }, [mediaItems, searchTerm]);

  /* ─── CRUD helpers ──────────────────── */
  const resetProduct = () => {
    setEditingProductId(null);
    setProductFiles([]);
    setProductForm(emptyProduct);
    localStorage.removeItem(productDraftKey);
  };
  const resetCategory = () => {
    setEditingCategoryId(null);
    setCategoryImage(null);
    setCategoryForm(emptyCategory);
    localStorage.removeItem(categoryDraftKey);
  };
  const resetCoupon = () => {
    setEditingCouponId(null);
    setCouponForm(emptyCoupon);
    setCouponFile(null);
  };
  const resetPromo = () => {
    setEditingPromoId(null);
    setPromoForm(emptyPromo);
    setPromotionFile(null);
  };
  const resetReview = () => {
    setEditingReviewId(null);
    setReviewForm(emptyReview);
  };
  const resetMedia = () => {
    setMediaFile(null);
    setMediaForm(emptyMedia);
  };

  const openProductEditor = (p) => {
    setEditingProductId(p._id);
    setProductFiles([]);
    setCategorySearch(p.category || "");
    setProductForm({
      productName: p.productName || "",
      productDesc: p.productDesc || "",
      productPrice: p.productPrice || "",
      category: p.category || "",
      subCategory: p.subCategory || "",
      brand: p.brand || "",
      stock: p.stock ?? 0,
      isFeatured: Boolean(p.isFeatured),
      isActive: p.isActive !== false,
    });
    navigate("/admin/products");
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.productName.trim()) {
      toast.error("Product name required");
      return;
    }
    if (!productForm.category.trim()) {
      toast.error("Category required");
      return;
    }
    if (!productForm.brand.trim()) {
      toast.error("Brand required");
      return;
    }
    if (Number(productForm.productPrice) <= 0) {
      toast.error("Price must be > 0");
      return;
    }
    try {
      setSavingProduct(true);
      const fd = new FormData();
      Object.entries(productForm).forEach(([k, v]) => fd.append(k, v));
      productFiles.forEach((f) => fd.append("files", f));
      let res;
      if (editingProductId) {
        const cur = products.find((p) => p._id === editingProductId);
        fd.append(
          "existingImages",
          JSON.stringify(cur?.productImg?.map((i) => i.public_id) || []),
        );
        res = await api.put(`/product/update/${editingProductId}`, fd);
      } else {
        res = await api.post("/product/add", fd);
      }
      if (!res?.data?.success) throw new Error(res?.data?.message || "Failed");
      toast.success(res.data.message || "Saved");
      if (res.data.product) {
        setProducts((prev) => {
          const next = editingProductId
            ? prev.map((p) =>
                p._id === res.data.product._id ? res.data.product : p,
              )
            : [res.data.product, ...prev];
          dispatch(setReduxProducts(next));
          return next;
        });
      }
      resetProduct();
      loadData().catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Save failed");
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await api.delete(`/product/delete/${id}`);
      if (res.data.success) {
        toast.success("Deleted");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const updateProductStatus = async (product, patch) => {
    try {
      const fd = new FormData();
      fd.append("productName", product.productName || "");
      fd.append("productDesc", product.productDesc || "");
      fd.append("productPrice", product.productPrice || 0);
      fd.append("category", product.category || "");
      fd.append("subCategory", product.subCategory || "");
      fd.append("brand", product.brand || "");
      fd.append("stock", product.stock ?? 0);
      fd.append("isFeatured", patch.isFeatured ?? product.isFeatured);
      fd.append("isActive", patch.isActive ?? product.isActive);
      fd.append(
        "existingImages",
        JSON.stringify(product.productImg?.map((i) => i.public_id) || []),
      );
      const res = await api.put(`/product/update/${product._id}`, fd);
      if (res.data.success) {
        toast.success("Updated");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  const bulkAction = async (action) => {
    if (!selectedIds.length) return;
    if (action === "delete" && !window.confirm("Delete selected?")) return;
    const targets = products.filter((p) => selectedIds.includes(p._id));
    for (const p of targets) {
      if (action === "delete")
        await api.delete(`/product/delete/${p._id}`).catch(() => {});
      else await updateProductStatus(p, { isActive: action === "activate" });
    }
    toast.success("Done");
    setSelectedIds([]);
    await loadData();
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error("Name required");
      return;
    }
    if (!categoryForm.description.trim()) {
      toast.error("Description required");
      return;
    }
    try {
      setSavingCategory(true);
      const fd = new FormData();
      fd.append("name", categoryForm.name);
      fd.append("description", categoryForm.description);
      fd.append("parentCategory", categoryForm.parentCategory || "");
      fd.append("sortOrder", categoryForm.sortOrder);
      fd.append("isActive", categoryForm.isActive);
      if (categoryImage) fd.append("file", categoryImage);
      if (editingCategoryId) {
        const res = await api.put(`/category/update/${editingCategoryId}`, fd);
        if (res.data.success) toast.success("Category updated");
      } else {
        const res = await api.post("/category/add", fd);
        if (res.data.success) toast.success("Category created");
      }
      resetCategory();
      await loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const r = await api.delete(`/category/delete/${id}`);
      if (r.data.success) {
        toast.success("Deleted");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const saveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      toast.error("Code required");
      return;
    }
    try {
      setSavingCoupon(true);
      const payload = {
        ...couponForm,
        code: couponForm.code.trim(),
        discountValue: Number(couponForm.discountValue),
        minPurchase: Number(couponForm.minPurchase || 0),
        usageLimit: Number(couponForm.usageLimit || 0),
        expiresAt: couponForm.expiresAt || null,
      };
      const res = editingCouponId
        ? await api.put(`/coupon/update/${editingCouponId}`, payload)
        : await api.post("/coupon/add", payload);
      if (res.data.success) {
        toast.success(res.data.message || "Saved");
        resetCoupon();
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSavingCoupon(false);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const r = await api.delete(`/coupon/delete/${id}`);
      if (r.data.success) {
        toast.success("Deleted");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const savePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.title.trim()) {
      toast.error("Title required");
      return;
    }
    try {
      setSavingPromo(true);
      const fd = new FormData();
      fd.append("title", promoForm.title.trim());
      fd.append("description", promoForm.description.trim());
      fd.append("targetType", promoForm.targetType);
      fd.append(
        "productIds",
        JSON.stringify(
          promoForm.productIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
      fd.append("startsAt", promoForm.startsAt || "");
      fd.append("endsAt", promoForm.endsAt || "");
      fd.append("isActive", promoForm.isActive);
      if (promotionFile) fd.append("file", promotionFile);
      const res = editingPromoId
        ? await api.put(`/promotion/update/${editingPromoId}`, fd)
        : await api.post("/promotion/add", fd);
      if (res.data.success) {
        toast.success(res.data.message || "Saved");
        resetPromo();
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSavingPromo(false);
    }
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const r = await api.delete(`/promotion/delete/${id}`);
      if (r.data.success) {
        toast.success("Deleted");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const saveReview = async (e) => {
    e.preventDefault();
    if (
      !reviewForm.productId ||
      !reviewForm.userId ||
      !reviewForm.comment.trim()
    ) {
      toast.error("All fields required");
      return;
    }
    try {
      setSavingReview(true);
      const payload = {
        ...reviewForm,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };
      const res = editingReviewId
        ? await api.put(`/review/update/${editingReviewId}`, payload)
        : await api.post("/review/add", payload);
      if (res.data.success) {
        toast.success(res.data.message || "Saved");
        resetReview();
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSavingReview(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const r = await api.delete(`/review/delete/${id}`);
      if (r.data.success) {
        toast.success("Deleted");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const saveMedia = async (e) => {
    e.preventDefault();
    if (!mediaFile) {
      toast.error("Select a file");
      return;
    }
    try {
      setSavingMedia(true);
      const fd = new FormData();
      fd.append("file", mediaFile);
      fd.append("folder", mediaForm.folder || "admin_media");
      fd.append(
        "tags",
        JSON.stringify(
          mediaForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      );
      fd.append("altText", mediaForm.altText || "");
      const res = await api.post("/media/upload", fd);
      if (res.data.success) {
        toast.success("Uploaded");
        resetMedia();
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSavingMedia(false);
    }
  };

  const deleteMedia = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const r = await api.delete(`/media/delete/${id}`);
      if (r.data.success) {
        toast.success("Deleted");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const toggleUserRole = async (u) => {
    try {
      const r = await api.put(`/user/change-role/${u._id}`, {
        role: u.role === "admin" ? "user" : "admin",
      });
      if (r.data.success) {
        toast.success("Role updated");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const toggleUserBlock = async (u) => {
    try {
      const action = u.isBlocked ? "unblock" : "block";
      const r = await api.put(`/user/${action}-user/${u._id}`);
      if (r.data.success) {
        toast.success(r.data.message);
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleOrderSave = async (id, payload) => {
    try {
      const r = await api.put(`/order/${id}/status`, payload);
      if (r.data.success) {
        toast.success("Order updated");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleRefund = async (id) => {
    try {
      const r = await api.put(`/order/${id}/refund`);
      if (r.data.success) {
        toast.success("Refund processed");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const moderateReview = async (id, status) => {
    try {
      const r = await api.put(`/review/moderate/${id}`, { status });
      if (r.data.success) {
        toast.success("Review updated");
        await loadData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  /* ─── Render helpers ─────────────────── */
  const go = (s) => {
    navigate(s === "dashboard" ? "/admin" : `/admin/${s}`);
    setSidebarOpen(false);
  };

  const SectionIcon = SECTIONS[activeSection]?.icon || LayoutDashboard;
  const sectionLabel = SECTIONS[activeSection]?.label || "Dashboard";

  const HERO_METRICS = [
    {
      icon: ShoppingBag,
      label: "Total Products",
      value: stats.products,
      detail: "Catalog records",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Gauge,
      label: "Active Products",
      value: stats.active,
      detail: "Visible on storefront",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: CreditCard,
      label: "Revenue",
      value: fmt(stats.revenue),
      detail: `${stats.orders} orders`,
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Users,
      label: "Customers",
      value: stats.customers,
      detail: "Registered accounts",
      color: "from-amber-500 to-orange-600",
    },
  ];

  const inputCls = "input-dark w-full";
  const selectCls = "input-dark w-full";
  const textareaCls = "input-dark w-full resize-none";

  const ActionBtn = ({
    onClick,
    disabled,
    children,
    variant = "primary",
    className = "",
  }) => {
    const base =
      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ";
    const variants = {
      primary:
        "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-glow",
      ghost: "glass text-white/70 hover:text-white",
      danger:
        "bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/25",
      success:
        "bg-green-500/15 border border-green-500/25 text-green-300 hover:bg-green-500/25",
    };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={
          base + (variants[variant] || variants.ghost) + " " + className
        }
      >
        {children}
      </button>
    );
  };

  const recentCats = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(recentCatsKey) || "[]");
    } catch {
      return [];
    }
  }, [categories.length]);

  /* ─── JSX ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/8 flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="xl:hidden h-9 w-9 rounded-xl glass flex items-center justify-center text-white/60"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-white font-bold hidden sm:block">
              Admin Panel
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search…"
              className="input-dark w-full pl-10 text-sm py-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 glass rounded-2xl px-3 py-1.5">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <span className="text-sm text-white/70">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-[#0d0d11] border-r border-white/6 flex flex-col overflow-y-auto thin-scroll transition-transform duration-300 xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <nav className="flex-1 p-3 space-y-1">
            {SECTION_ORDER.map((s) => {
              const { label, icon: Icon } = SECTIONS[s];
              const active = s === activeSection;
              return (
                <button
                  key={s}
                  onClick={() => go(s)}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                  {active && (
                    <ChevronRight className="h-3 w-3 ml-auto opacity-60" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/6">
            <p className="text-[10px] uppercase tracking-wider text-white/20 mb-2">
              Store Status
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-white/40">
                All systems operational
              </span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 xl:ml-64 p-4 lg:p-6 space-y-6 min-w-0">
          {/* Page header */}
          <div className="glass rounded-3xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/30 mb-3">
                  <span>Admin</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-violet-400">{sectionLabel}</span>
                </div>
                <h1 className="font-display text-3xl lg:text-4xl text-white flex items-center gap-3">
                  <SectionIcon className="h-8 w-8 text-violet-400" />
                  {sectionLabel}
                </h1>
              </div>
              <ActionBtn onClick={loadData} variant="ghost" disabled={loading}>
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white/70 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? "Loading…" : "Refresh"}
              </ActionBtn>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HERO_METRICS.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          {/* ── Dashboard ── */}
          {activeSection === "dashboard" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass rounded-3xl p-6 space-y-4">
                <h2 className="font-display text-xl text-white">
                  Revenue Overview
                </h2>
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs text-white/30 uppercase tracking-wider">
                    Total Revenue
                  </p>
                  <p className="font-display text-3xl font-black gradient-text mt-1">
                    {fmt(overview?.revenue ?? stats.revenue)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      l: "Featured",
                      v: products.filter((p) => p.isFeatured).length,
                    },
                    { l: "Categories", v: stats.categories },
                    { l: "Orders", v: stats.orders },
                    { l: "Customers", v: stats.customers },
                  ].map(({ l, v }) => (
                    <div key={l} className="glass rounded-2xl p-4">
                      <p className="text-xs text-white/30">{l}</p>
                      <p className="font-display text-xl text-white mt-1">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
                {(overview?.charts?.dailyRevenue || []).map((d) => (
                  <div key={d.date} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>{d.date}</span>
                      <span>{fmt(d.revenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                        style={{
                          width: `${Math.min(100, ((d.revenue || 0) / Math.max(1, overview?.revenue || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass rounded-3xl p-6 space-y-3">
                <h2 className="font-display text-xl text-white">
                  Inventory Snapshot
                </h2>
                {products.slice(0, 6).map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between glass rounded-2xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.productImg?.[0]?.url || "/Flux.png"}
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white truncate max-w-[160px]">
                          {p.productName}
                        </p>
                        <p className="text-xs text-white/30">{p.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {fmt(p.productPrice)}
                      </p>
                      <p className="text-xs text-white/30">{p.stock} left</p>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <Empty
                    icon={Boxes}
                    title="No products"
                    desc="Add products in the Products section."
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {activeSection === "products" && (
            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
              <div className="glass rounded-3xl p-6 space-y-5">
                <h2 className="font-display text-xl text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-violet-400" />
                  {editingProductId ? "Edit Product" : "Add Product"}
                </h2>
                <form onSubmit={saveProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" required span2>
                      <input
                        value={productForm.productName}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            productName: e.target.value,
                          }))
                        }
                        placeholder="Product name"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Brand" required>
                      <input
                        value={productForm.brand}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            brand: e.target.value,
                          }))
                        }
                        placeholder="Brand"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Price" required>
                      <input
                        type="number"
                        min="1"
                        value={productForm.productPrice}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            productPrice: e.target.value,
                          }))
                        }
                        placeholder="₹"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Stock" required span2>
                      <input
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                        list="cat-list"
                        placeholder="Category"
                        className={inputCls}
                      />
                      <datalist id="cat-list">
                        {categorySuggestions.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </Field>
                    <Field label="Stock">
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            stock: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Images" span2>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setProductFiles(
                            Array.from(e.target.files || []).slice(0, MAX_IMGS),
                          )
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Description" required span2>
                      <textarea
                        rows={4}
                        value={productForm.productDesc}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            productDesc: e.target.value,
                          }))
                        }
                        className={textareaCls}
                        placeholder="Describe the product…"
                      />
                    </Field>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <Toggle
                      label="Featured"
                      checked={productForm.isFeatured}
                      onChange={(v) =>
                        setProductForm((p) => ({ ...p, isFeatured: v }))
                      }
                    />
                    <Toggle
                      label="Active"
                      checked={productForm.isActive}
                      onChange={(v) =>
                        setProductForm((p) => ({ ...p, isActive: v }))
                      }
                    />
                  </div>
                  <div className="flex gap-3">
                    <ActionBtn disabled={savingProduct} variant="primary">
                      {savingProduct
                        ? "Saving…"
                        : editingProductId
                          ? "Update"
                          : "Publish"}
                    </ActionBtn>
                    <ActionBtn
                      type="button"
                      onClick={resetProduct}
                      variant="ghost"
                    >
                      Reset
                    </ActionBtn>
                  </div>
                </form>
              </div>

              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-white flex items-center gap-2">
                    <ListFilter className="h-5 w-5 text-cyan-400" /> Inventory
                  </h2>
                  <div className="flex gap-2">
                    <ActionBtn
                      onClick={() => bulkAction("activate")}
                      disabled={!selectedIds.length}
                      variant="success"
                    >
                      Activate
                    </ActionBtn>
                    <ActionBtn
                      onClick={() => bulkAction("disable")}
                      disabled={!selectedIds.length}
                      variant="ghost"
                    >
                      Disable
                    </ActionBtn>
                    <ActionBtn
                      onClick={() => bulkAction("delete")}
                      disabled={!selectedIds.length}
                      variant="danger"
                    >
                      Delete
                    </ActionBtn>
                  </div>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto thin-scroll">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <Empty
                      icon={Package}
                      title="No products"
                      desc="Create your first product above."
                    />
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center gap-3 glass rounded-2xl p-3"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p._id)}
                          onChange={(e) =>
                            setSelectedIds((prev) =>
                              e.target.checked
                                ? [...prev, p._id]
                                : prev.filter((id) => id !== p._id),
                            )
                          }
                          className="h-4 w-4 accent-violet-500"
                        />
                        <img
                          src={p.productImg?.[0]?.url || "/Flux.png"}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {p.productName}
                          </p>
                          <p className="text-xs text-white/30">
                            {p.category} • {fmt(p.productPrice)} • {p.stock}{" "}
                            stock
                          </p>
                          <div className="flex gap-1.5 mt-1">
                            <Chip tone={p.isActive === false ? "red" : "green"}>
                              {p.isActive === false ? "Disabled" : "Active"}
                            </Chip>
                            {p.isFeatured && (
                              <Chip tone="purple">Featured</Chip>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <ActionBtn
                            onClick={() => openProductEditor(p)}
                            variant="ghost"
                            className="py-1.5 px-3 text-xs"
                          >
                            Edit
                          </ActionBtn>
                          <ActionBtn
                            onClick={() =>
                              updateProductStatus(p, {
                                isFeatured: !p.isFeatured,
                              })
                            }
                            variant="ghost"
                            className="py-1.5 px-3 text-xs"
                          >
                            {p.isFeatured ? "Unfeature" : "Feature"}
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => deleteProduct(p._id)}
                            variant="danger"
                            className="py-1.5 px-3 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </ActionBtn>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Categories ── */}
          {activeSection === "categories" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass rounded-3xl p-6 space-y-5">
                <h2 className="font-display text-xl text-white">
                  {editingCategoryId ? "Edit Category" : "Add Category"}
                </h2>
                <form onSubmit={saveCategory} className="space-y-4">
                  <Field label="Name" required>
                    <input
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm((p) => ({ ...p, name: e.target.value }))
                      }
                      list="cat-names"
                      placeholder="Category name"
                      className={inputCls}
                    />
                    <datalist id="cat-names">
                      {categorySuggestions.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Parent Category">
                    <select
                      value={categoryForm.parentCategory}
                      onChange={(e) =>
                        setCategoryForm((p) => ({
                          ...p,
                          parentCategory: e.target.value,
                        }))
                      }
                      className={selectCls}
                    >
                      <option value="">No parent</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sort Order">
                    <input
                      type="number"
                      value={categoryForm.sortOrder}
                      onChange={(e) =>
                        setCategoryForm((p) => ({
                          ...p,
                          sortOrder: e.target.value,
                        }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Image">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCategoryImage(e.target.files?.[0] || null)
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Description" required>
                    <textarea
                      rows={3}
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className={textareaCls}
                      placeholder="Describe this category…"
                    />
                  </Field>
                  <Toggle
                    label="Active"
                    checked={categoryForm.isActive}
                    onChange={(v) =>
                      setCategoryForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <div className="flex gap-3">
                    <ActionBtn disabled={savingCategory} variant="primary">
                      {savingCategory
                        ? "Saving…"
                        : editingCategoryId
                          ? "Update"
                          : "Create"}
                    </ActionBtn>
                    <ActionBtn
                      type="button"
                      onClick={resetCategory}
                      variant="ghost"
                    >
                      Reset
                    </ActionBtn>
                  </div>
                </form>
              </div>
              <div className="glass rounded-3xl p-6 space-y-3">
                <h2 className="font-display text-xl text-white">
                  Category Hierarchy{" "}
                  <span className="text-sm font-sans font-normal text-white/30">
                    ({categories.length})
                  </span>
                </h2>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredCategories.length === 0 ? (
                  <Empty
                    icon={FolderKanban}
                    title="No categories"
                    desc="Create your first category above."
                  />
                ) : (
                  filteredCategories.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between glass rounded-2xl p-4"
                    >
                      <div>
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-white/30">
                          {c.parentCategory?.name || "Root"} • {c.slug}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          <Chip tone={c.isActive === false ? "red" : "green"}>
                            {c.isActive === false ? "Disabled" : "Active"}
                          </Chip>
                          <Chip tone="slate">Sort {c.sortOrder || 0}</Chip>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ActionBtn
                          onClick={() => {
                            setEditingCategoryId(c._id);
                            setCategoryForm({
                              name: c.name || "",
                              description: c.description || "",
                              parentCategory: c.parentCategory?._id || "",
                              sortOrder: c.sortOrder || 0,
                              isActive: c.isActive !== false,
                            });
                            navigate("/admin/categories");
                          }}
                          variant="ghost"
                          className="py-1.5 px-3 text-xs"
                        >
                          Edit
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => deleteCategory(c._id)}
                          variant="danger"
                          className="py-1.5 px-3 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {activeSection === "orders" && (
            <div className="glass rounded-3xl p-6 space-y-3">
              <h2 className="font-display text-xl text-white">
                Orders{" "}
                <span className="text-sm font-sans font-normal text-white/30">
                  ({filteredOrders.length})
                </span>
              </h2>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredOrders.length === 0 ? (
                <Empty
                  icon={Truck}
                  title="No orders"
                  desc="Orders appear here once checkout is connected."
                />
              ) : (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onSave={handleOrderSave}
                    onRefund={handleRefund}
                  />
                ))
              )}
            </div>
          )}

          {/* ── Customers ── */}
          {activeSection === "customers" && (
            <div className="glass rounded-3xl p-6 space-y-3">
              <h2 className="font-display text-xl text-white">
                Customers{" "}
                <span className="text-sm font-sans font-normal text-white/30">
                  ({filteredUsers.length})
                </span>
              </h2>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredUsers.length === 0 ? (
                <Empty
                  icon={Users}
                  title="No customers"
                  desc="Customers will appear once they register."
                />
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-sm text-white/40">{u.email}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        <Chip tone="slate">{u.role || "user"}</Chip>
                        <Chip tone={u.isVerified ? "green" : "amber"}>
                          {u.isVerified ? "Verified" : "Unverified"}
                        </Chip>
                        <Chip tone={u.isBlocked ? "red" : "green"}>
                          {u.isBlocked ? "Blocked" : "Active"}
                        </Chip>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ActionBtn
                        onClick={() => toggleUserRole(u)}
                        variant="ghost"
                        className="text-xs"
                      >
                        {u.role === "admin" ? "Make User" : "Make Admin"}
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => toggleUserBlock(u)}
                        variant={u.isBlocked ? "success" : "danger"}
                        className="text-xs"
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </ActionBtn>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Coupons ── */}
          {activeSection === "coupons" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass rounded-3xl p-6 space-y-5">
                <h2 className="font-display text-xl text-white">
                  {editingCouponId ? "Edit Coupon" : "Create Coupon"}
                </h2>
                <form onSubmit={saveCoupon} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Code" required>
                      <input
                        value={couponForm.code}
                        onChange={(e) =>
                          setCouponForm((p) => ({ ...p, code: e.target.value }))
                        }
                        placeholder="SAVE20"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Type">
                      <select
                        value={couponForm.discountType}
                        onChange={(e) =>
                          setCouponForm((p) => ({
                            ...p,
                            discountType: e.target.value,
                          }))
                        }
                        className={selectCls}
                      >
                        <option value="percent">Percent</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </Field>
                    <Field label="Value" required>
                      <input
                        type="number"
                        min="0"
                        value={couponForm.discountValue}
                        onChange={(e) =>
                          setCouponForm((p) => ({
                            ...p,
                            discountValue: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Min Purchase">
                      <input
                        type="number"
                        min="0"
                        value={couponForm.minPurchase}
                        onChange={(e) =>
                          setCouponForm((p) => ({
                            ...p,
                            minPurchase: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Usage Limit">
                      <input
                        type="number"
                        min="0"
                        value={couponForm.usageLimit}
                        onChange={(e) =>
                          setCouponForm((p) => ({
                            ...p,
                            usageLimit: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Expires At">
                      <input
                        type="datetime-local"
                        value={couponForm.expiresAt}
                        onChange={(e) =>
                          setCouponForm((p) => ({
                            ...p,
                            expiresAt: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Description" span2>
                      <textarea
                        rows={2}
                        value={couponForm.description}
                        onChange={(e) =>
                          setCouponForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        className={textareaCls}
                      />
                    </Field>
                  </div>
                  <Toggle
                    label="Active"
                    checked={couponForm.isActive}
                    onChange={(v) =>
                      setCouponForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <div className="flex gap-3">
                    <ActionBtn disabled={savingCoupon} variant="primary">
                      {savingCoupon
                        ? "Saving…"
                        : editingCouponId
                          ? "Update"
                          : "Create"}
                    </ActionBtn>
                    <ActionBtn
                      type="button"
                      onClick={resetCoupon}
                      variant="ghost"
                    >
                      Reset
                    </ActionBtn>
                  </div>
                </form>
              </div>
              <div className="glass rounded-3xl p-6 space-y-3">
                <h2 className="font-display text-xl text-white">
                  Coupon Library
                </h2>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredCoupons.length === 0 ? (
                  <Empty
                    icon={Percent}
                    title="No coupons"
                    desc="Create discount codes above."
                  />
                ) : (
                  filteredCoupons.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between glass rounded-2xl p-4"
                    >
                      <div>
                        <p className="font-semibold text-white font-mono">
                          {c.code}
                        </p>
                        <p className="text-xs text-white/30">
                          {c.discountValue}
                          {c.discountType === "percent" ? "%" : ""} off •{" "}
                          {c.description || "No desc"}
                        </p>
                        <Chip tone={c.isActive === false ? "red" : "green"}>
                          {c.isActive === false ? "Disabled" : "Active"}
                        </Chip>
                      </div>
                      <div className="flex gap-2">
                        <ActionBtn
                          onClick={() => {
                            setEditingCouponId(c._id);
                            setCouponForm({
                              code: c.code || "",
                              description: c.description || "",
                              discountType: c.discountType || "percent",
                              discountValue: c.discountValue ?? "",
                              minPurchase: c.minPurchase ?? "",
                              usageLimit: c.usageLimit ?? "",
                              expiresAt: c.expiresAt
                                ? String(c.expiresAt).slice(0, 16)
                                : "",
                              isActive: c.isActive !== false,
                            });
                          }}
                          variant="ghost"
                          className="text-xs"
                        >
                          Edit
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => deleteCoupon(c._id)}
                          variant="danger"
                          className="text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Reviews ── */}
          {activeSection === "reviews" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass rounded-3xl p-6 space-y-5">
                <h2 className="font-display text-xl text-white">
                  {editingReviewId ? "Edit Review" : "Add / Moderate Review"}
                </h2>
                <form onSubmit={saveReview} className="space-y-4">
                  <Field label="Product" required>
                    <select
                      value={reviewForm.productId}
                      onChange={(e) =>
                        setReviewForm((p) => ({
                          ...p,
                          productId: e.target.value,
                        }))
                      }
                      className={selectCls}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Customer" required>
                    <select
                      value={reviewForm.userId}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, userId: e.target.value }))
                      }
                      className={selectCls}
                    >
                      <option value="">Select customer</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Rating">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((p) => ({
                            ...p,
                            rating: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Status">
                      <select
                        value={reviewForm.status}
                        onChange={(e) =>
                          setReviewForm((p) => ({
                            ...p,
                            status: e.target.value,
                          }))
                        }
                        className={selectCls}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Comment" required>
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((p) => ({
                          ...p,
                          comment: e.target.value,
                        }))
                      }
                      className={textareaCls}
                    />
                  </Field>
                  <div className="flex gap-3">
                    <ActionBtn disabled={savingReview} variant="primary">
                      {savingReview
                        ? "Saving…"
                        : editingReviewId
                          ? "Update"
                          : "Save"}
                    </ActionBtn>
                    <ActionBtn
                      type="button"
                      onClick={resetReview}
                      variant="ghost"
                    >
                      Reset
                    </ActionBtn>
                  </div>
                </form>
              </div>
              <div className="glass rounded-3xl p-6 space-y-3">
                <h2 className="font-display text-xl text-white">
                  Review Moderation
                </h2>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredReviews.length === 0 ? (
                  <Empty
                    icon={Star}
                    title="No reviews"
                    desc="Reviews appear after customers submit them."
                  />
                ) : (
                  filteredReviews.map((r) => (
                    <div
                      key={r._id}
                      className="glass rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {r.productId?.productName || "Unknown"}
                          </p>
                          <p className="text-xs text-white/30">
                            {r.userId?.email || "Unknown"}
                          </p>
                          <p className="text-sm text-white/60 mt-1">
                            {r.comment}
                          </p>
                          <div className="flex gap-1.5 mt-1.5">
                            <Chip tone="amber">{r.rating}★</Chip>
                            <Chip
                              tone={
                                r.status === "approved"
                                  ? "green"
                                  : r.status === "rejected"
                                    ? "red"
                                    : "slate"
                              }
                            >
                              {r.status}
                            </Chip>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <ActionBtn
                            onClick={() => {
                              setEditingReviewId(r._id);
                              setReviewForm({
                                productId: r.productId?._id || "",
                                userId: r.userId?._id || "",
                                rating: r.rating ?? 5,
                                comment: r.comment || "",
                                status: r.status || "pending",
                              });
                            }}
                            variant="ghost"
                            className="text-xs"
                          >
                            Edit
                          </ActionBtn>
                          <ActionBtn
                            onClick={() =>
                              moderateReview(
                                r._id,
                                r.status === "approved"
                                  ? "rejected"
                                  : "approved",
                              )
                            }
                            variant="ghost"
                            className="text-xs"
                          >
                            {r.status === "approved" ? "Reject" : "Approve"}
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => deleteReview(r._id)}
                            variant="danger"
                            className="text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </ActionBtn>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Promotions ── */}
          {activeSection === "promotions" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass rounded-3xl p-6 space-y-5">
                <h2 className="font-display text-xl text-white">
                  {editingPromoId ? "Edit Promotion" : "Create Promotion"}
                </h2>
                <form onSubmit={savePromo} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title" required span2>
                      <input
                        value={promoForm.title}
                        onChange={(e) =>
                          setPromoForm((p) => ({ ...p, title: e.target.value }))
                        }
                        placeholder="Summer Sale"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Type">
                      <select
                        value={promoForm.targetType}
                        onChange={(e) =>
                          setPromoForm((p) => ({
                            ...p,
                            targetType: e.target.value,
                          }))
                        }
                        className={selectCls}
                      >
                        <option value="banner">Banner</option>
                        <option value="campaign">Campaign</option>
                        <option value="featured">Featured</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </Field>
                    <Field label="Banner Image">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setPromotionFile(e.target.files?.[0] || null)
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Starts At">
                      <input
                        type="datetime-local"
                        value={promoForm.startsAt}
                        onChange={(e) =>
                          setPromoForm((p) => ({
                            ...p,
                            startsAt: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Ends At">
                      <input
                        type="datetime-local"
                        value={promoForm.endsAt}
                        onChange={(e) =>
                          setPromoForm((p) => ({
                            ...p,
                            endsAt: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Description" span2>
                      <textarea
                        rows={3}
                        value={promoForm.description}
                        onChange={(e) =>
                          setPromoForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        className={textareaCls}
                      />
                    </Field>
                  </div>
                  <Toggle
                    label="Active"
                    checked={promoForm.isActive}
                    onChange={(v) =>
                      setPromoForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <div className="flex gap-3">
                    <ActionBtn disabled={savingPromo} variant="primary">
                      {savingPromo
                        ? "Saving…"
                        : editingPromoId
                          ? "Update"
                          : "Create"}
                    </ActionBtn>
                    <ActionBtn
                      type="button"
                      onClick={resetPromo}
                      variant="ghost"
                    >
                      Reset
                    </ActionBtn>
                  </div>
                </form>
              </div>
              <div className="glass rounded-3xl p-6 space-y-3">
                <h2 className="font-display text-xl text-white">
                  Promotion Board
                </h2>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredPromos.length === 0 ? (
                  <Empty
                    icon={Megaphone}
                    title="No promotions"
                    desc="Create banners and campaigns above."
                  />
                ) : (
                  filteredPromos.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center gap-4 glass rounded-2xl p-4"
                    >
                      <img
                        src={p.bannerUrl || "/Flux.png"}
                        alt=""
                        className="h-14 w-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-white/30">{p.targetType}</p>
                        <Chip tone={p.isActive === false ? "red" : "green"}>
                          {p.isActive === false ? "Disabled" : "Active"}
                        </Chip>
                      </div>
                      <div className="flex gap-2">
                        <ActionBtn
                          onClick={() => {
                            setEditingPromoId(p._id);
                            setPromoForm({
                              title: p.title || "",
                              description: p.description || "",
                              targetType: p.targetType || "banner",
                              productIds:
                                p.productIds?.map((i) => i._id).join(",") || "",
                              startsAt: p.startsAt
                                ? String(p.startsAt).slice(0, 16)
                                : "",
                              endsAt: p.endsAt
                                ? String(p.endsAt).slice(0, 16)
                                : "",
                              isActive: p.isActive !== false,
                            });
                          }}
                          variant="ghost"
                          className="text-xs"
                        >
                          Edit
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => deletePromo(p._id)}
                          variant="danger"
                          className="text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Media ── */}
          {activeSection === "media" && (
            <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
              <div className="glass rounded-3xl p-6 space-y-5">
                <h2 className="font-display text-xl text-white">
                  Upload Media
                </h2>
                <form onSubmit={saveMedia} className="space-y-4">
                  <Field label="File" required>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setMediaFile(e.target.files?.[0] || null)
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Folder">
                    <input
                      value={mediaForm.folder}
                      onChange={(e) =>
                        setMediaForm((p) => ({ ...p, folder: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Tags">
                    <input
                      value={mediaForm.tags}
                      onChange={(e) =>
                        setMediaForm((p) => ({ ...p, tags: e.target.value }))
                      }
                      placeholder="banner, hero, sale"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Alt Text">
                    <input
                      value={mediaForm.altText}
                      onChange={(e) =>
                        setMediaForm((p) => ({ ...p, altText: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </Field>
                  <ActionBtn
                    disabled={savingMedia}
                    variant="primary"
                    className="w-full justify-center"
                  >
                    {savingMedia ? "Uploading…" : "Upload"}
                  </ActionBtn>
                </form>
              </div>
              <div className="glass rounded-3xl p-6">
                <h2 className="font-display text-xl text-white mb-5">
                  Media Library{" "}
                  <span className="text-sm font-sans font-normal text-white/30">
                    ({filteredMedia.length})
                  </span>
                </h2>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filteredMedia.length === 0 ? (
                  <Empty
                    icon={ImagePlus}
                    title="No media"
                    desc="Upload files above."
                  />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMedia.map((m) => (
                      <div
                        key={m._id}
                        className="group glass rounded-2xl overflow-hidden"
                      >
                        <img
                          src={m.url}
                          alt={m.altText || m.filename}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-3">
                          <p className="text-xs text-white/50 truncate">
                            {m.filename}
                          </p>
                          <ActionBtn
                            onClick={() => deleteMedia(m._id)}
                            variant="danger"
                            className="text-xs mt-2 w-full justify-center py-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </ActionBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Reports ── */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={CreditCard}
                  label="Revenue"
                  value={fmt(reports?.revenue || 0)}
                  detail="All orders"
                  color="from-violet-500 to-purple-600"
                />
                <MetricCard
                  icon={Truck}
                  label="Orders"
                  value={reports?.orders || 0}
                  detail="Tracked"
                  color="from-cyan-500 to-blue-600"
                />
                <MetricCard
                  icon={Users}
                  label="Customers"
                  value={reports?.customers || 0}
                  detail="Registered"
                  color="from-pink-500 to-rose-600"
                />
                <MetricCard
                  icon={FolderKanban}
                  label="Categories"
                  value={categories.length}
                  detail="Total"
                  color="from-amber-500 to-orange-600"
                />
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="glass rounded-3xl p-6 space-y-3">
                  <h2 className="font-display text-xl text-white">
                    Order Status
                  </h2>
                  {reports?.salesByStatus
                    ? Object.entries(reports.salesByStatus).map(([s, c]) => (
                        <div
                          key={s}
                          className="flex items-center justify-between glass rounded-2xl px-4 py-3"
                        >
                          <span className="text-sm capitalize text-white/60">
                            {s}
                          </span>
                          <span className="font-semibold text-white">{c}</span>
                        </div>
                      ))
                    : Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                </div>
                <div className="glass rounded-3xl p-6 space-y-3">
                  <h2 className="font-display text-xl text-white">
                    Top Products
                  </h2>
                  {reports?.topProducts
                    ? reports.topProducts.map((p) => (
                        <div
                          key={p.productName}
                          className="flex items-center justify-between glass rounded-2xl px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {p.productName}
                            </p>
                            <p className="text-xs text-white/30">
                              {p.category}
                            </p>
                          </div>
                          <Chip tone="purple">{p.sold} sold</Chip>
                        </div>
                      ))
                    : Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {activeSection === "settings" && (
            <div className="glass rounded-3xl p-8 max-w-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl font-black text-white">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
                <div>
                  <p className="font-display text-2xl text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-white/40">{user.email}</p>
                  <Chip tone="purple">{user.role}</Chip>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: "Products", v: stats.products },
                  { l: "Active", v: stats.active },
                  { l: "Orders", v: stats.orders },
                  { l: "Customers", v: stats.customers },
                ].map(({ l, v }) => (
                  <div key={l} className="glass rounded-2xl p-4 text-center">
                    <p className="font-display text-2xl text-white">{v}</p>
                    <p className="text-xs text-white/30 mt-1">{l}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionBtn onClick={() => go("orders")} variant="primary">
                  Open Orders
                </ActionBtn>
                <ActionBtn onClick={() => go("products")} variant="ghost">
                  Manage Products
                </ActionBtn>
                <ActionBtn onClick={() => go("customers")} variant="ghost">
                  Manage Customers
                </ActionBtn>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-30 xl:hidden glass border-t border-white/6 px-2 py-2">
        <div className="flex gap-1 overflow-x-auto thin-scroll pb-0.5">
          {SECTION_ORDER.slice(0, 8).map((s) => {
            const { label, icon: Icon } = SECTIONS[s];
            const active = s === activeSection;
            return (
              <button
                key={s}
                onClick={() => go(s)}
                className={`inline-flex flex-col items-center gap-1 flex-shrink-0 px-3 py-2 rounded-2xl text-[10px] font-semibold transition ${active ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-300" : "text-white/40"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── OrderRow ──────────────────────────── */
const OrderRow = ({ order, onSave, onRefund }) => {
  const [status, setStatus] = useState(order.status || "pending");
  const [tracking, setTracking] = useState(order.trackingNumber || "");

  useEffect(() => {
    setStatus(order.status || "pending");
    setTracking(order.trackingNumber || "");
  }, [order]);

  const inputCls = "input-dark text-sm py-2";
  const selectCls = "input-dark text-sm py-2";

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-white">
            #{order._id.slice(-6).toUpperCase()}
          </p>
          <p className="text-xs text-white/40">
            {order.userId?.email || "Unknown"}
          </p>
          <p className="text-sm text-white/60 mt-1">
            Total:{" "}
            <strong className="text-white">{`₹${Number(order.totalAmount || 0).toLocaleString()}`}</strong>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="badge badge-slate">{order.status}</span>
          <span className="badge badge-cyan">
            {order.paymentStatus || "pending"}
          </span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectCls}
        >
          {[
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ].map((s) => (
            <option key={s} value={s} className="bg-[#0f0f14] capitalize">
              {s}
            </option>
          ))}
        </select>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking #"
          className={inputCls}
        />
        <div className="flex gap-2">
          <button
            onClick={() =>
              onSave(order._id, { status, trackingNumber: tracking })
            }
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-300 border border-violet-500/20 hover:from-violet-500/30 transition"
          >
            Save
          </button>
          <button
            onClick={() => onRefund(order._id)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold glass text-white/60 hover:text-white transition"
          >
            Refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
