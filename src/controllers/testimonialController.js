import Joi from "joi";
import { Testimonial } from "../models/Testimonial.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const schema = Joi.object({
  customer_name: Joi.string().required(),
  customer_title: Joi.string().allow("", null),
  customer_photo: Joi.string().uri().allow("", null),
  rating: Joi.number().integer().min(1).max(5).required(),
  review_text: Joi.string().required(),
  product_purchased: Joi.string().allow("", null),
  is_featured: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().default(0),
});

export const listTestimonials = asyncHandler(async (req, res) => {
  const q = {};
  if (typeof req.query.is_featured !== "undefined") q.is_featured = req.query.is_featured === "true";
  if (typeof req.query.is_active !== "undefined") q.is_active = req.query.is_active === "true";
  const limit = req.query.limit ? Math.min(50, Number(req.query.limit)) : null;

  const items = await Testimonial.find(q).sort({ display_order: 1, created_at: -1 }).limit(limit || 100);
  return ok(res, items);
});

export const getTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Testimonial not found", null, 404);
  return ok(res, item);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const item = await Testimonial.create(value);
  return created(res, item);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const { error, value } = schema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const item = await Testimonial.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Testimonial not found", null, 404);
  return ok(res, item);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Testimonial not found", null, 404);
  return ok(res, { message: "Deleted" });
});
