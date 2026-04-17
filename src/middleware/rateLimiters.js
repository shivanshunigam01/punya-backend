import rateLimit from "express-rate-limit";

/** Stops ERR_ERL_UNEXPECTED_X_FORWARDED_FOR if a proxy adds X-Forwarded-For before trust proxy is applied. */
const rlValidate = { xForwardedForHeader: false };

export const rateLimiters = {
  general: rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: rlValidate,
  }),

  leads: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try later." } },
    keyGenerator: (req) => req.body?.customer_mobile || req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: rlValidate,
  }),

  contact: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try later." } },
    keyGenerator: (req) => req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: rlValidate,
  }),

  cibil: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many CIBIL requests. Try later." } },
    keyGenerator: (req) => req.body?.mobile || req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: rlValidate,
  }),

  cibilCreateOrder: rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many CIBIL order attempts. Try again shortly." } },
    keyGenerator: (req) => req.body?.mobile || req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: rlValidate,
  }),

  cibilVerify: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many CIBIL verification attempts. Try later." } },
    keyGenerator: (req) => req.body?.razorpay_order_id || req.body?.mobile || req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: rlValidate,
  }),
};
