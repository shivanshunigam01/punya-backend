import Joi from "joi";

export const idSchema = Joi.string().hex().length(24);

export const indianMobile = Joi.string()
  .pattern(/^(\+91)?[6-9]\d{9}$/)
  .messages({ "string.pattern.base": "Invalid Indian mobile number" });

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  per_page: Joi.number().integer().min(1).max(100).optional(),
});
