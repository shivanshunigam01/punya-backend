import { Dealer } from "../models/Dealer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";

/**
 * GET /dealers
 */
export const listDealers = asyncHandler(async (req, res) => {
  const dealers = await Dealer.find().sort({ createdAt: -1 });
  return ok(res, dealers);
});

/**
 * GET /dealers/:id
 */
export const getDealer = asyncHandler(async (req, res) => {
  const dealer = await Dealer.findById(req.params.id);
  if (!dealer) return fail(res, "NOT_FOUND", "Dealer not found", null, 404);
  return ok(res, dealer);
});

/**
 * POST /dealers
 */
export const createDealer = asyncHandler(async (req, res) => {
  const dealer = await Dealer.create(req.body);
  return created(res, dealer);
});

/**
 * PUT /dealers/:id
 */
export const updateDealer = asyncHandler(async (req, res) => {
  const dealer = await Dealer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!dealer) return fail(res, "NOT_FOUND", "Dealer not found", null, 404);
  return ok(res, dealer);
});

/**
 * DELETE /dealers/:id
 */
export const deleteDealer = asyncHandler(async (req, res) => {
  const dealer = await Dealer.findByIdAndDelete(req.params.id);
  if (!dealer) return fail(res, "NOT_FOUND", "Dealer not found", null, 404);
  return ok(res, { success: true });
});
