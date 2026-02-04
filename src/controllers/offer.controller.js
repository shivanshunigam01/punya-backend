import Offer from "../models/offer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";

/**
 * GET /offers
 */
export const listOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().sort({ priority: 1, createdAt: -1 });
  return ok(res, offers);
});

/**
 * GET /offers/:id
 */
export const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    return fail(res, "NOT_FOUND", "Offer not found", null, 404);
  }
  return ok(res, offer);
});

/**
 * POST /offers
 */
export const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  return created(res, offer);
});

/**
 * PUT /offers/:id
 */
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!offer) {
    return fail(res, "NOT_FOUND", "Offer not found", null, 404);
  }

  return ok(res, offer);
});

/**
 * DELETE /offers/:id
 */
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) {
    return fail(res, "NOT_FOUND", "Offer not found", null, 404);
  }

  return ok(res, { success: true });
});
