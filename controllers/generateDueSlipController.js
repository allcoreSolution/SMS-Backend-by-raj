const AssignFee = require('../models/AssignFee');
const FeeCollection = require('../models/FeeCollection');
const DueSlipHistory = require('../models/DueSlipHistory');

const getExpectedAmount = (assignRecord) => {
  if (assignRecord.customAmount !== null && assignRecord.customAmount !== undefined) {
    return assignRecord.customAmount;
  }
  if (!assignRecord.feeGroup || !assignRecord.feeGroup.feeTypes) return 0;
  return assignRecord.feeGroup.feeTypes.reduce((sum, item) => sum + (item.amount || 0), 0);
};

exports.generateDueSlips = async (req, res) => {
  try {
    const { targetClass, targetSection, month, year, dueBasis } = req.body;

    // Fetch assigned fees
    const assignedFees = await AssignFee.find()
      .populate({
        path: 'student',
        select: 'firstName lastName aparId studentEmail studentPhone classId sectionId',
        populate: [
          { path: 'classId', select: 'className' },
          { path: 'sectionId', select: 'sectionName' }
        ]
      })
      .populate({
        path: 'feeGroup',
        populate: { path: 'feeTypes.feeType' }
      });

    const collections = await FeeCollection.find();
    const studentMap = {};

    assignedFees.forEach(record => {
      if (!record.student) return;
      
      const studentId = record.student._id.toString();
      const expected = getExpectedAmount(record);

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: record.student,
          studentName: `${record.student.firstName || ''} ${record.student.lastName || ''}`.trim(),
          admissionNo: record.student.aparId || 'N/A',
          className: record.student.classId?.className || 'Class I',
          sectionName: record.student.sectionId?.sectionName || 'A',
          totalAssigned: 0,
          totalPaid: 0,
          totalDue: 0
        };
      }

      studentMap[studentId].totalAssigned += expected;
    });

    collections.forEach(payment => {
      const studentId = payment.student.toString();
      if (studentMap[studentId]) {
        studentMap[studentId].totalPaid += (payment.amountPaid || 0);
      }
    });

    // Calculate dues and filter students with dues
    let dueStudents = Object.values(studentMap).map(item => {
      item.totalDue = Math.max(0, item.totalAssigned - item.totalPaid);
      return item;
    }).filter(item => item.totalDue > 0);

    // Filter by targetClass if provided
    if (targetClass && targetClass !== 'All' && targetClass !== 'all') {
      dueStudents = dueStudents.filter(s => 
        s.className.toLowerCase().includes(targetClass.toLowerCase()) ||
        (s.student.classId && s.student.classId._id.toString() === targetClass)
      );
    }

    // Filter by targetSection if provided
    if (targetSection && targetSection !== 'All' && targetSection !== 'all') {
      dueStudents = dueStudents.filter(s => 
        s.sectionName.toLowerCase() === targetSection.toLowerCase() ||
        (s.student.sectionId && s.student.sectionId._id.toString() === targetSection)
      );
    }

    if (dueStudents.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No students with outstanding dues found for the selected criteria', 
        data: [], 
        slips: [] 
      });
    }

    const totalDueAmount = dueStudents.reduce((sum, s) => sum + s.totalDue, 0);

    // Generate unique batch ID
    const count = await DueSlipHistory.countDocuments();
    const uniqueTime = Date.now().toString().slice(-4);
    const batchId = `BATCH-${uniqueTime}-${count + 1001}`;

    const history = await DueSlipHistory.create({
      batchId,
      generatedBy: req.user._id,
      studentsCount: dueStudents.length,
      totalDueAmount,
      targetClass: targetClass || 'All',
      targetSection: targetSection || 'All'
    });

    const slips = dueStudents.map((s, idx) => ({
      id: idx + 1,
      code: `DS-${batchId.slice(-4)}-${101 + idx}`,
      student: s.studentName,
      admission: s.admissionNo,
      classSec: `${s.className} - ${s.sectionName}`,
      month: month || 'March',
      year: year || '2026',
      basis: dueBasis || 'Till this Month (arrears + current)',
      prevDue: Math.round(s.totalDue * 0.45),
      currDue: Math.round(s.totalDue * 0.55),
      totalDue: s.totalDue,
      generatedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));

    res.status(201).json({
      success: true,
      message: 'Due slips generated successfully',
      batch: history,
      slips
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDueSlipsStatus = async (req, res) => {
  try {
    const latestBatches = await DueSlipHistory.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, batches: latestBatches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

