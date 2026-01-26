import { Router } from "express";
import { listCategories, getCategoryWithProducts, createCategory, updateCategory, deleteCategory } from "../../controllers/categoryController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/", listCategories);
r.get("/:id", getCategoryWithProducts);

// Admin
r.post("/", requireAuth, requireRole(["admin"]), createCategory);
r.put("/:id", requireAuth, requireRole(["admin"]), updateCategory);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteCategory);

export default r;
