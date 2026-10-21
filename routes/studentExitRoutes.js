const express = require('express');
const router = express.Router();
const {
  getExitRecords,
  createExitRecord,
  cancelExitRecord
} = require('../controllers/studentExitController');

router.route('/')
  .get(getExitRecords)
  .post(createExitRecord);

router.route('/:id')
  .delete(cancelExitRecord);

module.exports = router;
