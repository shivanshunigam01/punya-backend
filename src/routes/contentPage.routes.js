import express from "express";
import {
  getAllPages,
  updatePage,
  getSocialLinks,
  updateSocialLinks,
} from "../controllers/contentPage.controller.js";


const router = express.Router();



router.get("/social-links", getSocialLinks);
router.put("/social-links", updateSocialLinks);
router.get("/", getAllPages);
router.put("/:id", updatePage);


export default router;
