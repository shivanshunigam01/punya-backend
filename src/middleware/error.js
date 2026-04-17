import { fail } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export function notFound(req, res) {
  return fail(res, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`, null, 404);
}

export function errorHandler(err, req, res, _next) {
  logger.error(err);
  if (err.isJoi) {
    const details = err.details?.map(d => ({ field: d.path?.join("."), message: d.message })) || [];
    return fail(res, "VALIDATION_ERROR", "Invalid input data", details, 400);
  }
  // Razorpay Node SDK rejects with a plain object { statusCode, error } (no .message)
  if (err && typeof err === "object" && err.statusCode && err.error) {
    const rp = err.error;
    const message =
      rp.description || rp.reason || (typeof rp === "string" ? rp : null) || "Payment gateway error";
    const code = rp.code || "RAZORPAY_ERROR";
    const status = err.statusCode;
    return fail(res, code, message, rp.field ? { field: rp.field, source: rp.source } : undefined, status);
  }
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = status === 500 ? "Server error" : (err.message || "Error");
  return fail(res, code, message, err.details, status);
}
