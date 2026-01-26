export const ok = (res, data, meta) => res.json({ success: true, data, ...(meta ? { meta } : {}) });
export const created = (res, data) => res.status(201).json({ success: true, data });
export const fail = (res, code, message, details, status = 400) =>
  res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
