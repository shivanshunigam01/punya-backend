import Joi from "joi";
import { NewArrival } from "../models/NewArrival.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";

const schema = Joi.object({
  product_id: Joi.string().required(),
  display_order: Joi.number().integer().default(0),
  expires_at: Joi.date().iso().allow(null),
});

export const listNewArrivals = asyncHandler(async (_req, res) => {
  const now = new Date();
  const items = await NewArrival.find({
    $or: [{ expires_at: null }, { expires_at: { $gt: now } }],
  })
    .sort({ display_order: 1 })
    .limit(6)
    .populate("product_id");

  const data = items.map(i => ({ id: i._id, product: i.product_id, display_order: i.display_order, expires_at: i.expires_at }));
  return ok(res, data);
});

export const addNewArrival = asyncHandler(async (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const p = await Product.findById(value.product_id);
  if (!p) return fail(res, "NOT_FOUND", "Product not found", null, 404);

  const item = await NewArrival.create(value);
  return created(res, item);
});

export const updateNewArrival = asyncHandler(async (req, res) => {
  const { error, value } = schema.min(1).validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const item = await NewArrival.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "New arrival not found", null, 404);
  return ok(res, item);
});

export const deleteNewArrival = asyncHandler(async (req, res) => {
  const item = await NewArrival.findByIdAndDelete(req.params.id);
  if (!item) return fail(res, "NOT_FOUND", "New arrival not found", null, 404);
  return ok(res, { message: "Deleted" });
});
