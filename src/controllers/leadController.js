import Joi from "joi";
import { nanoid } from "nanoid";
import { Lead } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

function makeLeadNumber() {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `PVS-${n}`;
}

const createSchema = Joi.object({
  source: Joi.string().required(),
  source_page: Joi.string().allow("", null),
  source_product_id: Joi.string().allow("", null),
  customer_name: Joi.string().required(),
  customer_mobile: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
  customer_email: Joi.string().email().allow("", null),
  customer_district: Joi.string().allow("", null),
  customer_address: Joi.string().allow("", null),
  brand_interest: Joi.string().allow("", null),
  product_interest: Joi.string().allow("", null),
  vehicle_type_interest: Joi.string().allow("", null),
  budget_range: Joi.string().allow("", null),
  utm_source: Joi.string().allow("", null),
  utm_medium: Joi.string().allow("", null),
  utm_campaign: Joi.string().allow("", null),
});

export const createLead = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  // generate unique lead number (retry few times)
  let lead_number;
  for (let i = 0; i < 5; i++) {
    const candidate = makeLeadNumber();
    const exists = await Lead.findOne({ lead_number: candidate });
    if (!exists) { lead_number = candidate; break; }
  }
  if (!lead_number) lead_number = `PVS-${Date.now()}`;

  const lead = await Lead.create({
    ...value,
    lead_number,
    source_product_id: value.source_product_id || null,
    status: "new",
    priority: "medium",
    client_meta: req.clientInfo,
  });

  return created(res, { lead_number: lead.lead_number, message: "Enquiry received! Our team will call you within 30 minutes." });
});

export const listLeads = asyncHandler(async (req, res) => {
  const {
    status, source, brand_interest, assigned_to, priority, date_from, date_to, search, sort_by
  } = req.query;

  const q = {};
  if (status) q.status = status;
  if (source) q.source = source;
  if (brand_interest) q.brand_interest = brand_interest;
  if (assigned_to) q.assigned_to = assigned_to;
  if (priority) q.priority = priority;

  if (date_from || date_to) {
    q.created_at = {};
    if (date_from) q.created_at.$gte = new Date(String(date_from));
    if (date_to) q.created_at.$lte = new Date(String(date_to));
  }

  if (search) {
    q.$or = [
      { customer_name: { $regex: String(search), $options: "i" } },
      { customer_mobile: { $regex: String(search), $options: "i" } },
      { lead_number: { $regex: String(search), $options: "i" } },
    ];
  }

  let sort = { created_at: -1 };
  if (sort_by === "oldest") sort = { created_at: 1 };
  if (sort_by === "priority") sort = { priority: 1, created_at: -1 };

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total, todayNew, pending_followup, unassigned] = await Promise.all([
    Lead.find(q).sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(q),
    Lead.countDocuments({ created_at: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
    Lead.countDocuments({ status: "follow_up" }),
    Lead.countDocuments({ assigned_to: null }),
  ]);

  return ok(res, items, { total, page, per_page, new_today: todayNew, pending_followup, unassigned });
});

export const getLead = asyncHandler(async (req, res) => {
  const item = await Lead.findById(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Lead not found", null, 404);
  return ok(res, item);
});

export const updateLead = asyncHandler(async (req, res) => {
  const schema = createSchema.min(1);
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const item = await Lead.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Lead not found", null, 404);
  return ok(res, item);
});

export const patchLeadStatus = asyncHandler(async (req, res) => {
  const schema = Joi.object({ status: Joi.string().required(), note: Joi.string().allow("", null) });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, "NOT_FOUND", "Lead not found", null, 404);

  lead.status = value.status;
  if (value.note) {
    lead.notes.push({ note: value.note, created_by: req.user.id });
  }
  if (value.status === "contacted") lead.last_contacted_at = new Date();
  if (value.status === "converted") lead.converted_at = new Date();

  await lead.save();
  return ok(res, lead);
});

export const assignLead = asyncHandler(async (req, res) => {
  const schema = Joi.object({ assigned_to: Joi.string().required() });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, "NOT_FOUND", "Lead not found", null, 404);

  lead.assigned_to = value.assigned_to;
  lead.assigned_at = new Date();
  await lead.save();

  return ok(res, lead);
});

export const addLeadNote = asyncHandler(async (req, res) => {
  const schema = Joi.object({ note: Joi.string().required() });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, "NOT_FOUND", "Lead not found", null, 404);

  lead.notes.push({ note: value.note, created_by: req.user.id });
  await lead.save();
  return ok(res, lead);
});

export const leadDashboard = asyncHandler(async (_req, res) => {
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(); monthStart.setDate(monthStart.getDate() - 30);

  const [todayNew, weekNew, monthNew, by_source, by_brand, pending_followup, unassigned] = await Promise.all([
    Lead.countDocuments({ created_at: { $gte: todayStart } }),
    Lead.countDocuments({ created_at: { $gte: weekStart } }),
    Lead.countDocuments({ created_at: { $gte: monthStart } }),
    Lead.aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: "$brand_interest", count: { $sum: 1 } } }]),
    Lead.countDocuments({ status: "follow_up" }),
    Lead.countDocuments({ assigned_to: null }),
  ]);

  const mapAgg = (arr) => arr.reduce((acc, r) => { if (r._id) acc[r._id] = r.count; return acc; }, {});

  return ok(res, {
    today: { new: todayNew },
    this_week: { new: weekNew },
    this_month: { new: monthNew },
    by_source: mapAgg(by_source),
    by_brand: mapAgg(by_brand),
    pending_followup,
    unassigned,
  });
});
