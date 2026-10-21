const express = require('express');
const router = express.Router();
const { 
  assignHomework, 
  getHomework, 
  submitHomework, 
  deleteHomework 
} = require('../controllers/homeworkController');
const { uploadAttachment } = require('../middleware/uploadMiddleware');

router.post('/assign', uploadAttachment, assignHomework);
router.post('/submit', submitHomework);
router.get('/', getHomework); // pass ?classId=&sectionId=&studentId=
router.delete('/:id', deleteHomework);

module.exports = router;
