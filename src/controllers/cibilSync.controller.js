import { CibilCheck } from "../models/CibilCheck.js";

const scoreBand = (score) => {
  if (typeof score !== "number" || Number.isNaN(score)) return "unknown";
  if (score >= 750) return "excellent";
  if (score >= 700) return "good";
  if (score >= 650) return "average";
  return "poor";
};

export const syncCibilFromPayment = async (req, res) => {
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

    if (!customer_name || !mobile || !pan) {
      return res.status(400).json({
        ok: false,
        error: "customer_name, mobile, and pan are required",
      });
    }

    const panStr = String(pan).toUpperCase();
    const pan_masked = panStr.replace(/^(.{2}).*(.{2})$/, "$1******$2");

    const numericScore =
      cibil_score === null || cibil_score === undefined || cibil_score === ""
        ? undefined
        : Number(cibil_score);
    const resolvedScore =
      typeof numericScore === "number" && !Number.isNaN(numericScore) ? numericScore : undefined;

    const record = await CibilCheck.create({
      customer_name,
      mobile,
      pan_masked,
      dob: dob || null,
      cibil_score: resolvedScore,
      score_band: scoreBand(resolvedScore),
      raw_response: raw_response || {},
      linked_lead_id: linked_lead_id || null,
      payment_id: payment_id || null,
      checked_at: new Date(),
    });

    return res.json({
      ok: true,
      cibil_id: record._id,
    });
  } catch (err) {
    console.error("CIBIL sync error:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to sync CIBIL record",
    });
  }
};
