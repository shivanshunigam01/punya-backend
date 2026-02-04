import { Router } from "express";
import {
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole(["master_admin", "admin"]), getAllUsers);
router.post("/", requireRole(["master_admin"]), registerUser);
router.put("/:id", requireRole(["master_admin"]), updateUser);
router.delete("/:id", requireRole(["master_admin"]), deleteUser);

export default router;
