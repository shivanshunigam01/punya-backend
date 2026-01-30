import Joi from "joi";
import fs from "fs";
import { Banner } from "../models/Banner.js";
import cloudinary from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const bannerSchema = Joi.object({
  page: Joi.string()
    .valid("home", "jcb", "ashok_leyland", "switch_ev", "used_vehicles", "finance")
    .required(),

  title: Joi.string().required(),
  subtitle: Joi.string().allow("", null),

  overlay_opacity: Joi.number().min(0).max(100).default(40),

  trust_badges: Joi.array().items(Joi.string()).default([]),
  customer_count: Joi.number().integer().min(0).allow(null),

  is_active: Joi.boolean().default(true),
  display_order: Joi.number().integer().default(0),
});

/* ================= LIST ================= */
export const listBanners = asyncHandler(async (req, res) => {
  const { page, is_active } = req.query;
  const { page: pg, skip, limit, per_page } = parsePagination(req.query);

  const q = {};
  if (page) q.page = page;
  if (typeof is_active !== "undefined") q.is_active = is_active === "true";

  const [items, total] = await Promise.all([
    Banner.find(q).sort({ display_order: 1 }).skip(skip).limit(limit),
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
  const { error, value } = bannerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  /* 🔥 IMAGE */
  if (req.files?.image?.[0]) {
    const file = req.files.image[0];

    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
      resource_type: "image",
    });

    value.background_image = uploaded.secure_url;
    fs.unlinkSync(file.path);
  }

  /* 🔥 VIDEO */
  if (req.files?.video?.[0]) {
    const file = req.files.video[0];

    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
      resource_type: "video",
    });

    value.background_video = uploaded.secure_url;
    fs.unlinkSync(file.path);
  }

  const banner = await Banner.create(value);
  return created(res, banner);
});

/* ================= UPDATE ================= */
export const updateBanner = asyncHandler(async (req, res) => {
  const { error, value } = bannerSchema.min(1).validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  if (req.files?.image?.[0]) {
    const file = req.files.image[0];
    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
      resource_type: "image",
    });
    value.background_image = uploaded.secure_url;
    fs.unlinkSync(file.path);
  }

  if (req.files?.video?.[0]) {
    const file = req.files.video[0];
    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
      resource_type: "video",
    });
    value.background_video = uploaded.secure_url;
    fs.unlinkSync(file.path);
  }

  const banner = await Banner.findByIdAndUpdate(req.params.id, value, {
    new: true,
  });

  if (!banner) return fail(res, "NOT_FOUND", "Banner not found", null, 404);
  return ok(res, banner);
});

/* ================= DELETE ================= */
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return fail(res, "NOT_FOUND", "Banner not found", null, 404);
  return ok(res, { message: "Banner deleted" });
});
