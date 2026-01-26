import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimiters.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createLead, listLeads, getLead, updateLead, patchLeadStatus, assignLead, addLeadNote, leadDashboard } from "../../controllers/leadController.js";

const r = Router();

// Public
r.post("/", rateLimiters.leads, createLead);

// Admin
r.get("/", requireAuth, requireRole(["admin","staff"]), listLeads);
r.get("/dashboard", requireAuth, requireRole(["admin","staff"]), leadDashboard);
r.get("/:id", requireAuth, requireRole(["admin","staff"]), getLead);
r.put("/:id", requireAuth, requireRole(["admin","staff"]), updateLead);
r.patch("/:id/status", requireAuth, requireRole(["admin","staff"]), patchLeadStatus);
r.patch("/:id/assign", requireAuth, requireRole(["admin"]), assignLead);
r.post("/:id/notes", requireAuth, requireRole(["admin","staff"]), addLeadNote);

export default r;
