import Joi from "joi";
import { Product } from "../models/Product.js";
import { Brand } from "../models/Brand.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { makeSlug } from "../utils/slug.js";
import { parsePagination } from "../utils/pagination.js";

/* ===============================
   NORMALIZE MULTIPART BODY ✅
================================ */


const normalizeMultipartBody = (body) => ({
  ...body,
  price: body.price !== undefined ? Number(body.price) : undefined,
  isActive: body.isActive === "true" || body.isActive === true,
  isNewLaunch: body.isNewLaunch === "true" || body.isNewLaunch === true,
  isBestseller: body.isBestseller === "true" || body.isBestseller === true,
  isFeatured: body.isFeatured === "true" || body.isFeatured === true,
  specifications:
    typeof body.specifications === "string"
      ? JSON.parse(body.specifications)
      : body.specifications,
  tcoItems:
    typeof body.tcoItems === "string"
      ? JSON.parse(body.tcoItems)
      : body.tcoItems,
});

/* ===============================
   VALIDATION
================================ */

const TcoItemSchema = Joi.object({
  key: Joi.string().required(),
  label: Joi.string().required(),
  value: Joi.number().min(0).required(),
  unit: Joi.string().valid("monthly", "yearly", "one-time").required(),
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().allow("", null),

  price: Joi.number().min(0).allow(null),
  shortDescription: Joi.string().allow("", null),

  specifications: Joi.object().default({}),
  tcoItems: Joi.array().items(TcoItemSchema).default([]),

  isActive: Joi.boolean().default(true),
  isNewLaunch: Joi.boolean().default(false),
  isBestseller: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),

  seoTitle: Joi.string().allow("", null),
  seoDescription: Joi.string().allow("", null),
});

const productUpdateSchema = Joi.object({
  name: Joi.string(),
  brand: Joi.string(),
  category: Joi.string().allow("", null),

  price: Joi.number().min(0).allow(null),
  shortDescription: Joi.string().allow("", null),

  specifications: Joi.object(),
  tcoItems: Joi.array().items(TcoItemSchema),

  isActive: Joi.boolean(),
  isNewLaunch: Joi.boolean(),
  isBestseller: Joi.boolean(),
  isFeatured: Joi.boolean(),

  seoTitle: Joi.string().allow("", null),
  seoDescription: Joi.string().allow("", null),
}).min(1);

/* ===============================
   HELPERS
================================ */

const mapProduct = (p) => ({
  id: p._id,
  name: p.name,
  brand: p.brand_id?.name,
  category: p.category_id?.name,
  price: p.price,
  shortDescription: p.short_description,
  specifications: p.specifications,
  images: p.gallery_images,
  tcoItems: p.tco_items,
  isActive: p.is_active,
  isNewLaunch: p.is_new_launch,
  isBestseller: p.is_bestseller,
  isFeatured: p.is_featured,
  seoTitle: p.seo_title,
  seoDescription: p.seo_description,
  brochureUrl: p.brochure_url,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

const resolveBrand = async (name) => {
  let brand = await Brand.findOne({ name });
  if (!brand) {
    brand = await Brand.create({ name, slug: makeSlug(name) });
  }
  return brand;
};

const resolveCategory = async (name, brandId) => {
  if (!name) return null;

  let category = await Category.findOne({ name, brand_id: brandId });
  if (!category) {
    category = await Category.create({
      name,
      slug: makeSlug(name),
      brand_id: brandId,
    });
  }
  return category;
};

/* ===============================
   CONTROLLERS
================================ */

// LIST
export const listProducts = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.is_active !== undefined) {
    q.is_active = req.query.is_active === "true";
  }

  if (req.query.search) {
    q.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { short_description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const { page, per_page, skip, limit } = parsePagination(req.query);

  const [items, total] = await Promise.all([
    Product.find(q)
      .populate("brand_id", "name")
      .populate("category_id", "name")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(q),
  ]);

  return ok(res, items.map(mapProduct), {
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
  });
});

// GET BY SLUG
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("brand_id")
    .populate("category_id");

  if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);
  return ok(res, mapProduct(product));
});

