import Timeline from "../models/Timeline.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadImage,
  deleteImage,
} from "../services/cloudinaryService.js";


// ✅ GET ALL (ADMIN)
const getAllTimeline = asyncHandler(async (req, res) => {
  const events = await Timeline.find().sort({ year: -1, displayOrder: 1 });

  res.json({
    success: true,
    data: events,
  });
});

// ✅ GET ACTIVE (PUBLIC)
const getActiveTimeline = asyncHandler(async (req, res) => {
  const events = await Timeline.find({ isActive: true }).sort({
    year: -1,
    displayOrder: 1,
  });

  res.json({
    success: true,
    data: events,
  });
});

// ✅ GET BY ID
const getTimelineById = asyncHandler(async (req, res) => {
  const event = await Timeline.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Timeline event not found",
    });
  }

  res.json({
    success: true,
    data: event,
  });
});

// ✅ CREATE
const createTimeline = asyncHandler(async (req, res) => {
  const { title, description, year, imageType, isActive, displayOrder } =
    req.body;

  let imageData = {};

  if (req.file) {
    const uploaded = await uploadImage(req.file.path, "timeline");

    imageData = {
      image: uploaded.url,
      publicId: uploaded.publicId,
    };
  }

  const event = await Timeline.create({
    title,
    description,
    year: Number(year),
    image: imageData.image || "",
    publicId: imageData.publicId || "",
    imageType,
    isActive: isActive === "true" || isActive === true,
    displayOrder: Number(displayOrder) || 0,
  });

  res.status(201).json({
    success: true,
    message: "Timeline event created",
    data: event,
  });
});

// ✅ UPDATE
const updateTimeline = asyncHandler(async (req, res) => {
  const event = await Timeline.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Timeline event not found",
    });
  }

  const { title, description, year, imageType, isActive, displayOrder } =
    req.body;

  // 🔥 Handle Image Update
  if (req.file) {
    // delete old image
    if (event.publicId) {
      await deleteImage(event.publicId);
    }

    const uploaded = await uploadImage(req.file.path, "timeline");

    event.image = uploaded.url;
    event.publicId = uploaded.publicId;
  }

  // Update fields
  event.title = title || event.title;
  event.description =
    description !== undefined ? description : event.description;
  event.year = year ? Number(year) : event.year;
  event.imageType = imageType || event.imageType;
  event.isActive = isActive === "true" || isActive === true;
  event.displayOrder =
    displayOrder !== undefined ? Number(displayOrder) : event.displayOrder;

  await event.save();

  res.json({
    success: true,
    message: "Timeline updated successfully",
    data: event,
  });
});

// ✅ DELETE
const deleteTimeline = asyncHandler(async (req, res) => {
  const event = await Timeline.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Timeline event not found",
    });
  }

  if (event.publicId) {
    await deleteImage(event.publicId);
  }

  await event.deleteOne();

  res.json({
    success: true,
    message: "Timeline event deleted",
  });
});

export {
  getAllTimeline,
  getActiveTimeline,
  getTimelineById,
  createTimeline,
  updateTimeline,
  deleteTimeline,
};