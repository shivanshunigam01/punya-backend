import { FinanceLead } from "../models/FinanceLead.js";

export const createFinanceLead = async (req, res) => {
  try {
    const {
      vehicleType,
      business,
      name,
      mobile,
      district,
      source,
    } = req.body;

    // ✅ Validation
    if (!vehicleType || !business || !name || !mobile || !district) {
      return res.status(400).json({
        ok: false,
        error: "All fields are required",
      });
    }

    if (!/^\d{10}$/.test(String(mobile))) {
      return res.status(400).json({
        ok: false,
        error: "Mobile number must be 10 digits",
      });
    }

    // ✅ Save lead
    const lead = await FinanceLead.create({
      vehicle_type: vehicleType,
      business_type: business,
      customer_name: name,
      mobile: String(mobile),
      district,
      source: source || "Finance Page",
    });

    return res.status(201).json({
      ok: true,
      message: "Finance application submitted successfully",
      lead_id: lead._id,
    });
  } catch (err) {
    console.error("Finance lead error:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to submit finance application",
    });
  }
};
