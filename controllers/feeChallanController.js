const FeeChallan = require('../models/FeeChallan');
const FeeGroup = require('../models/FeeGroup');

// @desc    Generate new challan(s)
// @route   POST /api/fee-challans/generate
// @access  Admin App (manage_finance)
exports.generateChallan = async (req, res) => {
  try {
    const { student, feeGroup, dueDate } = req.body;

    if (!student || !feeGroup || !dueDate) {
      return res.status(400).json({ success: false, message: 'Student, FeeGroup, and DueDate are required' });
    }

    // Get amount from feeGroup
    const group = await FeeGroup.findById(feeGroup);
    if (!group) {
      return res.status(404).json({ success: false, message: 'FeeGroup not found' });
    }

    // Sum up fee type amounts in the group
    const amount = group.feeTypes.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Generate unique challan no
    const count = await FeeChallan.countDocuments();
    const uniqueTime = Date.now().toString().slice(-4);
    const challanNo = `CHN-${uniqueTime}-${count + 1001}`;

    const challan = await FeeChallan.create({
      challanNo,
      student,
      feeGroup,
      amount,
      dueDate,
      status: 'Issued'
    });

    res.status(201).json({ success: true, message: 'Challan generated successfully', data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all challans
// @route   GET /api/fee-challans
// @access  Admin App (manage_finance)
exports.getFeeChallans = async (req, res) => {
  try {
    const challans = await FeeChallan.find()
      .populate({
        path: 'student',
        select: 'firstName lastName aparId studentEmail studentPhone classId sectionId parentId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' },
          { path: 'parentId', select: 'fatherName motherName fatherPhone' }
        ]
      })
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: challans.length, data: challans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's challans
// @route   GET /api/fee-challans/student/:studentId
// @access  Student App (view own) / Admin App
exports.getFeeChallansByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const challans = await FeeChallan.find({ student: studentId })
      .populate({
        path: 'student',
        select: 'firstName lastName aparId studentEmail studentPhone classId sectionId parentId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' },
          { path: 'parentId', select: 'fatherName motherName fatherPhone' }
        ]
      })
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: challans.length, data: challans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific challan by challanNo or _id
// @route   GET /api/fee-challans/:challanNo
// @access  Admin App / Student App
exports.getFeeChallanByNo = async (req, res) => {
  try {
    const idOrNo = req.params.challanNo;
    const isObjectId = idOrNo && idOrNo.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId 
      ? { $or: [{ _id: idOrNo }, { challanNo: idOrNo }] }
      : { challanNo: idOrNo };

    const challan = await FeeChallan.findOne(query)
      .populate({
        path: 'student',
        select: 'firstName lastName aparId studentEmail studentPhone classId sectionId parentId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' },
          { path: 'parentId', select: 'fatherName motherName fatherPhone' }
        ]
      })
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      });

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    res.json({ success: true, data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update challan (Admin can update dues / date)
// @route   PUT /api/fee-challans/:id
// @access  Admin App (manage_finance)
exports.updateChallan = async (req, res) => {
  try {
    const challan = await FeeChallan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    res.json({ success: true, data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark challan as paid
// @route   PATCH /api/fee-challans/:challanNo/pay
// @access  Admin App (manage_finance)
exports.markChallanPaid = async (req, res) => {
  try {
    const challan = await FeeChallan.findOneAndUpdate(
      { challanNo: req.params.challanNo },
      { status: 'Paid', paymentDate: Date.now() },
      { new: true }
    );
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    res.json({ success: true, message: 'Challan marked as paid', data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete challan
// @route   DELETE /api/fee-challans/:id
// @access  Admin App (manage_finance)
exports.deleteChallan = async (req, res) => {
  try {
    const challan = await FeeChallan.findByIdAndDelete(req.params.id);
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    res.json({ success: true, message: 'Challan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
