const express = require('express');
const router = express.Router();
const { uploadMaterial, getMaterials, updateMaterial, deleteMaterial } = require('../controllers/studyMaterialController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

router.post('/upload', uploadAttachment, uploadMaterial);
router.get('/', getMaterials);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;
