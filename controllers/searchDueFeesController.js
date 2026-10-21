const AssignFee = require('../models/AssignFee');
const FeeCollection = require('../models/FeeCollection');
const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');
const Student = require('../models/Student');

const getExpectedAmount = (assignRecord) => {
  if (assignRecord.customAmount !== null && assignRecord.customAmount !== undefined) {
    return assignRecord.customAmount;
  }
  if (!assignRecord.feeGroup || !assignRecord.feeGroup.feeTypes) return 0;
  return assignRecord.feeGroup.feeTypes.reduce((sum, item) => sum + (item.amount || 0), 0);
};

exports.searchDueFees = async (req, res) => {
  try {
    const assignedFees = await AssignFee.find()
      .populate({
        path: 'student',
        select: 'firstName lastName aparId studentEmail studentPhone classId sectionId',
        populate: [
          { path: 'classId', select: 'className numericValue' },
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
          _id: record.student._id,
          id: record.student._id,
          admissionNo: record.student.aparId,
          aparId: record.student.aparId,
          firstName: record.student.firstName,
          lastName: record.student.lastName,
          name: `${record.student.firstName || ''} ${record.student.lastName || ''}`.trim(),
          class: record.student.classId?.className || 'Class I',
          section: record.student.sectionId?.sectionName || 'A',
          academicClass: record.student.classId,
          studentEmail: record.student.studentEmail,
          studentPhone: record.student.studentPhone,
          student: record.student,
          totalAssigned: 0,
          totalPaid: 0,
          totalDue: 0,
          groups: []
        };
      }

      studentMap[studentId].totalAssigned += expected;
      if (record.feeGroup) {
        studentMap[studentId].groups.push({
          feeGroupId: record.feeGroup._id,
          name: record.feeGroup.name,
          expected,
          paid: 0,
          due: expected,
          dueDate: record.dueDate
        });
      }
    });

    collections.forEach(payment => {
      const studentId = payment.student?.toString();
      const groupId = payment.feeGroup?.toString();

      if (studentId && studentMap[studentId]) {
        studentMap[studentId].totalPaid += (payment.amountPaid || 0);
        const groupObj = studentMap[studentId].groups.find(g => g.feeGroupId?.toString() === groupId);
        if (groupObj) {
          groupObj.paid += (payment.amountPaid || 0);
          groupObj.due = Math.max(0, groupObj.expected - groupObj.paid);
        }
      }
    });

    const results = Object.values(studentMap).map(item => {
      item.totalDue = Math.max(0, item.totalAssigned - item.totalPaid);
      return item;
    }).filter(item => item.totalDue > 0);

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchStudentDueFees = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.params.studentId;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId required' });

    const assignedFees = await AssignFee.find({ student: studentId })
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

    const collections = await FeeCollection.find({ student: studentId });
    
    if (assignedFees.length === 0) {
       return res.json({ success: true, data: [] });
    }

    const firstStudent = assignedFees[0].student;
    const studentObj = {
      _id: firstStudent._id,
      id: firstStudent._id,
      admissionNo: firstStudent.aparId,
      aparId: firstStudent.aparId,
      firstName: firstStudent.firstName,
      lastName: firstStudent.lastName,
      name: `${firstStudent.firstName || ''} ${firstStudent.lastName || ''}`.trim(),
      class: firstStudent.classId?.className || 'Class I',
      section: firstStudent.sectionId?.sectionName || 'A',
      studentEmail: firstStudent.studentEmail,
      studentPhone: firstStudent.studentPhone,
      student: firstStudent,
      totalAssigned: 0,
      totalPaid: 0,
      totalDue: 0,
      groups: []
    };

    assignedFees.forEach(record => {
      const expected = getExpectedAmount(record);
      studentObj.totalAssigned += expected;
      if (record.feeGroup) {
        studentObj.groups.push({
          feeGroupId: record.feeGroup._id,
          name: record.feeGroup.name,
          expected,
          paid: 0,
          due: expected,
          dueDate: record.dueDate
        });
      }
    });

    collections.forEach(payment => {
      const groupId = payment.feeGroup?.toString();
      studentObj.totalPaid += (payment.amountPaid || 0);
      const groupObj = studentObj.groups.find(g => g.feeGroupId?.toString() === groupId);
      if (groupObj) {
        groupObj.paid += (payment.amountPaid || 0);
        groupObj.due = Math.max(0, groupObj.expected - groupObj.paid);
      }
    });

    studentObj.totalDue = Math.max(0, studentObj.totalAssigned - studentObj.totalPaid);

    res.json({ success: true, data: [studentObj] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
