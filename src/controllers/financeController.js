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
});

export const applyFinance = asyncHandler(async (req, res) => {
  const { error, value } = applySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  let application_number;
  for (let i = 0; i < 5; i++) {
    const candidate = makeAppNumber();
    const exists = await FinanceApplication.findOne({ application_number: candidate });
    if (!exists) { application_number = candidate; break; }
  }
  if (!application_number) application_number = `FIN-${Date.now()}`;

  await FinanceApplication.create({ ...value, application_number, status: "pending" });

  return created(res, { application_number, message: "Application received! Our finance team will call you within 2 hours." });
});

export const listFinanceApplications = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.status) q.status = req.query.status;

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    FinanceApplication.find(q).sort({ submitted_at: -1 }).skip(skip).limit(limit),
    FinanceApplication.countDocuments(q),
  ]);
  return ok(res, items, { total, page, per_page });
});

export const getFinanceApplication = asyncHandler(async (req, res) => {
  const item = await FinanceApplication.findById(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Finance application not found", null, 404);
  return ok(res, item);
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
