import ContentPage from "../models/contentPage.model.js";
import SocialLinks from "../models/socialLinks.model.js";

/**
 * GET /api/content-pages
 */
export const getAllPages = async (req, res) => {
  const pages = await ContentPage.find().sort({ key: 1 });
  res.json(pages);
};

/**
 * PUT /api/content-pages/:id
 */
export const updatePage = async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({
      message: "Invalid content page id",
    });
  }

  const page = await ContentPage.findByIdAndUpdate(
    id,
    {
      contentEn: req.body.contentEn,
      contentHi: req.body.contentHi,
    },
    { new: true }
  );

  if (!page) {
    return res.status(404).json({ message: "Page not found" });
  }

  res.json(page);
};


/**
 * GET /api/content-pages/social-links
 */
export const getSocialLinks = async (req, res) => {
  let links = await SocialLinks.findOne();

  if (!links) {
    links = await SocialLinks.create({});
  }

  res.json(links);
};

/**
 * PUT /api/content-pages/social-links
 */
export const updateSocialLinks = async (req, res) => {
  let links = await SocialLinks.findOne();

  if (!links) {
    links = await SocialLinks.create(req.body);
  } else {
    Object.assign(links, req.body);
    await links.save();
  }

  res.json(links);
};
