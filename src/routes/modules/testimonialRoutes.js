import { Router } from "express";
import { listTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial } from "../../controllers/testimonialController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public (active only by query)
r.get("/", listTestimonials);
r.get("/:id", getTestimonial);

// Admin
r.post("/", requireAuth, requireRole(["master_admin", "admin"]), createTestimonial);
r.put("/:id", requireAuth, requireRole(["master_admin", "admin"]), updateTestimonial);
r.delete("/:id", requireAuth, requireRole(["master_admin", "admin"]), deleteTestimonial);

export default r;
