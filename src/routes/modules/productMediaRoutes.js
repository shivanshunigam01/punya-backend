// src/routes/modules/productMediaRoutes.js
import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import  Product  from "../../models/Product.js";
import { ok, fail } from "../../utils/apiResponse.js";
import { moveUploadToDir } from "../../utils/localUploads.js";

const router = Router();

/* =========================
   IMAGE UPLOAD (GALLERY)
   ========================= */

const uploadImages = multer({ dest: "uploads/tmp" });

router.post(
  "/:id/images",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  uploadImages.array("images", 10),
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);

    const urls = req.files.map((file) =>
      moveUploadToDir(file, "products", "images")
    );
    product.gallery_images.push(...urls);
    if (!product.featured_image && urls[0]) {
      product.featured_image = urls[0];
    }
    await product.save();

    return ok(res, { gallery_images: product.gallery_images });
  }
);

/* =========================
   BROCHURE UPLOAD (PDF)
   ========================= */

const uploadBrochure = multer({ dest: "uploads/tmp" });

router.post(
  "/:id/brochure",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  uploadBrochure.single("brochure"),
  async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, "NOT_FOUND", "Product not found", null, 404);

    product.brochure_url = moveUploadToDir(req.file, "products", "brochures");
    product.brochure_updated_at = new Date();
    await product.save();

    return ok(res, { brochure_url: product.brochure_url });
  }
);

export default router;