// GET BY ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("brand_id")
    .populate("category_id");

  if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);
  return ok(res, mapProduct(product));
});

// CREATE
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

export const createProduct = asyncHandler(async (req, res) => {
  console.log("FILES:", Object.keys(req.files || {}));
  const normalizedBody = normalizeMultipartBody(req.body);

  const { error, value } = productSchema.validate(normalizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  const brand = await resolveBrand(value.brand);
  const category = await resolveCategory(value.category, brand._id);

  /* ===============================
     IMAGES → CLOUDINARY
  ================================ */
  let imageUrls = [];

  if (req.files?.images) {
    for (const file of req.files.images) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      imageUrls.push(result.secure_url);
      fs.unlinkSync(file.path); // cleanup temp
    }
  }

  /* ===============================
     BROCHURE → LOCAL
  ================================ */
  let brochureUrl = null;

  if (req.files?.brochure?.[0]) {
    const file = req.files.brochure[0];
    const targetPath = path.join(
      "uploads/brochures",
      path.basename(file.path)
    );

    fs.renameSync(file.path, targetPath);
    brochureUrl = `/${targetPath}`;
  }

  const product = await Product.create({
    name: value.name,
    slug: makeSlug(value.name),
    brand_id: brand._id,
    category_id: category?._id || null,
    price: value.price,
    short_description: value.shortDescription,
    specifications: value.specifications,
    gallery_images: imageUrls,
    tco_items: value.tcoItems,
    is_active: value.isActive,
    is_new_launch: value.isNewLaunch,
    is_bestseller: value.isBestseller,
    is_featured: value.isFeatured,
    seo_title: value.seoTitle,
    seo_description: value.seoDescription,
    brochure_url: brochureUrl,
  });

  return created(res, mapProduct(product));
});

// UPDATE
export const updateProduct = asyncHandler(async (req, res) => {
  const normalizedBody = normalizeMultipartBody(req.body);

  const { error, value } = productUpdateSchema.validate(normalizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  const update = {};

  if (value.name) {
    update.name = value.name;
    update.slug = makeSlug(value.name);
  }

  if (value.brand) {
    update.brand_id = (await resolveBrand(value.brand))._id;
  }

  if ("category" in value) {
    const product = await Product.findById(req.params.id);
    update.category_id = value.category
      ? (await resolveCategory(
          value.category,
          update.brand_id || product.brand_id
        ))._id
      : null;
  }

  if ("price" in value) update.price = value.price;
  if ("shortDescription" in value)
    update.short_description = value.shortDescription;
  if ("specifications" in value) update.specifications = value.specifications;
  if ("tcoItems" in value) update.tco_items = value.tcoItems;

  if ("isActive" in value) update.is_active = value.isActive;
  if ("isNewLaunch" in value) update.is_new_launch = value.isNewLaunch;
  if ("isBestseller" in value) update.is_bestseller = value.isBestseller;
  if ("isFeatured" in value) update.is_featured = value.isFeatured;

  if ("seoTitle" in value) update.seo_title = value.seoTitle;
  if ("seoDescription" in value)
    update.seo_description = value.seoDescription;

  if (req.files?.images?.length) {
    update.gallery_images = req.files.images.map((f) => f.path);
  }

  if (req.files?.brochure?.[0]) {
    update.brochure_url = `/uploads/brochures/${req.files.brochure[0].filename}`;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);
  return ok(res, mapProduct(product));
});

// DELETE
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);
  return ok(res, { message: "Product deleted" });
});

// COMPARE
export const compareProducts = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || "").split(",").filter(Boolean);
  if (ids.length !== 2) {
    return fail(
      res,
      "VALIDATION_ERROR",
      "Exactly 2 product IDs required",
      null,
      400
    );
  }

  const products = await Product.find({ _id: { $in: ids } })
    .populate("brand_id", "name")
    .populate("category_id", "name");

  if (products.length !== 2) {
    return fail(res, "NOT_FOUND", "Products not found", null, 404);
  }

  return ok(res, {
    products: products.map(mapProduct),
    comparison_specs: ["Price", "Brand", "Category", "Specifications", "TCO"],
  });
});