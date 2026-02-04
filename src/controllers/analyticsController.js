import Joi from "joi";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, fail } from "../utils/apiResponse.js";
import Product from "../models/Product.js";
import ComparisonEvent from "../models/ComparisonEvent.js";

const createSchema = Joi.object({
  product_ids: Joi.array().items(Joi.string().required()).length(2).required(),
  device_type: Joi.string()
    .valid("mobile", "tablet", "desktop")
    .default("mobile"),
  user_session_id: Joi.string().allow("", null),
});

// ================= LOG COMPARISON =================
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

  if (products.length !== 2) {
    return fail(res, "NOT_FOUND", "One or more products not found", null, 404);
  }

  const event = await ComparisonEvent.create({
    product_ids: value.product_ids,
    product_names: products.map(p => p.name),
    user_session_id: value.user_session_id || null,
    ip_address: req.clientInfo?.ip,
    device_type: value.device_type,
  });

  return ok(res, { id: event._id });
});

// ================= ANALYTICS =================
export const getComparisonAnalytics = asyncHandler(async (_req, res) => {
  const topCompared = await ComparisonEvent.aggregate([
    { $unwind: "$product_ids" },
    { $group: { _id: "$product_ids", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const products = await Product.find(
    { _id: { $in: topCompared.map(x => x._id) } },
    { name: 1 }
  ).lean();

  const productMap = {};
  products.forEach(p => {
    productMap[p._id.toString()] = p.name;
  });

  const mostComparedProducts = topCompared.map(x => ({
    productId: x._id,
    productName: productMap[x._id] || "Unknown",
    comparisonCount: x.count,
  }));

  const pairAgg = await ComparisonEvent.aggregate([
    {
      $project: {
        pair: {
          $cond: [
            { $gt: ["$product_ids.0", "$product_ids.1"] },
            ["$product_ids.1", "$product_ids.0"],
            "$product_ids",
          ],
        },
      },
    },
    { $group: { _id: "$pair", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const productPairings = pairAgg.map(p => ({
    product1: productMap[p._id[0]] || "Unknown",
    product2: productMap[p._id[1]] || "Unknown",
    count: p.count,
  }));

  const brandAgg = await ComparisonEvent.aggregate([
    { $unwind: "$product_names" },
    { $group: { _id: "$product_names", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return ok(res, {
    mostComparedProducts,
    productPairings,
    brandComparisons: brandAgg.map(b => ({
      brand: b._id,
      count: b.count,
    })),
  });
});
