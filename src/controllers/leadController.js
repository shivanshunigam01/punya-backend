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
    if (date_from) q.created_at.$gte = new Date(date_from);
    if (date_to) q.created_at.$lte = new Date(date_to);
  }

  if (search) {
    q.$or = [
      { customer_name: { $regex: search, $options: "i" } },
      { customer_mobile: { $regex: search, $options: "i" } },
      { lead_number: { $regex: search, $options: "i" } },
    ];
  }

  const items = await Lead.find(q).sort({ created_at: -1 });

  // ✅ MAP FOR FRONTEND
const mapped = items.map(l => ({
  id: l._id.toString(),

  customerName: l.customer_name,
  mobile: l.customer_mobile,
  email: l.customer_email,

  productName: l.product_interest,
  brand: l.brand_interest,

  source: l.source,
  status: l.status,

  notes: l.notes.map(n => n.note),

  utmSource: l.utm_source,
  utmMedium: l.utm_medium,
  utmCampaign: l.utm_campaign,

  createdAt: l.created_at,
  updatedAt: l.updated_at,
}));

return ok(res, mapped, {
  total: mapped.length,
});
});


export const getLead = asyncHandler(async (req, res) => {
  const l = await Lead.findById(req.params.id).populate("assigned_to", "name");
  if (!l) return fail(res, "NOT_FOUND", "Lead not found", null, 404);

  return ok(res, {
    id: l._id,
    leadNumber: l.lead_number,

    customerName: l.customer_name,
    mobile: l.customer_mobile,
    email: l.customer_email,

    brand: l.brand_interest,
    productName: l.product_interest,

    source: l.source,
    status: l.status,

    createdAt: l.created_at,

    notes: l.notes.map(n => n.note),

    utmSource: l.utm_source,
    utmMedium: l.utm_medium,
    utmCampaign: l.utm_campaign,
  });
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

 return ok(res, {
  id: lead._id.toString(),

  customerName: lead.customer_name,
  mobile: lead.customer_mobile,
  email: lead.customer_email,

  productName: lead.product_interest,
  brand: lead.brand_interest,

  source: lead.source,
  status: lead.status,

  notes: lead.notes.map(n => n.note),

  utmSource: lead.utm_source,
  utmMedium: lead.utm_medium,
  utmCampaign: lead.utm_campaign,

  createdAt: lead.created_at,
  updatedAt: lead.updated_at,
});

});               

export const addLeadNote = asyncHandler(async (req, res) => {
  const schema = Joi.object({ note: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) throw error;

  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, "NOT_FOUND", "Lead not found", null, 404);

  lead.notes.push({ note: value.note, created_by: req.user.id });
  await lead.save();

  return ok(res, {
    id: lead._id,
    notes: lead.notes.map(n => n.note),
  });
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
