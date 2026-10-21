const FeeType = require('../models/FeeType');

exports.createFeeType = async (req, res) => {
  try {
    const feeType = await FeeType.create(req.body);
    res.status(201).json({ success: true, data: feeType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeTypes = async (req, res) => {
  try {
    const feeTypes = await FeeType.find();
    res.json({ success: true, count: feeTypes.length, data: feeTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeTypeById = async (req, res) => {
  try {
    const feeType = await FeeType.findById(req.params.id);
    if (!feeType) return res.status(404).json({ success: false, message: 'FeeType not found' });
    res.json({ success: true, data: feeType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeeType = async (req, res) => {
  try {
    const feeType = await FeeType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!feeType) return res.status(404).json({ success: false, message: 'FeeType not found' });
    res.json({ success: true, data: feeType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeeType = async (req, res) => {
  try {
    const feeType = await FeeType.findByIdAndDelete(req.params.id);
    if (!feeType) return res.status(404).json({ success: false, message: 'FeeType not found' });
    res.json({ success: true, message: 'FeeType deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
