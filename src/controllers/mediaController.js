import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { MediaFile } from "../models/MediaFile.js";
import { parsePagination } from "../utils/pagination.js";
import mongoose from "mongoose";

export const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, "VALIDATION_ERROR", "file is required", null, 400);

  const f = req.file;
  const doc = await MediaFile.create({
    url: f.path,
    thumbnail_url: f.path, // Cloudinary can transform; keep same by default
    filename: f.filename,
    original_filename: f.originalname,
    folder: req.body.folder || "general",
    size: f.size,
    mime_type: f.mimetype,
    uploaded_by: req.user.id,
  });

  return ok(res, {
    id: doc._id,
    url: doc.url,
    thumbnail_url: doc.thumbnail_url,
    filename: doc.filename,
    size: doc.size,
    mime_type: doc.mime_type,
  });
});

export const uploadMultiple = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) return fail(res, "VALIDATION_ERROR", "files are required", null, 400);

  const folder = req.body.folder || "general";
  const createdDocs = await MediaFile.insertMany(files.map(f => ({
    url: f.path,
    thumbnail_url: f.path,
    filename: f.filename,
    original_filename: f.originalname,
    folder,
    size: f.size,
    mime_type: f.mimetype,
    uploaded_by: req.user.id,
  })));

  return created(res, createdDocs.map(d => ({ id: d._id, url: d.url, filename: d.filename })));
});

export const listMedia = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.folder) q.folder = req.query.folder;

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    MediaFile.find(q).sort({ created_at: -1 }).skip(skip).limit(limit),
    MediaFile.countDocuments(q),
  ]);

return ok(
  res,
  items.map(m => ({
    id: m._id.toString(),   // ✅ CRITICAL FIX
    url: m.url,
    thumbnail_url: m.thumbnail_url,
    filename: m.filename,
    original_filename: m.original_filename,
    folder: m.folder,
    size: m.size,
    mime_type: m.mime_type,
    createdAt: m.created_at,
  })),
  { total, page, per_page }
);

});

export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return fail(res, "VALIDATION_ERROR", "Invalid media id", null, 400);
  }

  const item = await MediaFile.findByIdAndDelete(id);
  if (!item) {
    return fail(res, "NOT_FOUND", "Media not found", null, 404);
  }

  return ok(res, { message: "Deleted" });
});