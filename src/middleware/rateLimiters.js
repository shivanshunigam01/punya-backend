import rateLimit from "express-rate-limit";

export const rateLimiters = {
  general: rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),

  leads: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try later." } },
    keyGenerator: (req) => req.body?.customer_mobile || req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),

  contact: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try later." } },
    keyGenerator: (req) => req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),

  cibil: rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many CIBIL requests. Try later." } },
    keyGenerator: (req) => req.body?.mobile || req.ip,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
};
