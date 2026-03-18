const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    image: {
      type: String,
      default: '',
    },
    imageType: {
      type: String,
      enum: ['milestone', 'achievement', 'expansion', 'partnership', 'award', 'launch', 'other'],
      default: 'milestone',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

timelineSchema.index({ year: -1, displayOrder: 1 });

module.exports = mongoose.model('Timeline', timelineSchema);
