const StudentExit = require('../models/StudentExit');
const Student = require('../models/Student');

// @desc    Get all TC & Exit records
// @route   GET /api/student-exits
exports.getExitRecords = async (req, res) => {
  try {
    const { standing, search } = req.query;
    const query = {};

    if (standing && standing !== 'All') {
      query.standing = standing;
    }

    const records = await StudentExit.find(query)
      .populate({
        path: 'studentId',
        select: 'firstName lastName aparId admissionNo classId sectionId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' }
        ]
      })
      .sort({ leftOn: -1, createdAt: -1 });

    const formatted = records.map(r => ({
      _id: r._id,
      id: r.studentId?.admissionNo || r.studentId?.aparId || r.tcNo,
      recordId: r._id,
      studentId: r.studentId?._id,
      name: r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName || ''}`.trim() : 'Unknown',
      standing: r.standing,
      leftOn: r.leftOn ? new Date(r.leftOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      lastClass: r.lastClass || r.studentId?.classId?.className || 'N/A',
      tcNo: r.tcNo,
      duesCleared: r.duesCleared,
      reason: r.reason,
      characterConduct: r.characterConduct,
      recordedBy: r.recordedBy
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue / Register a TC exit
// @route   POST /api/student-exits
exports.createExitRecord = async (req, res) => {
  try {
    const { studentId, tcNo, standing, leftOn, lastClass, duesCleared, reason, characterConduct, recordedBy } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const count = await StudentExit.countDocuments();
    const generatedTc = tcNo || `TC-2026-${String(count + 101).padStart(4, '0')}`;

    const exitRecord = await StudentExit.create({
      studentId,
      tcNo: generatedTc,
      standing: standing || 'TC Register',
      leftOn: leftOn || new Date(),
      lastClass: lastClass || '',
      duesCleared: duesCleared !== undefined ? duesCleared : true,
      reason: reason || 'Parent Relocation / Higher Studies',
      characterConduct: characterConduct || 'Good',
      recordedBy: recordedBy || 'School Admin'
    });

    // Update student status in Student collection
    const studentStatus = standing === 'On Hold' ? 'On Hold' : 'Exited';
    await Student.findByIdAndUpdate(studentId, { status: studentStatus });

    return res.status(201).json({
      success: true,
      message: 'Student exit / TC processed successfully',
      data: exitRecord
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel exit / Re-enable student account
// @route   DELETE /api/student-exits/:id
exports.cancelExitRecord = async (req, res) => {
  try {
    const record = await StudentExit.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Exit record not found' });
    }

    // Re-enable student status back to Active
    if (record.studentId) {
      await Student.findByIdAndUpdate(record.studentId, { status: 'Active' });
    }

    await record.deleteOne();

    return res.json({
      success: true,
      message: 'Exit cancelled and student account reactivated to Active'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
