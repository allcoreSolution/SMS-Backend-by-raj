const SaaSPlan = require('../models/SaaSPlan');

exports.createPlan = async (req, res) => {
  try {
    const plan = new SaaSPlan(req.body);
    await plan.save();
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SaaSPlan.find({ isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await SaaSPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await SaaSPlan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.status(200).json({ success: true, message: 'Plan deactivated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
