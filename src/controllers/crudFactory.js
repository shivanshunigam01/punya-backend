import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

export const listFactory = (Model, buildQuery = (req) => ({}), sortDefault = { created_at: -1 }) =>
  asyncHandler(async (req, res) => {
    const { page, per_page, skip, limit } = parsePagination(req.query);
    const q = buildQuery(req);
    const [items, total] = await Promise.all([
      Model.find(q).sort(sortDefault).skip(skip).limit(limit),
      Model.countDocuments(q),
    ]);
    return ok(res, items, { total, page, per_page, total_pages: Math.ceil(total / per_page) });
  });

export const getByIdFactory = (Model) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return fail(res, "NOT_FOUND", "Resource not found", null, 404);
    return ok(res, item);
  });

export const createFactory = (Model) =>
  asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    return created(res, item);
  });

export const updateFactory = (Model) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return fail(res, "NOT_FOUND", "Resource not found", null, 404);
    return ok(res, item);
  });

export const deleteFactory = (Model) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return fail(res, "NOT_FOUND", "Resource not found", null, 404);
    return ok(res, { message: "Deleted" });
  });
