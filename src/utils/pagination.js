export function parsePagination(query, defaults = { page: 1, per_page: 20 }) {
  const page = Math.max(1, parseInt(query.page || defaults.page, 10));
  const per_page = Math.min(100, Math.max(1, parseInt(query.per_page || defaults.per_page, 10)));
  const skip = (page - 1) * per_page;
  return { page, per_page, skip, limit: per_page };
}
