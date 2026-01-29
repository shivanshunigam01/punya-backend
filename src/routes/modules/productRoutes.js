import { Router } from "express";
import {
  listProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  compareProducts,
} from "../../controllers/productController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { uploadProductMedia } from "../../middleware/upload.js";
const router = Router();

/* ========= PUBLIC ========= */
router.get("/", listProducts);
router.get("/compare", compareProducts);
router.get("/slug/:slug", getProductBySlug);

/* ========= ADMIN ========= */
router.get(
  "/admin/:id",
  requireAuth,
  requireRole(["master_admin", "admin"]),
  getProductById
);

router.post(
"/",
requireAuth,
requireRole(["master_admin", "admin"]),
uploadProductMedia,
createProduct
);


router.put(
"/:id",
requireAuth,
requireRole(["master_admin", "admin"]),
uploadProductMedia,
updateProduct
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["master_admin", "admin"]),
  deleteProduct
);

export default router;