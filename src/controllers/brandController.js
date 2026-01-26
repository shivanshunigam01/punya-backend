import Joi from "joi";
import { Brand } from "../models/Brand.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { makeSlug } from "../utils/slug.js";

const schema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().allow("", null),
  tagline: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
  logo_url: Joi.string().uri().allow("", null),
  hero_image: Joi.string().uri().allow("", null),
  accent_color: Joi.string().pattern(/^#([A-Fa-f0-9]{6})$/).allow("", null),
  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().default(0),
  seo_title: Joi.string().allow("", null),
  seo_description: Joi.string().allow("", null),
});

export const listBrands = asyncHandler(async (_req, res) => {
  const items = await Brand.find({}).sort({ display_order: 1, name: 1 });
  return ok(res, items);
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const item = await Brand.findOne({ slug: req.params.slug });
  if (!item) return fail(res, "NOT_FOUND", "Brand not found", null, 404);
  return ok(res, item);
});

export const createBrand = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const slug = value.slug ? makeSlug(value.slug) : makeSlug(value.name);
  const item = await Brand.create({ ...value, slug });
  return created(res, item);
});

export const updateBrand = asyncHandler(async (req, res) => {
  const { error, value } = schema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  if (value.slug) value.slug = makeSlug(value.slug);
  const item = await Brand.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Brand not found", null, 404);
  return ok(res, item);
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const item = await Brand.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Brand not found", null, 404);
  return ok(res, { message: "Deleted" });
});
