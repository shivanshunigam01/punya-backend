import Joi from "joi";
import { EMISettings } from "../models/EMISettings.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, fail } from "../utils/apiResponse.js";

const schema = Joi.object({
  interest_rate: Joi.number().required(),
  min_vehicle_price: Joi.number().min(0).allow(null),
  max_vehicle_price: Joi.number().min(0).allow(null),
  min_down_payment: Joi.number().min(0).allow(null),
  max_down_payment: Joi.number().min(0).allow(null),
  min_tenure_months: Joi.number().integer().min(1).allow(null),
  max_tenure_months: Joi.number().integer().min(1).allow(null),
  default_vehicle_price: Joi.number().min(0).allow(null),
  default_down_payment: Joi.number().min(0).allow(null),
  default_tenure: Joi.number().integer().min(1).allow(null),
  disclaimer_text: Joi.string().allow("", null),
  is_active: Joi.boolean().default(true),
});

export const getEmiSettings = asyncHandler(async (_req, res) => {
  const item = await EMISettings.findOne({ is_active: true }).sort({ updated_at: -1 });
  return ok(res, item || null);
});

export const updateEmiSettings = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  // Upsert single settings doc
  const item = await EMISettings.findOneAndUpdate({}, value, { new: true, upsert: true });
  return ok(res, item);
});
