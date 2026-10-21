const express = require('express');
const router = express.Router();
const { 
  getGallery, 
  createAlbum, 
  addPhotosToAlbum, 
  deleteAlbum, 
  uploadToGallery 
} = require('../controllers/galleryController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

router.get('/', getGallery);
router.post('/', createAlbum);
router.post('/upload', uploadAttachment, uploadToGallery);
router.post('/:id/photos', addPhotosToAlbum);
router.delete('/:id', deleteAlbum);

module.exports = router;
