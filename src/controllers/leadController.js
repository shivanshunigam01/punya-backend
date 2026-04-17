import Joi from "joi";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { Lead } from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createSchema = Joi.object({
  source: Joi.string().required(),
  source_page: Joi.string().allow("", null),
  source_product_id: Joi.string().allow("", null),
  source_product_name: Joi.string().allow("", null),
  customer_name: Joi.string().required(),
  customer_mobile: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
  customer_email: Joi.string().email().allow("", null),
  customer_state: Joi.string().allow("", null),
  customer_city: Joi.string().allow("", null),
  customer_district: Joi.string().allow("", null),
  customer_address: Joi.string().allow("", null),
  customer_pincode: Joi.string().pattern(/^\d{6}$/).allow("", null),
  brand_interest: Joi.string().allow("", null),
  product_interest: Joi.string().allow("", null),
  vehicle_type_interest: Joi.string().allow("", null),
  budget_range: Joi.string().allow("", null),
  utm_source: Joi.string().allow("", null),
  utm_medium: Joi.string().allow("", null),
  utm_campaign: Joi.string().allow("", null),
  compared_product_ids: Joi.array().items(Joi.string()).default([]),
  compared_product_names: Joi.array().items(Joi.string()).default([]),
  cibil_checked: Joi.boolean().default(false),
  cibil_score: Joi.number().min(0).max(900).allow(null),
  cibil_score_band: Joi.string().allow("", null),
  is_strong_lead: Joi.boolean().default(false),
  status: Joi.string().valid("new", "contacted", "qualified", "converted", "lost", "C0", "C1", "C2", "C3").allow("", null),
  note: Joi.string().allow("", null),
});

export const createLead = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.customer_mobile != null) {
    body.customer_mobile = String(body.customer_mobile).replace(/\D/g, "").slice(-10);
  }
  const { error, value } = createSchema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const sourceProductId =
    value.source_product_id && mongoose.Types.ObjectId.isValid(value.source_product_id)
      ? value.source_product_id
      : undefined;
  const comparedProductIds = (value.compared_product_ids || []).filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const isCompareLead = String(value.source || "").toLowerCase().includes("compare");
  const shouldBeStrongLead = Boolean(value.is_strong_lead || isCompareLead);
  const leadStatus = value.status || (shouldBeStrongLead ? "C0" : "new");

  const notes = [];
  if (value.note && String(value.note).trim()) {
    notes.push({ note: String(value.note).trim(), created_by: null });
  }

  const lead = await Lead.create({
    lead_number: `LD-${Date.now()}-${nanoid(6)}`,
    source: value.source,
    source_page: value.source_page || undefined,
    source_product_id: sourceProductId,
    source_product_name: value.source_product_name || undefined,
    customer_name: value.customer_name,
    customer_mobile: value.customer_mobile,
    customer_email: value.customer_email?.trim() || undefined,
    customer_state: value.customer_state || undefined,
    customer_city: value.customer_city || undefined,
    customer_district: value.customer_district || undefined,
    customer_address: value.customer_address || undefined,
    customer_pincode: value.customer_pincode || undefined,
    brand_interest: value.brand_interest || undefined,
    product_interest: value.product_interest || undefined,
    vehicle_type_interest: value.vehicle_type_interest || undefined,
    budget_range: value.budget_range || undefined,
    utm_source: value.utm_source || undefined,
    utm_medium: value.utm_medium || undefined,
    utm_campaign: value.utm_campaign || undefined,
    compared_product_ids: comparedProductIds,
    compared_product_names: (value.compared_product_names || []).filter(Boolean),
    cibil_checked: Boolean(value.cibil_checked),
    cibil_score: value.cibil_score ?? undefined,
    cibil_score_band: value.cibil_score_band || undefined,
    is_strong_lead: shouldBeStrongLead,
    status: leadStatus,
    priority: "medium",
    notes,
    client_meta: {
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      referrer: req.clientInfo?.referrer,
    },
  });

  return created(res, {
    id: lead._id.toString(),
    lead_number: lead.lead_number,
  });
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
      { customer_email: { $regex: search, $options: "i" } },
      { product_interest: { $regex: search, $options: "i" } },
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
  state: l.customer_state,
  city: l.customer_city,
  district: l.customer_district,
  address: l.customer_address,
  pincode: l.customer_pincode,

  productName: l.product_interest,
  brand: l.brand_interest,

  source: l.source,
  status: l.status,
  isStrongLead: Boolean(l.is_strong_lead),
  cibilChecked: Boolean(l.cibil_checked),
  cibilScore: l.cibil_score,
  cibilScoreBand: l.cibil_score_band,
  comparedProductNames: l.compared_product_names || [],

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
  state: l.customer_state,
  city: l.customer_city,
  district: l.customer_district,
  address: l.customer_address,
  pincode: l.customer_pincode,

    brand: l.brand_interest,
    productName: l.product_interest,

    source: l.source,
    status: l.status,
  isStrongLead: Boolean(l.is_strong_lead),
  cibilChecked: Boolean(l.cibil_checked),
  cibilScore: l.cibil_score,
  cibilScoreBand: l.cibil_score_band,
  comparedProductNames: l.compared_product_names || [],

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
  const schema = Joi.object({
    status: Joi.string().valid("new", "contacted", "qualified", "converted", "lost", "C0", "C1", "C2", "C3").required(),
    note: Joi.string().allow("", null),
  });
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
  state: lead.customer_state,
  city: lead.customer_city,
  district: lead.customer_district,
  address: lead.customer_address,
  pincode: lead.customer_pincode,

  productName: lead.product_interest,
  brand: lead.brand_interest,

  source: lead.source,
  status: lead.status,
  isStrongLead: Boolean(lead.is_strong_lead),
  cibilChecked: Boolean(lead.cibil_checked),
  cibilScore: lead.cibil_score,
  cibilScoreBand: lead.cibil_score_band,
  comparedProductNames: lead.compared_product_names || [],

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
