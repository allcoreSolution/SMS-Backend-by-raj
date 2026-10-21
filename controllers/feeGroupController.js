const FeeGroup = require('../models/FeeGroup');

exports.createFeeGroup = async (req, res) => {
  try {
    const feeGroup = await FeeGroup.create(req.body);
    res.status(201).json({ success: true, data: feeGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeGroups = async (req, res) => {
  try {
    const feeGroups = await FeeGroup.find().populate('feeTypes');
    res.json({ success: true, count: feeGroups.length, data: feeGroups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeGroupById = async (req, res) => {
  try {
    const feeGroup = await FeeGroup.findById(req.params.id).populate('feeTypes');
    if (!feeGroup) return res.status(404).json({ success: false, message: 'FeeGroup not found' });
    res.json({ success: true, data: feeGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeeGroup = async (req, res) => {
  try {
    const feeGroup = await FeeGroup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('feeTypes');
    if (!feeGroup) return res.status(404).json({ success: false, message: 'FeeGroup not found' });
    res.json({ success: true, data: feeGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeeGroup = async (req, res) => {
  try {
    const feeGroup = await FeeGroup.findByIdAndDelete(req.params.id);
    if (!feeGroup) return res.status(404).json({ success: false, message: 'FeeGroup not found' });
    res.json({ success: true, message: 'FeeGroup deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
