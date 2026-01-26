import Joi from "joi";
import { ContactSubmission } from "../models/ContactSubmission.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

const createSchema = Joi.object({
  name: Joi.string().required(),
  mobile: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
  email: Joi.string().email().allow("", null),
  subject: Joi.string().allow("", null),
  message: Joi.string().required(),
});

export const createContact = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const item = await ContactSubmission.create(value);
  return created(res, { id: item._id, message: "Thanks! We received your message." });
});

export const listContacts = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.status) q.status = req.query.status;

  const { page, per_page, skip, limit } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    ContactSubmission.find(q).sort({ created_at: -1 }).skip(skip).limit(limit),
    ContactSubmission.countDocuments(q),
  ]);
  return ok(res, items, { total, page, per_page });
});

export const patchContactStatus = asyncHandler(async (req, res) => {
  const schema = Joi.object({ status: Joi.string().valid("new","read","replied","closed").required(), reply_message: Joi.string().allow("", null) });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const update = { status: value.status };
  if (value.status === "replied") {
    update.replied_at = new Date();
    update.reply_message = value.reply_message || "";
  }

  const item = await ContactSubmission.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return fail(res, "NOT_FOUND", "Contact submission not found", null, 404);
  return ok(res, item);
});
