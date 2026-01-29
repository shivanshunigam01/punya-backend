import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Create User
router.post(
  "/register",
  requireAuth,
  requireRole(["master_admin", "admin"]),
  registerUser
);

export default router;