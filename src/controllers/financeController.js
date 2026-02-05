import Joi from "joi";
import { FinanceApplication } from "../models/FinanceApplication.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

function makeAppNumber() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `FIN-${n}`;
}

const applySchema = Joi.object({
  vehicle_type: Joi.string().required(),
  business_type: Joi.string().required(),
  approximate_budget: Joi.number().min(0).required(),
  applicant_name: Joi.string().required(),
  applicant_mobile: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
  applicant_district: Joi.string().required(),
  linked_lead_id: Joi.string().allow("", null),
  linked_product_id: Joi.string().allow("", null),
  applicant_email: Joi.string().email().allow("", null),
});

// export const applyFinance = asyncHandler(async (req, res) => {
//   const { error, value } = applySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
//   if (error) throw error;

//   let application_number;
//   for (let i = 0; i < 5; i++) {
//     const candidate = makeAppNumber();
//     const exists = await FinanceApplication.findOne({ application_number: candidate });
//     if (!exists) { application_number = candidate; break; }
//   }
//   if (!application_number) application_number = `FIN-${Date.now()}`;

//   await FinanceApplication.create({ ...value, application_number, status: "pending" });

//   return created(res, { application_number, message: "Application received! Our finance team will call you within 2 hours." });
// });

export const listFinanceApplications = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.status) q.status = req.query.status;

  const { page, per_page, skip, limit } = parsePagination(req.query);

  const [items, total] = await Promise.all([
    FinanceApplication.find(q)
      .populate("linked_product_id", "name")
      .sort({ submitted_at: -1 })
      .skip(skip)
      .limit(limit),
    FinanceApplication.countDocuments(q),
  ]);

  const mapped = items.map(a => ({
    id: a._id.toString(),
    applicationNumber: a.application_number,

    customerName: a.applicant_name,
    mobile: a.applicant_mobile,
    district: a.applicant_district,

    productId: a.linked_product_id?._id,
    productName: a.linked_product_id?.name || null,

    loanAmount: a.approximate_budget,
    tenure: null, // optional – add later if EMI module comes

    status: a.status,

    documents: (a.documents_list || []).map(d => ({
      type: d,
      url: `/uploads/docs/${d}`,
      uploadedAt: a.created_at,
    })),

    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }));

  return ok(res, mapped, { total, page, per_page });
});


export const getFinanceApplication = asyncHandler(async (req, res) => {
  const a = await FinanceApplication.findById(req.params.id)
    .populate("linked_product_id", "name");

  if (!a) return fail(res, "NOT_FOUND", "Finance application not found", null, 404);

  return ok(res, {
    id: a._id.toString(),
    applicationNumber: a.application_number,

    customerName: a.applicant_name,
    mobile: a.applicant_mobile,
    district: a.applicant_district,

    productId: a.linked_product_id?._id,
    productName: a.linked_product_id?.name || null,

    loanAmount: a.approximate_budget,
    status: a.status,

    documents: (a.documents_list || []).map(d => ({
      type: d,
      url: `/uploads/docs/${d}`,
      uploadedAt: a.created_at,
    })),

    createdAt: a.created_at,
    updatedAt: a.updated_at,
  });
});


export const patchFinanceStatus = asyncHandler(async (req, res) => {
  const schema = Joi.object({ status: Joi.string().valid("pending","under_review","approved","rejected","disbursed").required(), internal_notes: Joi.string().allow("", null) });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const update = { status: value.status };
  if (value.internal_notes) update.internal_notes = value.internal_notes;
  if (value.status === "under_review") update.reviewed_at = new Date();
  if (value.status === "approved") update.approved_at = new Date();

  const item = await FinanceApplication.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Finance application not found", null, 404);
  return ok(res, item);
});


export const applyFinance = async (req, res) => {
  try {
    const {
      vehicleType,
      business,
      name,
      mobile,
      district,
      approximateBudget,
      email,
      source,
    } = req.body;

    // 🔒 Validation
    if (!vehicleType || !business || !name || !mobile || !district) {
      return res.status(400).json({
        ok: false,
        error: "Required fields missing",
      });
    }

    if (!/^\d{10}$/.test(String(mobile))) {
      return res.status(400).json({
        ok: false,
        error: "Mobile number must be 10 digits",
      });
    }

    // 🧾 Generate Application Number
    const applicationNumber = `FIN-${Date.now()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // 💾 Save application
    const application = await FinanceApplication.create({
      application_number: applicationNumber,

      vehicle_type: vehicleType,
      business_type: business,
      approximate_budget: approximateBudget || null,

      applicant_name: name,
      applicant_mobile: mobile,
      applicant_district: district,
      applicant_email: email || null,

      status: "pending",
    });

    return res.json({
      ok: true,
      message: "Finance application submitted successfully",
      application_number: application.application_number,
      id: application._id,
    });
  } catch (err) {
    console.error("applyFinance error:", err);

    // Handle duplicate application_number (very rare)
    if (err.code === 11000) {
      return res.status(500).json({
        ok: false,
        error: "Please retry submission",
      });
    }

    return res.status(500).json({
      ok: false,
      error: "Failed to submit finance application",
    });
  }
};