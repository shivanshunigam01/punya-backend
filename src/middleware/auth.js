import jwt from "jsonwebtoken";
import { fail } from "../utils/apiResponse.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "UNAUTHORIZED", "Missing token", null, 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return fail(res, "UNAUTHORIZED", "Invalid or expired token", null, 401);
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || (roles.length && !roles.includes(role))) {
      return fail(res, "FORBIDDEN", "Insufficient permissions", null, 403);
    }
    return next();
  };
}
