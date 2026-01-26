import { Router } from "express";
import { login, refresh, logout } from "../../controllers/authController.js";
import { requireAuth } from "../../middleware/auth.js";

const r = Router();

r.post("/login", login);
r.post("/refresh", refresh);
r.post("/logout", requireAuth, logout);

export default r;
