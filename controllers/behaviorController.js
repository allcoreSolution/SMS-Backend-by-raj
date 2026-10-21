const BehaviorRecord = require('../models/BehaviorRecord');
const Student = require('../models/Student');

// @desc    Get all behavior records
// @route   GET /api/behavior
exports.getBehaviorRecords = async (req, res) => {
  try {
    const { studentId, type, search } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (type && type !== 'All') query.type = type;

    const records = await BehaviorRecord.find(query)
      .populate({
        path: 'studentId',
        select: 'firstName lastName aparId admissionNo classId sectionId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' }
        ]
      })
      .sort({ incidentDate: -1, createdAt: -1 });

    const formatted = records.map(r => ({
      _id: r._id,
      id: r._id,
      studentId: r.studentId?._id,
      student: r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName || ''}`.trim() : 'Unknown',
      studentAdmNo: r.studentId?.admissionNo || r.studentId?.aparId || '-',
      classSection: r.studentId?.classId ? `${r.studentId.classId.className || ''} (${r.studentId.sectionId?.sectionName || 'A'})` : 'N/A',
      title: r.title,
      type: r.type,
      points: r.points,
      incidentDate: r.incidentDate,
      date: new Date(r.incidentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportedBy: r.reportedBy,
      description: r.description
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

// @desc    Create behavior record
// @route   POST /api/behavior
exports.createBehaviorRecord = async (req, res) => {
  try {
    const { studentId, title, type, points, incidentDate, reportedBy, description } = req.body;
    if (!studentId || !title) {
      return res.status(400).json({ success: false, message: 'Student and Title are required' });
    }

    const record = await BehaviorRecord.create({
      studentId,
      title,
      type: type || 'Positive',
      points: Number(points) || 1,
      incidentDate: incidentDate || new Date(),
      reportedBy: reportedBy || 'Class Teacher',
      description: description || ''
    });

    const populated = await BehaviorRecord.findById(record._id)
      .populate({
        path: 'studentId',
        select: 'firstName lastName aparId admissionNo classId sectionId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' }
        ]
      });

    return res.status(201).json({
      success: true,
      message: 'Behavior record added successfully',
      data: populated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete behavior record
// @route   DELETE /api/behavior/:id
exports.deleteBehaviorRecord = async (req, res) => {
  try {
    const record = await BehaviorRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await record.deleteOne();
    return res.json({ success: true, message: 'Behavior record deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
