import Joi from "joi";
import { SiteSettings } from "../models/SiteSettings.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

const schema = Joi.object({
  primary_phone: Joi.string().allow("", null),
  whatsapp_number: Joi.string().allow("", null),
  email: Joi.string().email().allow("", null),
  address: Joi.string().allow("", null),
  working_hours: Joi.object().default({}),
  social_links: Joi.object().default({}),
  default_seo_title: Joi.string().allow("", null),
  default_seo_description: Joi.string().allow("", null),
  features: Joi.object().default({}),
  google_analytics_id: Joi.string().allow("", null),
  facebook_pixel_id: Joi.string().allow("", null),
});

export const getPublicSettings = asyncHandler(async (_req, res) => {
  const item = await SiteSettings.findOne({}).sort({ updated_at: -1 });
  if (!item) return ok(res, null);
  const { google_analytics_id, facebook_pixel_id, ...publicData } = item.toObject();
  return ok(res, publicData);
});

export const getAdminSettings = asyncHandler(async (_req, res) => {
  const item = await SiteSettings.findOne({}).sort({ updated_at: -1 });
  return ok(res, item || null);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const item = await SiteSettings.findOneAndUpdate({}, value, { new: true, upsert: true });
  return ok(res, item);
});
