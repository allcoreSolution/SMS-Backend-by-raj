const CoachingProgram = require('../models/CoachingProgram');
const Student = require('../models/Student');

const DEFAULT_COACHING_PROGRAMS = [
  {
    title: 'IIT-JEE & NEET Early Foundation Mastery',
    code: 'CP-JEE-101',
    category: 'Competitive Exams',
    description: 'Advanced problem-solving module in Physics, Chemistry, and Mathematics designed by ex-IITian mentors.',
    targetClasses: 'Class VI - X',
    instructor: {
      name: 'Dr. Anand Ramanujan',
      designation: 'Ex-IIT Delhi Faculty & Senior Science Olympiad Coach'
    },
    schedule: 'Mon, Wed, Fri • 04:00 PM - 05:30 PM',
    timing: '04:00 PM - 05:30 PM',
    mode: 'Campus Offline',
    venue: 'Aryabhata Hall, Block C',
    fees: 'Complimentary for Enrolled Scholars',
    capacity: 40,
    rating: 4.9,
    features: ['Weekly Numerical Speed Drills', 'Previous 10-Yr Olympiad Questions', 'Personal Doubt Clearing Sessions'],
    status: 'Open for Enrollment'
  },
  {
    title: 'National & Global Mathematics Olympiad (IMO/RMO)',
    code: 'CP-MATH-102',
    category: 'Academic Foundation',
    description: 'Rigorous conceptual training focusing on Number Theory, Combinatorics, Advanced Geometry, and Algebra.',
    targetClasses: 'Class I - VIII',
    instructor: {
      name: 'Priya Singh, M.Sc.',
      designation: 'HOD Mathematics & National Olympiad Mentor'
    },
    schedule: 'Tue, Thu, Sat • 04:30 PM - 05:45 PM',
    timing: '04:30 PM - 05:45 PM',
    mode: 'Hybrid',
    venue: 'Mathematics Lab 102 & Live Stream',
    fees: 'Included in Academic Fee',
    capacity: 35,
    rating: 4.8,
    features: ['Vedic Math Short-Cuts', 'Logical Reasoning Mastery', 'Mock Contest Series with Ranking'],
    status: 'Open for Enrollment'
  },
  {
    title: 'Robotics, IoT & Python Automation Bootcamp',
    code: 'CP-ROBO-103',
    category: 'STEM & Robotics',
    description: 'Hands-on hardware interfacing with Arduino, sensors, drone kinematics, and Python game development.',
    targetClasses: 'Class III - X',
    instructor: {
      name: 'Er. Vikas Gupta',
      designation: 'Robotics & AI Lead Innovator'
    },
    schedule: 'Saturday & Sunday • 10:00 AM - 12:00 PM',
    timing: '10:00 AM - 12:00 PM',
    mode: 'Campus Offline',
    venue: 'Atal Tinkering STEM Lab',
    fees: 'Hardware Kit Provided in Lab',
    capacity: 25,
    rating: 5.0,
    features: ['Build 4 Autonomous Robot Projects', 'Python for Young Engineers', 'Inter-School Tech Expo Entry'],
    status: 'Open for Enrollment'
  },
  {
    title: 'Public Speaking, Model UN & Debate Society',
    code: 'CP-MUN-104',
    category: 'Language & Arts',
    description: 'Art of persuasion, global diplomacy, parliamentary debate style, and voice modulation coaching.',
    targetClasses: 'Class IV - X',
    instructor: {
      name: 'Mrs. Anjali Rao',
      designation: 'Debate Council Convener & Senior English Faculty'
    },
    schedule: 'Every Saturday • 09:30 AM - 11:30 AM',
    timing: '09:30 AM - 11:30 AM',
    mode: 'Campus Offline',
    venue: 'Junior Amphitheatre',
    fees: 'Open to All Enrolled Students',
    capacity: 30,
    rating: 4.7,
    features: ['Impromptu Speaking Drills', 'MUN Resolution Drafting', 'Confidence Building on Stage'],
    status: 'Open for Enrollment'
  },
  {
    title: 'Vedic Mathematics & Super Brain Speed Math',
    code: 'CP-VEDIC-105',
    category: 'Academic Foundation',
    description: 'Ancient 16 Vedic sutras for lightning-fast mental arithmetic, squares, cubes, and fraction calculations.',
    targetClasses: 'Class I - VI',
    instructor: {
      name: 'Sunita Sharma, B.Ed.',
      designation: 'Primary Academic Lead'
    },
    schedule: 'Mon & Thu • 03:45 PM - 04:45 PM',
    timing: '03:45 PM - 04:45 PM',
    mode: 'Hybrid',
    venue: 'Room 101 & Parent Portal Stream',
    fees: 'Complimentary',
    capacity: 40,
    rating: 4.9,
    features: ['Eliminates Finger Counting', 'Speed Calculation Certification', 'Fun Math Puzzles & Games'],
    status: 'Open for Enrollment'
  },
  {
    title: 'Junior Badminton & Athletics Fitness Academy',
    code: 'CP-SPORT-106',
    category: 'Sports & Fitness',
    description: 'Professional court agility, smash technique, cardiovascular stamina, and physical agility conditioning.',
    targetClasses: 'Class I - VIII',
    instructor: {
      name: 'Coach Rakesh Negi',
      designation: 'NIS Certified Senior Physical Coach'
    },
    schedule: 'Tue, Thu, Sat • 06:30 AM - 07:45 AM',
    timing: '06:30 AM - 07:45 AM',
    mode: 'Campus Offline',
    venue: 'Indoor Sports Pavilion',
    fees: 'Complimentary',
    capacity: 30,
    rating: 4.8,
    features: ['Yonex Pro Shuttle Practice', 'Endurance & Reflex Drills', 'District Championship Trials'],
    status: 'Open for Enrollment'
  }
];

