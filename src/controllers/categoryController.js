import Joi from "joi";
import { Category } from "../models/Category.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { makeSlug } from "../utils/slug.js";
import { parsePagination } from "../utils/pagination.js";

const schema = Joi.object({
  brand_id: Joi.string().required(),
  name: Joi.string().required(),
  slug: Joi.string().allow("", null),
  description: Joi.string().allow("", null),
  icon: Joi.string().allow("", null),
  image: Joi.string().uri().allow("", null),
  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().default(0),
});

export const listCategories = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.brand_id) q.brand_id = req.query.brand_id;
  const items = await Category.find(q).sort({ display_order: 1, name: 1 });
  return ok(res, items);
});

export const getCategoryWithProducts = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return fail(res, "NOT_FOUND", "Category not found", null, 404);

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [products, total] = await Promise.all([
    Product.find({ category_id: cat._id, is_active: true }).sort({ created_at: -1 }).skip(skip).limit(limit),
    Product.countDocuments({ category_id: cat._id, is_active: true }),
  ]);

  return ok(res, { category: cat, products }, { total, page, per_page });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const slug = value.slug ? makeSlug(value.slug) : makeSlug(value.name);
  const item = await Category.create({ ...value, slug });
  return created(res, item);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { error, value } = schema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  if (value.slug) value.slug = makeSlug(value.slug);
  const item = await Category.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Category not found", null, 404);
  return ok(res, item);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const item = await Category.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Category not found", null, 404);
  return ok(res, { message: "Deleted" });
});
