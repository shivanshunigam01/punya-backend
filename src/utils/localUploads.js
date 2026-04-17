import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");

const sanitizeSegment = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9-_]/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");

export const ensureUploadDir = (...segments) => {
  const safeSegments = segments
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean);
  const absoluteDir = path.join(uploadsRoot, ...safeSegments);
  fs.mkdirSync(absoluteDir, { recursive: true });
  return absoluteDir;
};

export const moveUploadToDir = (file, ...segments) => {
  const targetDir = ensureUploadDir(...segments);
  const targetPath = path.join(targetDir, path.basename(file.path));

  fs.renameSync(file.path, targetPath);

  const relativePath = path
    .relative(uploadsRoot, targetPath)
    .split(path.sep)
    .join("/");

  return `/uploads/${relativePath}`;
};

export const deleteLocalUpload = (uploadUrl) => {
  if (typeof uploadUrl !== "string" || !uploadUrl.startsWith("/uploads/")) return;

  const absolutePath = path.join(uploadsRoot, uploadUrl.replace(/^\/uploads\//, ""));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};
