import { Router } from "express";
import {
  getDashboardStats,
  getRecentLeads,
  getLeadsOverTime,
  getFinanceStatus,
  getWebsiteTraffic,
} from "../../controllers/dashboardController.js";

import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

r.use(requireAuth);
r.use(requireRole(["master_admin", "staff"]));

r.get("/stats", getDashboardStats);
r.get("/recent-leads", getRecentLeads);
r.get("/leads-over-time", getLeadsOverTime);
r.get("/finance-status", getFinanceStatus);
r.get("/traffic", getWebsiteTraffic);

export default r;
