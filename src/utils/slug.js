import slugify from "slugify";
export function makeSlug(input) {
  return slugify(String(input || ""), { lower: true, strict: true, trim: true });
}
