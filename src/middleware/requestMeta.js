export function attachRequestMeta(req, _res, next) {
  req.clientInfo = {
    ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"] || "",
    referrer: req.headers.referer || req.headers.referrer || "",
  };
  next();
}
