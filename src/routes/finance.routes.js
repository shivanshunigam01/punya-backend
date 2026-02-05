import { Router } from "express";
import { createFinanceLead } from "../controllers/financeLeadController";

const router = Router();

router.post("/lead", createFinanceLead);

export default router;
