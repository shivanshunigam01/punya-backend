import { Router } from "express";
import { listTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial } from "../../controllers/testimonialController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public (active only by query)
r.get("/", listTestimonials);
r.get("/:id", getTestimonial);

// Admin
r.post("/", requireAuth, requireRole(["admin"]), createTestimonial);
r.put("/:id", requireAuth, requireRole(["admin"]), updateTestimonial);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteTestimonial);

export default r;
