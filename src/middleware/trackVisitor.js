import VisitLog from "../models/VisitLog.js";

export const trackVisitor = async (req, _res, next) => {
  if (req.path.startsWith("/admin")) return next();

  await VisitLog.create({
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
    path: req.originalUrl,
  });

  next();
};
