import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimiters.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createLead, listLeads, getLead, updateLead, patchLeadStatus, assignLead, addLeadNote, leadDashboard } from "../../controllers/leadController.js";

const r = Router();

// Public
r.post("/", rateLimiters.leads, createLead);

// Admin
r.get("/", requireAuth, requireRole(["master_admin","staff"]), listLeads);
r.get("/dashboard", requireAuth, requireRole(["master_admin","staff"]), leadDashboard);
r.get("/:id", requireAuth, requireRole(["master_admin","staff"]), getLead);
r.put("/:id", requireAuth, requireRole(["master_admin","staff"]), updateLead);
r.patch("/:id/status", requireAuth, requireRole(["master_admin","staff"]), patchLeadStatus);
r.patch("/:id/assign", requireAuth, requireRole(["master_admin"]), assignLead);
r.post("/:id/notes", requireAuth, requireRole(["master_admin","staff"]), addLeadNote);

export default r;
