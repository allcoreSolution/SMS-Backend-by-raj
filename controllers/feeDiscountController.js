const FeeDiscount = require('../models/FeeDiscount');

exports.createFeeDiscount = async (req, res) => {
  try {
    const feeDiscount = await FeeDiscount.create(req.body);
    res.status(201).json({ success: true, data: feeDiscount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeDiscounts = async (req, res) => {
  try {
    const feeDiscounts = await FeeDiscount.find();
    res.json({ success: true, count: feeDiscounts.length, data: feeDiscounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeDiscountById = async (req, res) => {
  try {
    const feeDiscount = await FeeDiscount.findById(req.params.id);
    if (!feeDiscount) return res.status(404).json({ success: false, message: 'FeeDiscount not found' });
    res.json({ success: true, data: feeDiscount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeeDiscount = async (req, res) => {
  try {
    const feeDiscount = await FeeDiscount.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!feeDiscount) return res.status(404).json({ success: false, message: 'FeeDiscount not found' });
    res.json({ success: true, data: feeDiscount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeeDiscount = async (req, res) => {
  try {
    const feeDiscount = await FeeDiscount.findByIdAndDelete(req.params.id);
    if (!feeDiscount) return res.status(404).json({ success: false, message: 'FeeDiscount not found' });
    res.json({ success: true, message: 'FeeDiscount deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
