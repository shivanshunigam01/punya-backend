import Joi from "joi";
import { TrustPillar } from "../models/TrustPillar.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";

const schema = Joi.object({
  icon: Joi.string().allow("", null),
  title: Joi.string().required(),
  description: Joi.string().allow("", null),
  link_text: Joi.string().allow("", null),
  link_url: Joi.string().uri().allow("", null),
  display_order: Joi.number().integer().default(0),
  is_active: Joi.boolean().default(true),
});

export const listTrustPillars = asyncHandler(async (_req, res) => {
  const items = await TrustPillar.find({ is_active: true }).sort({ display_order: 1 });
  return ok(res, items);
});

export const createTrustPillar = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const item = await TrustPillar.create(value);
  return created(res, item);
});

export const updateTrustPillar = asyncHandler(async (req, res) => {
  const { error, value } = schema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;
  const item = await TrustPillar.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Trust pillar not found", null, 404);
  return ok(res, item);
});

export const deleteTrustPillar = asyncHandler(async (req, res) => {
  const item = await TrustPillar.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "Trust pillar not found", null, 404);
  return ok(res, { message: "Deleted" });
});
