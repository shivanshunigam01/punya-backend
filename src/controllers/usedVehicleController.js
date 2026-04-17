import Joi from "joi";
import { UsedVehicle } from "../models/UsedVehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";
import { moveUploadToDir } from "../utils/localUploads.js";

const schema = Joi.object({
  vehicle_type: Joi.string().valid("tipper","bus","loader","machine","pickup","lcv","trailer","other").required(),
  brand: Joi.string().allow("", null),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1950).max(2100).required(),
  kilometers: Joi.number().integer().min(0).allow(null),
  hours: Joi.number().integer().min(0).allow(null),
  price: Joi.number().min(0).required(),
  price_display: Joi.string().allow("", null),
  emi_estimate: Joi.number().min(0).allow(null),
  // featured_image: Joi.string().uri().allow("", null),
  // gallery_images: Joi.array().items(Joi.string().uri()).default([]),
  fuel_type: Joi.string().allow("", null),
  ownership: Joi.string().allow("", null),
  insurance_valid_till: Joi.date().iso().allow(null),
  fitness_valid_till: Joi.date().iso().allow(null),
  rc_status: Joi.string().allow("", null),
  condition_report: Joi.object({
    engine: Joi.string().valid("excellent","good","fair","poor").optional(),
    transmission: Joi.string().valid("excellent","good","fair","poor").optional(),
    body: Joi.string().valid("excellent","good","fair","poor").optional(),
    tyres_life_percent: Joi.number().min(0).max(100).optional(),
    interior: Joi.string().valid("excellent","good","fair","poor").optional(),
    notes: Joi.string().allow("", null).optional(),
  }).default({}),
  is_certified: Joi.boolean().default(false),
  // inspection_report_url: Joi.string().uri().allow("", null),
  has_warranty: Joi.boolean().default(false),
  warranty_details: Joi.string().allow("", null),
  has_return_policy: Joi.boolean().default(false),
  return_policy_days: Joi.number().integer().min(0).allow(null),
  finance_available: Joi.boolean().default(true),
  location: Joi.string().allow("", null),
  status: Joi.string().valid("available","reserved","sold").default("available"),
  is_active: Joi.boolean().default(true),
  seller_name: Joi.string().allow("", null),
  seller_phone: Joi.string().allow("", null),
  listed_at: Joi.date().iso().allow(null),
  sold_at: Joi.date().iso().allow(null),
featured_image: Joi.string().uri().allow("", null),
gallery_images: Joi.array().items(Joi.string().uri()).default([]),
inspection_report_url: Joi.string().uri().allow("", null),
});

export const listUsedVehicles = asyncHandler(async (req, res) => {
  const {
    vehicle_type, brand, min_price, max_price, min_year, max_year,
    max_kilometers, is_certified, status, sort_by
  } = req.query;

  const q = {};
  if (vehicle_type) q.vehicle_type = vehicle_type;
  if (brand) q.brand = { $regex: String(brand), $options: "i" };
  if (typeof is_certified !== "undefined") q.is_certified = is_certified === "true";
  if (status) q.status = status;
  if (typeof req.query.is_active !== "undefined") q.is_active = req.query.is_active === "true";

  if (min_price || max_price) {
    q.price = {};
    if (min_price) q.price.$gte = Number(min_price);
    if (max_price) q.price.$lte = Number(max_price);
  }
  if (min_year || max_year) {
    q.year = {};
    if (min_year) q.year.$gte = Number(min_year);
    if (max_year) q.year.$lte = Number(max_year);
  }
  if (max_kilometers) q.kilometers = { $lte: Number(max_kilometers) };

  let sort = { listed_at: -1 };
  if (sort_by === "price_asc") sort = { price: 1 };
  if (sort_by === "price_desc") sort = { price: -1 };
  if (sort_by === "newest") sort = { listed_at: -1 };
  if (sort_by === "year_desc") sort = { year: -1 };

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    UsedVehicle.find(q).sort(sort).skip(skip).limit(limit),
    UsedVehicle.countDocuments(q),
  ]);

  return ok(res, items, { total, page, per_page, total_pages: Math.ceil(total / per_page) });
});

export const getUsedVehicle = asyncHandler(async (req, res) => {
  const item = await UsedVehicle.findById(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Used vehicle not found", null, 404);
  return ok(res, item);
});
export const createUsedVehicle = asyncHandler(async (req, res) => {
  const images = req.files?.images || [];
  const inspection = req.files?.inspectionReport?.[0] || null;

  // Store images on the server
  const galleryImages = [];

  for (const file of images) {
    galleryImages.push(moveUploadToDir(file, "used-vehicles", "images"));
  }

  // Store inspection PDF on the server
  let inspectionReportUrl = null;

  if (inspection) {
    inspectionReportUrl = moveUploadToDir(
      inspection,
      "used-vehicles",
      "inspection-reports"
    );
  }

  // ✅ Parse condition_report safely
  let conditionReport = {};
  if (req.body.condition_report) {
    try {
      conditionReport =
        typeof req.body.condition_report === "string"
          ? JSON.parse(req.body.condition_report)
          : req.body.condition_report;
    } catch {
      conditionReport = {};
    }
  }

  // ✅ Build payload
  const payload = {
    ...req.body,
    gallery_images: galleryImages,
    featured_image: galleryImages[0] || null,
    inspection_report_url: inspectionReportUrl,
    condition_report: conditionReport,
  };

  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) throw error;

  const item = await UsedVehicle.create(value);
  return created(res, item);
});

export const updateUsedVehicle = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // ✅ Parse condition_report safely
  if (body.condition_report) {
    try {
      body.condition_report =
        typeof body.condition_report === "string"
          ? JSON.parse(body.condition_report)
          : body.condition_report;
    } catch {
      body.condition_report = {};
    }
  }

  const images = req.files?.images || [];
  const inspection = req.files?.inspectionReport?.[0] || null;

  // Store replacement images on the server
  if (images.length) {
    const galleryImages = [];

    for (const file of images) {
      galleryImages.push(moveUploadToDir(file, "used-vehicles", "images"));
    }

    body.gallery_images = galleryImages;
    body.featured_image = galleryImages[0];
  }

  // Store replacement inspection report on the server
  if (inspection) {
    body.inspection_report_url = moveUploadToDir(
      inspection,
      "used-vehicles",
      "inspection-reports"
    );
  }

  const { error, value } = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) throw error;

  const item = await UsedVehicle.findByIdAndUpdate(
    req.params.id,
    value,
    { new: true }
  );

  if (!item) {
    return fail(res, "NOT_FOUND", "Used vehicle not found", null, 404);
  }

  return ok(res, item);
});

export const patchUsedVehicleStatus = asyncHandler(async (req, res) => {
  const s = Joi.object({ status: Joi.string().valid("available","reserved","sold").required(), sold_at: Joi.date().iso().allow(null) });
  const { error, value } = s.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const item = await UsedVehicle.findByIdAndUpdate(req.params.id, { status: value.status, sold_at: value.sold_at || (value.status === "sold" ? new Date() : null) }, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Used vehicle not found", null, 404);
  return ok(res, item);
});

export const deleteUsedVehicle = asyncHandler(async (req, res) => {
  const item = await UsedVehicle.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Used vehicle not found", null, 404);
  return ok(res, { message: "Deleted" });
});
