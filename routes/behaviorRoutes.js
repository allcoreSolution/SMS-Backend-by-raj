const express = require('express');
const router = express.Router();
const {
  getBehaviorRecords,
  createBehaviorRecord,
  deleteBehaviorRecord
} = require('../controllers/behaviorController');

router.route('/')
  .get(getBehaviorRecords)
  .post(createBehaviorRecord);

router.route('/:id')
  .delete(deleteBehaviorRecord);

module.exports = router;
