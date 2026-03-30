import Joi from "joi";
import Timeline from "../models/Timeline.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";

import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* ===============================
   VALIDATION
================================ */

const IMAGE_TYPE_VALUES = [
  'loan-mela', 'rural-activity', 'customer-meet', 'operator-meet',
  'exchange-mela', 'financer-meet', 'launch-event', 'road-show',
  'customer-testimony', 'customer-visit', 'group-event', 'others',
];

const timelineSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow("", null),
  date: Joi.date().required(),
  imageType: Joi.string().valid(...IMAGE_TYPE_VALUES).default('others'),
  isActive: Joi.boolean().default(true),
  displayOrder: Joi.number().default(0),
});

const timelineUpdateSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow("", null),
  date: Joi.date(),
  imageType: Joi.string().valid(...IMAGE_TYPE_VALUES),
  isActive: Joi.boolean(),
  displayOrder: Joi.number(),
}).min(1);

/* ===============================
   HELPERS
================================ */

const normalizeBody = (body) => ({
  ...body,
  date: body.date ? new Date(body.date) : undefined,
  isActive: body.isActive === "true" || body.isActive === true,
  displayOrder: body.displayOrder ? Number(body.displayOrder) : 0,
});

const mapTimeline = (t) => ({
  id: t._id,
  title: t.title,
  description: t.description,
  date: t.date,
  imageType: t.image_type,
  image: t.image,
  publicId: t.public_id,
  isActive: t.is_active,
  displayOrder: t.display_order,
  createdAt: t.created_at,
});

/* ===============================
   CONTROLLERS
================================ */

// LIST
export const listTimeline = asyncHandler(async (req, res) => {
  const items = await Timeline.find({ is_active: true }).sort({
    date: -1,
    display_order: 1,
  });

  return ok(res, items.map(mapTimeline), {
    total: items.length,
  });
});

// GET BY ID
export const getTimelineById = asyncHandler(async (req, res) => {
  const item = await Timeline.findById(req.params.id);

  if (!item) return fail(res, "NOT_FOUND", "Timeline not found", null, 404);

  return ok(res, mapTimeline(item));
});

// CREATE
export const createTimeline = asyncHandler(async (req, res) => {
  const normalizedBody = normalizeBody(req.body);

  const { error, value } = timelineSchema.validate(normalizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) throw error;

  let imageUrl = "";
  let publicId = "";

  // ✅ CLOUDINARY UPLOAD (same as product)
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "timeline",
    });

    imageUrl = result.secure_url;
    publicId = result.public_id;

    fs.unlinkSync(req.file.path); // cleanup
  }

  const timeline = await Timeline.create({
    title: value.title,
    description: value.description,
    date: value.date,
    image_type: value.imageType,
    image: imageUrl,
    public_id: publicId,
    is_active: value.isActive,
    display_order: value.displayOrder,
  });

  return created(res, mapTimeline(timeline));
});

// UPDATE
export const updateTimeline = asyncHandler(async (req, res) => {
  const normalizedBody = normalizeBody(req.body);

  const { error, value } = timelineUpdateSchema.validate(normalizedBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) throw error;

  const timeline = await Timeline.findById(req.params.id);

  if (!timeline)
    return fail(res, "NOT_FOUND", "Timeline not found", null, 404);

  // ✅ IMAGE UPDATE
  if (req.file) {
    // delete old image
    if (timeline.public_id) {
      await cloudinary.uploader.destroy(timeline.public_id);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "timeline",
    });

    timeline.image = result.secure_url;
    timeline.public_id = result.public_id;

    fs.unlinkSync(req.file.path);
  }

  // update fields
  if (value.title) timeline.title = value.title;
  if ("description" in value) timeline.description = value.description;
  if (value.date) timeline.date = value.date;
  if (value.imageType) timeline.image_type = value.imageType;
  if ("isActive" in value) timeline.is_active = value.isActive;
  if ("displayOrder" in value) timeline.display_order = value.displayOrder;

  await timeline.save();

  return ok(res, mapTimeline(timeline));
});

// DELETE
export const deleteTimeline = asyncHandler(async (req, res) => {
  const timeline = await Timeline.findById(req.params.id);

  if (!timeline)
    return fail(res, "NOT_FOUND", "Timeline not found", null, 404);

  if (timeline.public_id) {
    await cloudinary.uploader.destroy(timeline.public_id);
  }

  await timeline.deleteOne();

  return ok(res, { message: "Timeline deleted successfully" });
});