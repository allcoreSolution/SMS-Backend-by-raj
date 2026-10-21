const Branch = require('../models/Branch');

exports.addBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) { next(error); }
};

exports.getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find();
    res.status(200).json({ success: true, count: branches.length, data: branches });
  } catch (error) { next(error); }
};

exports.updateBranch = async (req, res, next) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: branch });
    } catch (error) { next(error); }
};

exports.deleteBranch = async (req, res, next) => {
    try {
        await Branch.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Branch deleted' });
    } catch (error) { next(error); }
};
