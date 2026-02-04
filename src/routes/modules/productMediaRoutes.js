// src/routes/modules/productMediaRoutes.js
import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js"; // ✅ INSTANCE ONLY
import { requireAuth, requireRole } from "../../middleware/auth.js";
import  Product  from "../../models/Product.js";
import { ok, fail } from "../../utils/apiResponse.js";

const router = Router();

/* =========================
   IMAGE UPLOAD (GALLERY)
   ========================= */

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "patliputra/products/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadImages = multer({ storage: imageStorage });

router.post(
  "/:id/images",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  uploadImages.array("images", 10),
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);

    const urls = req.files.map(f => f.path);
    product.gallery_images.push(...urls);
    await product.save();

    return ok(res, { gallery_images: product.gallery_images });
  }
);

/* =========================
   BROCHURE UPLOAD (PDF)
   ========================= */

const brochureStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "patliputra/products/brochures",
    resource_type: "raw",
    allowed_formats: ["pdf"],
  },
});

const uploadBrochure = multer({ storage: brochureStorage });

router.post(
  "/:id/brochure",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  uploadBrochure.single("brochure"),
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);

    product.brochure_url = req.file.path;
    product.brochure_updated_at = new Date();
    await product.save();

    return ok(res, { brochure_url: product.brochure_url });
  }
);

export default router;