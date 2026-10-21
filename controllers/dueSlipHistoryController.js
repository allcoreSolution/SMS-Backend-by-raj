const DueSlipHistory = require('../models/DueSlipHistory');

exports.getDueSlipHistory = async (req, res) => {
  try {
    const history = await DueSlipHistory.find()
      .populate('generatedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDueSlipBatch = async (req, res) => {
  try {
    const batch = await DueSlipHistory.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, message: 'Due slip batch history deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
