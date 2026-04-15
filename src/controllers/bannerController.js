import Joi from "joi";
import { Banner } from "../models/Banner.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

/* =====================================================
   JOI VALIDATION SCHEMA
   VERY IMPORTANT – DO NOT REMOVE background_image
===================================================== */

const bannerSchema = Joi.object({
  page: Joi.string()
    .valid(
      "home",
      "trucks",
      "buses_vans",
      "switch_ev",
      "used_vehicles",
      "finance"
    )
    .required(),

  title: Joi.string().required(),
  subtitle: Joi.string().allow("", null),

  // 🔥 THIS WAS MISSING (MAIN BUG)
  background_image: Joi.string().uri().allow(null),
  background_video: Joi.string().uri().allow(null),

  overlay_opacity: Joi.number().min(0).max(100).default(40),

  trust_badges: Joi.array().items(Joi.string()).default([]),
  customer_count: Joi.number().integer().min(0).allow(null),

  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().default(0),
});

/* =====================================================
   LIST BANNERS (ADMIN)
===================================================== */
export const listBanners = asyncHandler(async (req, res) => {
  const { page, is_active } = req.query;
  const { page: pg, skip, limit, per_page } = parsePagination(req.query);

  const query = {};

  if (page) query.page = page;
  if (typeof is_active !== "undefined") {
    query.is_active = is_active === "true";
  }

  const [items, total] = await Promise.all([
    Banner.find(query)
      .sort({ display_order: 1 })
      .skip(skip)
      .limit(limit),
    Banner.countDocuments(query),
  ]);

  return ok(res, items, {
    total,
    page: pg,
    per_page,
  });
});

/* =====================================================
   GET ACTIVE BANNER BY PAGE (WEBSITE)
===================================================== */
export const getActiveBannerByPage = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({
    page: req.params.page,
    is_active: true,
  }).sort({ display_order: 1 });

  if (!banner) {
    return fail(
      res,
      "NOT_FOUND",
      "No active banner found for this page",
      null,
      404
    );
  }

  return ok(res, banner);
});

/* =====================================================
   CREATE BANNER
   NOTE: IMAGE IS ALREADY UPLOADED VIA /media/upload
===================================================== */
export const createBanner = asyncHandler(async (req, res) => {
  const { error, value } = bannerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // SAFE NOW
  });

  if (error) {
    throw error;
  }

  const banner = await Banner.create(value);
  return created(res, banner);
});

/* =====================================================
   UPDATE BANNER
===================================================== */
export const updateBanner = asyncHandler(async (req, res) => {
  const { error, value } = bannerSchema.min(1).validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw error;
  }

  const banner = await Banner.findByIdAndUpdate(
    req.params.id,
    value,
    { new: true }
  );

  if (!banner) {
    return fail(res, "NOT_FOUND", "Banner not found", null, 404);
  }

  return ok(res, banner);
});

/* =====================================================
   DELETE BANNER
===================================================== */
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    return fail(res, "NOT_FOUND", "Banner not found", null, 404);
  }

  return ok(res, { message: "Banner deleted successfully" });
});
