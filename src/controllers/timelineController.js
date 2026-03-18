const Timeline = require('../models/Timeline');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// ✅ GET ALL (Admin)
exports.getAll = asyncHandler(async (req, res) => {
  const events = await Timeline.find().sort({ year: -1, displayOrder: 1 });
  res.json({ data: events });
});

// ✅ GET ACTIVE (Public - for user panel)
exports.getActive = asyncHandler(async (req, res) => {
  const events = await Timeline.find({ isActive: true }).sort({ year: -1, displayOrder: 1 });
  res.json({ data: events });
});

// ✅ GET BY ID
exports.getById = asyncHandler(async (req, res) => {
  const event = await Timeline.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Timeline event not found' });
  res.json({ data: event });
});

// ✅ CREATE (with Cloudinary image upload)
exports.create = asyncHandler(async (req, res) => {
  const { title, description, year, imageType, isActive, displayOrder } = req.body;

  let imageUrl = '';
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'patliputra/timeline',
      transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    });
    imageUrl = result.secure_url;
  }

  const event = await Timeline.create({
    title,
    description,
    year: Number(year),
    image: imageUrl,
    imageType,
    isActive: isActive === 'true' || isActive === true,
    displayOrder: Number(displayOrder) || 0,
  });

  res.status(201).json({ data: event });
});

// ✅ UPDATE
exports.update = asyncHandler(async (req, res) => {
  const event = await Timeline.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Timeline event not found' });

  const { title, description, year, imageType, isActive, displayOrder, existingImage } = req.body;

  event.title = title || event.title;
  event.description = description !== undefined ? description : event.description;
  event.year = year ? Number(year) : event.year;
  event.imageType = imageType || event.imageType;
  event.isActive = isActive === 'true' || isActive === true;
  event.displayOrder = displayOrder !== undefined ? Number(displayOrder) : event.displayOrder;

  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (event.image) {
      const publicId = event.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'patliputra/timeline',
      transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    });
    event.image = result.secure_url;
  } else if (existingImage) {
    event.image = existingImage;
  } else {
    event.image = '';
  }

  await event.save();
  res.json({ data: event });
});

// ✅ DELETE
exports.remove = asyncHandler(async (req, res) => {
  const event = await Timeline.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Timeline event not found' });

  // Delete image from Cloudinary
  if (event.image) {
    const publicId = event.image.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  await event.deleteOne();
  res.json({ message: 'Timeline event deleted' });
});