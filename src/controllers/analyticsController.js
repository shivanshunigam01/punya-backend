import Joi from "joi";
import { ComparisonEvent } from "../models/ComparisonEvent.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";

const createSchema = Joi.object({
  product_ids: Joi.array().items(Joi.string().required()).length(2).required(),
  device_type: Joi.string()
    .valid("mobile", "tablet", "desktop")
    .default("mobile"),
  user_session_id: Joi.string().allow("", null),
});

export const logComparison = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  const products = await Product.find(
    { _id: { $in: value.product_ids } },
    { name: 1 }
  );
  if (products.length !== 2)
    return fail(res, "NOT_FOUND", "One or more products not found", null, 404);

  const event = await ComparisonEvent.create({
    product_ids: value.product_ids,
    product_names: products.map((p) => p.name),
    user_session_id: value.user_session_id || null,
    ip_address: req.clientInfo.ip,
    device_type: value.device_type,
  });

  return created(res, { id: event._id });
});

export const getComparisonAnalytics = asyncHandler(async (_req, res) => {
  const total = await ComparisonEvent.countDocuments();

  const topCompared = await ComparisonEvent.aggregate([
    { $unwind: "$product_ids" },
    { $group: { _id: "$product_ids", comparison_count: { $sum: 1 } } },
    { $sort: { comparison_count: -1 } },
    { $limit: 10 },
  ]);

  const productMap = await Product.find(
    { _id: { $in: topCompared.map((x) => x._id) } },
    { name: 1 }
  ).lean();
  const nameById = productMap.reduce((acc, p) => {
    acc[p._id.toString()] = p.name;
    return acc;
  }, {});

  const top_compared_products = topCompared.map((x) => ({
    product_id: x._id,
    product_name: nameById[String(x._id)] || "Unknown",
    comparison_count: x.comparison_count,
  }));

  const commonPairs = await ComparisonEvent.aggregate([
    {
      $project: {
        pair: {
          $cond: [
            {
              $gt: [
                { $arrayElemAt: ["$product_ids", 0] },
                { $arrayElemAt: ["$product_ids", 1] },
              ],
            },
            [
              { $arrayElemAt: ["$product_ids", 1] },
              { $arrayElemAt: ["$product_ids", 0] },
            ],
            "$product_ids",
          ],
        },
      },
    },
    { $group: { _id: "$pair", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return ok(res, {
    total_comparisons: total,
    top_compared_products,
    common_pairs: commonPairs.map((p) => ({ products: p._id, count: p.count })),
  });
});
