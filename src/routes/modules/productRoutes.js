import { Router } from "express";
import { listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, compareProducts } from "../../controllers/productController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/", listProducts);
r.get("/compare", compareProducts);
r.get("/:slug", getProductBySlug);

// Admin
r.post("/", requireAuth, requireRole(["admin"]), createProduct);
r.put("/:id", requireAuth, requireRole(["admin"]), updateProduct);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteProduct);

export default r;
