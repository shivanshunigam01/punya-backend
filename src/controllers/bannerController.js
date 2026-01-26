import Joi from "joi";
import { Banner } from "../models/Banner.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const bannerSchema = Joi.object({
  page: Joi.string().valid("home","jcb","ashok_leyland","switch_ev","used_vehicles","finance").required(),
  title: Joi.string().required(),
  subtitle: Joi.string().allow("", null),
  background_image: Joi.string().uri().allow("", null),
  background_video: Joi.string().uri().allow("", null),
  overlay_opacity: Joi.number().min(0).max(100).default(40),
  cta_buttons: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      type: Joi.string().valid("primary","secondary","outline").default("primary"),
      action: Joi.string().valid("call","whatsapp","enquiry","link").default("link"),
      link: Joi.string().allow("", null),
      phone: Joi.string().allow("", null),
      icon: Joi.string().allow("", null),
    })
  ).default([]),
  trust_badges: Joi.array().items(Joi.string()).default([]),
  customer_count: Joi.number().integer().min(0).allow(null),
  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().default(0),
});

export const listBanners = asyncHandler(async (req, res) => {
  const { page, is_active } = req.query;
  const { page: pg, per_page, skip, limit } = parsePagination(req.query);
  const q = {};
  if (page) q.page = page;
  if (typeof is_active !== "undefined") q.is_active = is_active === "true";
  const [items, total] = await Promise.all([
    Banner.find(q).sort({ page: 1, display_order: 1 }).skip(skip).limit(limit),
    Banner.countDocuments(q),
  ]);
  return ok(res, items, { total, page: pg, per_page });
});

export const getActiveBannerByPage = asyncHandler(async (req, res) => {
  const b = await Banner.findOne({ page: req.params.page, is_active: true }).sort({ display_order: 1 });
  if (!b) return fail(res, "NOT_FOUND", "No active banner for this page", null, 404);
  return ok(res, b);
});

export const createBanner = asyncHandler(async (req, res) => {
  const { error, value } = bannerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const item = await Banner.create(value);
  return created(res, item);
});

export const updateBanner = asyncHandler(async (req, res) => {
  const { error, value } = bannerSchema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const item = await Banner.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Banner not found", null, 404);
  return ok(res, item);
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const item = await Banner.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Banner not found", null, 404);
  return ok(res, { message: "Deleted" });
});
