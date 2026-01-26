import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimiters.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createContact, listContacts, patchContactStatus } from "../../controllers/contactController.js";

const r = Router();

// Public
r.post("/", rateLimiters.contact, createContact);

// Admin
r.get("/", requireAuth, requireRole(["admin","staff"]), listContacts);
r.patch("/:id/status", requireAuth, requireRole(["admin","staff"]), patchContactStatus);

export default r;
