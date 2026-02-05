import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimiters.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createCibilPaymentOrder, verifyCibilPaymentAndCheck, listCibilChecks, cibilAnalytics } from "../../controllers/cibilController.js";
import { CibilCheck } from "../../models/CibilCheck.js";

const r = Router();

// Public (payment + verification)
r.post("/create-order", rateLimiters.cibil, createCibilPaymentOrder);
r.post("/verify-and-check", rateLimiters.cibil, verifyCibilPaymentAndCheck);

// Admin (list + analytics)
r.get("/", requireAuth, requireRole(["master_admin","staff"]), listCibilChecks);
r.get("/analytics", requireAuth, requireRole(["master_admin","staff"]), cibilAnalytics);

/* =========================
   🔄 Sync from payment module
   PUBLIC (internal call)
========================= */
r.post("/sync-from-payment", async (req, res) => {
  try {
    const {
      customer_name,
      mobile,
      pan,
      dob,
      cibil_score,
      raw_response,
      linked_lead_id,
      payment_id,
    } = req.body;

    if (!customer_name || !mobile) {
      return res.status(400).json({
        ok: false,
        error: "customer_name and mobile are required",
      });
    }

    // mask PAN safely
    const panMasked = pan
      ? `${pan.slice(0, 2)}XXXX${pan.slice(-2)}`
      : null;

    const scoreBand =
      cibil_score >= 750
        ? "excellent"
        : cibil_score >= 700
        ? "good"
        : cibil_score >= 650
        ? "average"
        : cibil_score
        ? "poor"
        : "unknown";

    await CibilCheck.create({
      customer_name,
      mobile,
      pan_masked: panMasked,
      dob,
      cibil_score,
      score_band: scoreBand,
      raw_response,
      linked_lead_id,
      payment_id,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("CIBIL sync error:", err.message);
    return res.status(500).json({
      ok: false,
      error: "Failed to sync CIBIL data",
    });
  }
});                             

r.post("/sync-from-payment", async (req, res) => {
  try {
    const {
      customer_name,
      mobile,
      pan,
      dob,
      cibil_score,
      raw_response,
      linked_lead_id,
      payment_id,
    } = req.body;

    if (!customer_name || !mobile) {
      return res.status(400).json({
        ok: false,
        error: "customer_name and mobile are required",
      });
    }

    // Mask PAN
    const pan_masked = pan
      ? pan.slice(0, 2) + "XXXX" + pan.slice(-2)
      : null;

    // Score band logic
    let score_band = "unknown";
    if (cibil_score >= 750) score_band = "excellent";
    else if (cibil_score >= 700) score_band = "good";
    else if (cibil_score >= 650) score_band = "average";
    else if (cibil_score !== null) score_band = "poor";

    await CibilCheck.create({
      customer_name,
      mobile,
      pan_masked,
      dob,
      cibil_score,
      score_band,
      raw_response,
      linked_lead_id,
      payment_id,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("CIBIL sync error:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to sync CIBIL data",
    });
  }
});


export default r;
