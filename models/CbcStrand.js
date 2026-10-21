const mongoose = require('mongoose');

const subStrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  outcome: { type: String },
  lvl4: { type: String, default: 'Exceeding Expectations: Demonstrates mastery independently and innovatively.' },
  lvl3: { type: String, default: 'Meeting Expectations: Demonstrates the required competency accurately.' },
  lvl2: { type: String, default: 'Approaching Expectations: Demonstrates competency with occasional guidance.' },
  lvl1: { type: String, default: 'Below Expectations: Requires significant support to perform task.' }
});

const cbcStrandSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  strandName: { type: String, required: true },
  classGrade: { type: String, default: 'Grade 1 - 6' },
  subStrands: [subStrandSchema]
}, { timestamps: true });

module.exports = mongoose.model('CbcStrand', cbcStrandSchema);
