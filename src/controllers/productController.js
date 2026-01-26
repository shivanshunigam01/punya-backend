import Joi from "joi";
import { Product } from "../models/Product.js";
import { Brand } from "../models/Brand.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { makeSlug } from "../utils/slug.js";
import { parsePagination } from "../utils/pagination.js";

const schema = Joi.object({
  brand_id: Joi.string().required(),
  category_id: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  slug: Joi.string().allow("", null),
  short_description: Joi.string().allow("", null),
  full_description: Joi.string().allow("", null),
  price: Joi.number().min(0).allow(null),
  price_display: Joi.string().allow("", null),
  featured_image: Joi.string().uri().allow("", null),
  gallery_images: Joi.array().items(Joi.string().uri()).default([]),
  specifications: Joi.object().default({}),
  key_features: Joi.array().items(Joi.string()).default([]),
  applications: Joi.array().items(Joi.string()).default([]),
  is_active: Joi.boolean().default(true),
  is_new_launch: Joi.boolean().default(false),
  is_bestseller: Joi.boolean().default(false),
  is_featured: Joi.boolean().default(false),
  in_stock: Joi.boolean().default(true),
  seo_title: Joi.string().allow("", null),
  seo_description: Joi.string().allow("", null),
  seo_keywords: Joi.array().items(Joi.string()).default([]),
});

export const listProducts = asyncHandler(async (req, res) => {
  const {
    brand_id, category_id, is_new_launch, is_bestseller, is_featured,
    min_price, max_price, search, sort_by
  } = req.query;

  const q = {};
  if (brand_id) q.brand_id = brand_id;
  if (category_id) q.category_id = category_id;
  if (typeof is_new_launch !== "undefined") q.is_new_launch = is_new_launch === "true";
  if (typeof is_bestseller !== "undefined") q.is_bestseller = is_bestseller === "true";
  if (typeof is_featured !== "undefined") q.is_featured = is_featured === "true";
  if (typeof req.query.is_active !== "undefined") q.is_active = req.query.is_active === "true";

  if (min_price || max_price) {
    q.price = {};
    if (min_price) q.price.$gte = Number(min_price);
    if (max_price) q.price.$lte = Number(max_price);
  }
  if (search) {
    q.$or = [
      { name: { $regex: String(search), $options: "i" } },
      { short_description: { $regex: String(search), $options: "i" } },
      { full_description: { $regex: String(search), $options: "i" } },
    ];
  }

  let sort = { created_at: -1 };
  if (sort_by === "price_asc") sort = { price: 1 };
  if (sort_by === "price_desc") sort = { price: -1 };
  if (sort_by === "name") sort = { name: 1 };
  if (sort_by === "newest") sort = { created_at: -1 };

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    Product.find(q).sort(sort).skip(skip).limit(limit).populate("brand_id", "name slug").populate("category_id", "name slug"),
    Product.countDocuments(q),
  ]);

  const data = items.map(p => {
    const obj = p.toObject();
    return {
      ...obj,
      brand: obj.brand_id ? { id: obj.brand_id._id, name: obj.brand_id.name, slug: obj.brand_id.slug } : undefined,
      category: obj.category_id ? { id: obj.category_id._id, name: obj.category_id.name, slug: obj.category_id.slug } : undefined,
      brand_id: obj.brand_id?._id || obj.brand_id,
      category_id: obj.category_id?._id || obj.category_id,
    };
  });

  return ok(res, data, { total, page, per_page, total_pages: Math.ceil(total / per_page) });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug })
    .populate("brand_id")
    .populate("category_id");
  if (!p) return fail(res, "NOT_FOUND", "Product not found", null, 404);

  const related = await Product.find({
    _id: { $ne: p._id },
    category_id: p.category_id?._id,
    is_active: true,
  }).limit(6);

  return ok(res, {
    ...p.toObject(),
    brand: p.brand_id,
    category: p.category_id,
    related_products: related,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const slug = value.slug ? makeSlug(value.slug) : makeSlug(value.name);
  const item = await Product.create({ ...value, slug, category_id: value.category_id || null });
  return created(res, item);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { error, value } = schema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  if (value.slug) value.slug = makeSlug(value.slug);
  if (Object.prototype.hasOwnProperty.call(value, "category_id") && !value.category_id) value.category_id = null;

  const item = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Product not found", null, 404);
  return ok(res, item);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const item = await Product.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Product not found", null, 404);
  return ok(res, { message: "Deleted" });
});

export const compareProducts = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || "").split(",").map(s => s.trim()).filter(Boolean);
  if (ids.length < 2 || ids.length > 2) return fail(res, "VALIDATION_ERROR", "ids must contain exactly 2 product IDs", null, 400);

  const products = await Product.find({ _id: { $in: ids } }).populate("brand_id", "name slug").populate("category_id", "name slug");
  if (products.length !== 2) return fail(res, "NOT_FOUND", "One or more products not found", null, 404);

  const comparison_specs = ["Price","Brand","Category","Fuel Type","Capacity / Payload","Power","Application","Warranty"];
  return ok(res, { products, comparison_specs });
});
