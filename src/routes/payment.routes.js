import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";


import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

console.log(
  "✅ SUREPASS_TOKEN LOADED:",
  process.env.SUREPASS_TOKEN?.slice(0, 25)
);  

router.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "payment route alive" });
}); 

/* =========================
   Env for Surepass
========================= */
const SUREPASS_BASE_URL = (
  process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io"
).trim();
const SUREPASS_TOKEN = (process.env.SUREPASS_TOKEN || "").trim();

if (!/^https?:\/\//i.test(SUREPASS_BASE_URL)) {
  console.error(
    `Misconfigured SUREPASS_BASE_URL: "${SUREPASS_BASE_URL}" (must start with http/https)`
  );
}
if (!SUREPASS_TOKEN) {
  console.error("❌ Missing SUREPASS_TOKEN (JWT) in environment");
}

// Build endpoints robustly
const SUREPASS_JSON_ENDPOINT = new URL(
  "/api/v1/credit-report-experian/fetch-report",
  SUREPASS_BASE_URL
).toString();

const SUREPASS_PDF_ENDPOINT = new URL(
  "/api/v1/credit-report-experian/fetch-report-pdf",
  SUREPASS_BASE_URL
).toString();

/* =========================
   Razorpay instance
========================= */
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("❌ Razorpay keys missing in environment");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/* =========================
   Step 1: Create Razorpay order (₹75)
========================= */
router.post("/razorpay/order", async (req, res) => {
  try {
    // ✅ CREATE INSTANCE HERE (lazy init)
    const razor = getRazorpayInstance();

    const order = await razor.orders.create({
      amount: 1 * 100,
      currency: "INR",
      receipt: `cibil_${Date.now()}`,
    });

    console.log("Surepass URL:", SUREPASS_BASE_URL);
    console.log("Surepass token prefix:", SUREPASS_TOKEN?.slice(0, 12));

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


/* =========================
   Step 2: Verify payment + fetch CIBIL JSON
========================= */
router.post("/razorpay/verify-cibil", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      mobile,
      pan,
    } = req.body;

    /* =========================
       Basic validations
    ========================= */
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing Razorpay verification fields" });
    }

    if (!name || !mobile || !pan) {
      return res
        .status(400)
        .json({ ok: false, error: "name, mobile, and pan are required" });
    }

    const mobileStr = String(mobile);
    const panStr = String(pan).toUpperCase();

    if (!/^\d{10}$/.test(mobileStr)) {
      return res
        .status(400)
        .json({ ok: false, error: "mobile must be 10 digits" });
    }

    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(panStr)) {
      return res
        .status(400)
        .json({ ok: false, error: "PAN format invalid (ABCDE1234F)" });
    }

    /* =========================
       Verify Razorpay signature
    ========================= */
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ ok: false, error: "Invalid Razorpay signature" });
    }

    /* =========================
       Call Surepass API
    ========================= */
    const spRes = await axios.post(
      SUREPASS_JSON_ENDPOINT,
      {
        name,
        consent: "Y",
        mobile: mobileStr,
        pan: panStr,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUREPASS_TOKEN}`,
        },
        timeout: 45000,
        validateStatus: () => true,
      }
    );

    if (spRes.status < 200 || spRes.status >= 300) {
      console.error("Surepass non-2xx:", spRes.status, spRes.data);
      return res.status(spRes.status).json({
        ok: false,
        source: "surepass",
        status: spRes.status,
        error: spRes.data?.message || "Surepass error",
        details: spRes.data,
      });
    }

    const data = spRes.data?.data || {};

    /* =========================
       🔄 Sync to CIBIL module
       (NON-BLOCKING)
    ========================= */
    const internalBase = (
      process.env.INTERNAL_API_BASE_URL ||
      process.env.PUBLIC_API_URL ||
      `http://127.0.0.1:${process.env.PORT || 5000}`
    ).replace(/\/$/, "");

    axios
      .post(`${internalBase}/cibil/sync-from-payment`, {
        customer_name: name,
        mobile: mobileStr,
        pan: panStr,
        dob: null,
        cibil_score: data.credit_score ?? null,
        raw_response: data,
        linked_lead_id: null,
        payment_id: razorpay_payment_id,
      })
      .catch((err) => {
        console.error("CIBIL sync failed:", err.message);
      });

    /* =========================
       Final response to frontend
    ========================= */
    return res.json({
      ok: true,
      score: data.credit_score ?? null,
      report_number:
        data.credit_report?.CreditProfileHeader?.ReportNumber ?? null,
      report_date:
        data.credit_report?.CreditProfileHeader?.ReportDate ?? null,
      report_time:
        data.credit_report?.CreditProfileHeader?.ReportTime ?? null,
      raw: data,
    });
  } catch (err) {
    const ax = err && err.isAxiosError ? err : null;
    const status = ax?.response?.status || 500;

    console.error("verify-cibil fatal:", status, err?.message);

    return res.status(status).json({
      ok: false,
      source: "server",
      error: "Failed to verify payment or fetch CIBIL",
    });
  }
});


/* =========================
   Step 3: Fetch Experian PDF (Direct API)
   POST /payment/experian-pdf
========================= */
router.post("/experian-pdf", async (req, res) => {
  try {
    const { name, mobile, pan, consent = "Y" } = req.body;

    if (!name || !mobile || !pan) {
      return res
        .status(400)
        .json({ ok: false, error: "name, mobile, and pan are required" });
    }

    // Call Surepass PDF API
    const spRes = await axios.post(
      SUREPASS_PDF_ENDPOINT,
      { name, consent, mobile, pan },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUREPASS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    const link =
      spRes.data?.data?.credit_report_link ||
      spRes.data?.data?.report_url ||
      spRes.data?.credit_report_link;

    if (!link) {
      throw new Error("No PDF link found in Surepass response");
    }

    return res.json({ ok: true, credit_report_link: link });
  } catch (err) {
    console.error("experian-pdf error:", err?.response?.data || err.message);
    res.status(500).json({ ok: false, error: "Failed to fetch Experian PDF" });
  }
});

export default router;