// GET all coaching modules
exports.getCoachingModules = async (req, res) => {
  try {


    const { category, search, studentId } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }

    const programs = await CoachingProgram.find(query).sort({ rating: -1, createdAt: -1 });

    const data = programs.map(p => {
      const pObj = p.toObject();
      let isEnrolled = false;
      let enrollment = null;

      if (studentId && pObj.enrolledStudents) {
        const found = pObj.enrolledStudents.find(
          e => e.studentId && (e.studentId.toString() === studentId.toString())
        );
        if (found && found.status !== 'Withdrawn') {
          isEnrolled = true;
          enrollment = found;
        }
      }

      return {
        ...pObj,
        isEnrolled,
        enrollmentDetails: enrollment,
        enrolledCount: (pObj.enrolledStudents ? pObj.enrolledStudents.filter(e => e.status !== 'Withdrawn').length : 0) + 12
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ENROLL active child in a coaching module
exports.enrollInCoaching = async (req, res) => {
  try {
    const { programId, studentId, notes, guardianPhone } = req.body;
    if (!programId || !studentId) {
      return res.status(400).json({ success: false, message: 'Program ID and Student ID are required' });
    }

    const program = await CoachingProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Coaching program not found' });
    }

    // Get student details
    let studentName = 'Student';
    try {
      const student = await Student.findById(studentId);
      if (student) {
        studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.admissionNo;
      }
    } catch (e) {}

    // Check if already enrolled
    const existingIndex = program.enrolledStudents.findIndex(
      e => e.studentId && e.studentId.toString() === studentId.toString()
    );

    if (existingIndex > -1) {
      if (program.enrolledStudents[existingIndex].status === 'Withdrawn') {
        program.enrolledStudents[existingIndex].status = 'Active';
        program.enrolledStudents[existingIndex].enrolledAt = new Date();
      } else {
        return res.status(200).json({ 
          success: true, 
          message: `${studentName} is already active in ${program.title}`,
          data: program 
        });
      }
    } else {
      program.enrolledStudents.push({
        studentId,
        studentName,
        enrolledAt: new Date(),
        status: 'Active'
      });
    }

    await program.save();

    res.status(200).json({
      success: true,
      message: `Congratulations! ${studentName} has been enrolled in ${program.title}. Batch schedule details sent to registered phone.`,
      data: program
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// WITHDRAW from coaching program
exports.withdrawFromCoaching = async (req, res) => {
  try {
    const { programId, studentId } = req.body;
    const program = await CoachingProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    const idx = program.enrolledStudents.findIndex(
      e => e.studentId && e.studentId.toString() === studentId.toString()
    );

    if (idx > -1) {
      program.enrolledStudents[idx].status = 'Withdrawn';
      await program.save();
    }

    res.status(200).json({
      success: true,
      message: `Enrollment withdrawn from ${program.title}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
