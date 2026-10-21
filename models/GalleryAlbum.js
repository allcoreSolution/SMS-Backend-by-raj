const mongoose = require('mongoose');

const galleryAlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Album title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: ['Sports', 'Culture', 'Academic', 'Annual Day', 'Campus', 'General'],
    default: 'General'
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1574629810360-7efbb6b4904c?w=800&auto=format&fit=crop&q=80'
  },
  photos: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('GalleryAlbum', galleryAlbumSchema);
