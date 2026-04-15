import crypto from "crypto";
import Joi from "joi";
import { getRazorpayClient } from "../config/razorpay.js";
import { surepassClient } from "../config/surepass.js";
import { Payment } from "../models/Payment.js";
import { CibilCheck } from "../models/CibilCheck.js";
import { Lead } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createOrderSchema = Joi.object({
  customer_name: Joi.string().required(),
  mobile: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
  pan: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
  dob: Joi.string().required(), // keep string because formats vary (YYYY-MM-DD recommended)
  linked_lead_id: Joi.string().allow("", null),
});

export const createCibilPaymentOrder = asyncHandler(async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const amount = 100; // Testing only: charge Rs. 1
  const rzp = getRazorpayClient();

  const order = await rzp.orders.create({
    amount,
    currency: "INR",
    receipt: `cibil_${Date.now()}`,
    notes: { purpose: "cibil_check", mobile: value.mobile },
    payment_capture: 0,
  });

  const payment = await Payment.create({
    purpose: "cibil_check",
    amount: amount / 100,
    currency: "INR",
    razorpay_order_id: order.id,
    status: "created",
    customer_name: value.customer_name,
    mobile: value.mobile,
    metadata: { pan: value.pan, dob: value.dob, linked_lead_id: value.linked_lead_id || null },
  });

  // Send key_id so frontend can open Razorpay checkout
  return created(res, {
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    order: { id: order.id, amount: order.amount, currency: order.currency },
    payment_id: payment._id,
  });
});

const verifySchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

function scoreBand(score) {
  if (typeof score !== "number") return "unknown";
  if (score >= 750) return "excellent";
  if (score >= 700) return "good";
  if (score >= 650) return "average";
  return "poor";
}

export const verifyCibilPaymentAndCheck = asyncHandler(async (req, res) => {
  const { error, value } = verifySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const payment = await Payment.findOne({ razorpay_order_id: value.razorpay_order_id });
  if (!payment) return fail(res, "NOT_FOUND", "Payment order not found", null, 404);
  if (payment.status === "paid") {
    // already checked
    const existing = await CibilCheck.findOne({ payment_id: payment._id }).sort({ checked_at: -1 });
    return ok(res, existing || { message: "Payment already verified" });
  }

  const body = `${value.razorpay_order_id}|${value.razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
  if (expected !== value.razorpay_signature) return fail(res, "UNAUTHORIZED", "Invalid Razorpay signature", null, 401);

  const rzp = getRazorpayClient();
  const razorpayPayment = await rzp.payments.fetch(value.razorpay_payment_id);

  payment.razorpay_payment_id = value.razorpay_payment_id;
  payment.razorpay_signature = value.razorpay_signature;
  payment.status = "authorized";
  await payment.save();

  // Call Surepass
  const sp = surepassClient();
  const endpoint = process.env.SUREPASS_CIBIL_ENDPOINT || "/v1/credit-score/cibil";
  const payload = {
    name: payment.customer_name,
    mobile: payment.mobile,
    pan: payment.metadata?.pan,
    dob: payment.metadata?.dob,
  };

  let resp;
  try {
    resp = await sp.post(endpoint, payload);
  } catch (e) {
    const details = e.response?.data || { message: e.message };
    payment.status = razorpayPayment.status === "captured" ? "refunded" : "provider_failed";
    payment.provider_error = details;

    if (razorpayPayment.status === "captured") {
      try {
        const refund = await rzp.payments.refund(value.razorpay_payment_id, {
          amount: razorpayPayment.amount,
          notes: {
            purpose: "cibil_provider_failed",
            reason: "Surepass call failed",
          },
        });
        payment.refund_id = refund.id;
      } catch (refundError) {
        payment.status = "provider_failed";
        payment.provider_error = {
          ...details,
          refund_error: refundError?.error?.description || refundError.message,
        };
      }
    }

    await payment.save();
    return fail(
      res,
      "SUREPASS_ERROR",
      "CIBIL provider error. Payment was not captured, and any captured amount is being refunded.",
      payment.provider_error || details,
      502
    );
  }

  const latestPayment = await rzp.payments.fetch(value.razorpay_payment_id);
  if (latestPayment.status !== "captured") {
    await rzp.payments.capture(value.razorpay_payment_id, latestPayment.amount, latestPayment.currency);
  }

  // NOTE: Surepass response shape differs by plan. We store raw and try to extract score safely.
  const raw = resp.data;
  const score =
    raw?.data?.score ??
    raw?.score ??
    raw?.cibil_score ??
    raw?.data?.cibil_score ??
    null;

  const panMasked = String(payment.metadata?.pan || "").replace(/^(.{2}).*(.{2})$/, "$1******$2");

  const check = await CibilCheck.create({
    customer_name: payment.customer_name,
    mobile: payment.mobile,
    pan_masked: panMasked || undefined,
    dob: payment.metadata?.dob,
    cibil_score: typeof score === "number" ? score : (score ? Number(score) : undefined),
    score_band: scoreBand(typeof score === "number" ? score : (score ? Number(score) : undefined)),
    raw_response: raw,
    linked_lead_id: payment.metadata?.linked_lead_id || null,
    payment_id: payment._id,
    checked_at: new Date(),
  });

  payment.status = "paid";
  payment.provider_error = null;
  await payment.save();

  return ok(res, {
    id: check._id,
    customer_name: check.customer_name,
    mobile: check.mobile,
    pan: check.pan_masked,
    dob: check.dob,
    cibil_score: check.cibil_score,
    score_band: check.score_band,
    checked_at: check.checked_at,
    linked_lead_id: check.linked_lead_id,
  });
});

export const listCibilChecks = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.search) {
    q.$or = [
      { customer_name: { $regex: String(req.query.search), $options: "i" } },
      { mobile: { $regex: String(req.query.search), $options: "i" } },
    ];
  }
  if (req.query.min_score || req.query.max_score) {
    q.cibil_score = {};
    if (req.query.min_score) q.cibil_score.$gte = Number(req.query.min_score);
    if (req.query.max_score) q.cibil_score.$lte = Number(req.query.max_score);
  }

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    CibilCheck.find(q).sort({ checked_at: -1 }).skip(skip).limit(limit),
    CibilCheck.countDocuments(q),
  ]);

  const mapped = items.map(c => ({
  id: c._id.toString(),

  customerName: c.customer_name,
  mobile: c.mobile,

  panNumber: c.pan_masked,        // already masked
  dateOfBirth: c.dob,

  score: c.cibil_score ?? 0,
  scoreBand: c.score_band
    ? c.score_band.charAt(0).toUpperCase() + c.score_band.slice(1)
    : "Unknown",

  checkedAt: c.checked_at,
}));

return ok(res, mapped, { total, page, per_page });

});

export const cibilAnalytics = asyncHandler(async (_req, res) => {
  const total = await CibilCheck.countDocuments();
  return ok(res, { total_cibil_checks: total });
});
