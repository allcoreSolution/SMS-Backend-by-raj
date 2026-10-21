const express = require('express');
const router = express.Router();
const { createNotice, getNotices, getNoticeById, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

router.post('/', uploadAttachment, createNotice);
router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.put('/:id', uploadAttachment, updateNotice);
router.delete('/:id', deleteNotice);

module.exports = router;

