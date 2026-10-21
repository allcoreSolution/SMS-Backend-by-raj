const mongoose = require('mongoose');
require('dotenv').config();

const { 
  Exam, 
  ExamSchedule, 
  ExamResult, 
  ExamType, 
  ExamGrade, 
  CocurricularArea 
} = require('./models/Exam');
const Student = require('./models/Student');
const AcademicClass = require('./models/AcademicClass');
const AcademicSubject = require('./models/AcademicSubject');
const AcademicSection = require('./models/AcademicSection');

async function seedExams() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Exam Seeding...');

    // 1. Clear existing exam data
    await Exam.deleteMany({});
    await ExamSchedule.deleteMany({});
    await ExamResult.deleteMany({});
    await ExamType.deleteMany({});
    await ExamGrade.deleteMany({});
    await CocurricularArea.deleteMany({});
    console.log('Cleared existing exam collections.');

    // 2. Seed Exam Types
    const examTypes = await ExamType.insertMany([
      { name: 'Term 1 Exam', abbreviation: 'T1', description: 'First Term Summative Assessment' },
      { name: 'Half-Yearly Exam', abbreviation: 'HY', description: 'Mid-Year Comprehensive Examination' },
      { name: 'Unit Test', abbreviation: 'UT', description: 'Periodic Unit Assessment' },
      { name: 'Annual Examination', abbreviation: 'ANN', description: 'Final Year-End Examination' },
      { name: 'Pre-Board Exam', abbreviation: 'PB', description: 'Pre-Board Mock Assessment for Board Classes' },
      { name: 'Practical & Viva', abbreviation: 'PR', description: 'Laboratory, viva voce and project assessment' }
    ]);
    console.log(`Seeded ${examTypes.length} Exam Types.`);

    // 3. Seed Exam Grades
    const examGrades = await ExamGrade.insertMany([
      { name: 'A1', minPercentage: 91, maxPercentage: 100, gradePoint: 10, description: 'Outstanding Academic Performance' },
      { name: 'A2', minPercentage: 81, maxPercentage: 90, gradePoint: 9, description: 'Excellent Comprehension' },
      { name: 'B1', minPercentage: 71, maxPercentage: 80, gradePoint: 8, description: 'Very Good Understanding' },
      { name: 'B2', minPercentage: 61, maxPercentage: 70, gradePoint: 7, description: 'Good Understanding' },
      { name: 'C1', minPercentage: 51, maxPercentage: 60, gradePoint: 6, description: 'Fair Performance' },
      { name: 'C2', minPercentage: 41, maxPercentage: 50, gradePoint: 5, description: 'Average Performance' },
      { name: 'D', minPercentage: 33, maxPercentage: 40, gradePoint: 4, description: 'Marginal Passing' },
      { name: 'E', minPercentage: 0, maxPercentage: 32, gradePoint: 0, description: 'Needs Substantial Improvement' }
    ]);
    console.log(`Seeded ${examGrades.length} Exam Grades.`);

    // 4. Seed Cocurricular Areas
    const cocurricular = await CocurricularArea.insertMany([
      { name: 'Visual & Fine Arts', category: 'Arts', description: 'Drawing, Painting, and Craft work' },
      { name: 'Music, Dance & Drama', category: 'Performing Arts', description: 'Vocal/instrumental and stage expression' },
      { name: 'Physical Fitness & Sports', category: 'Physical Education', description: 'Athletic endurance and team games' },
      { name: 'Discipline, Ethics & Attendance', category: 'Life Skills', description: 'Campus conduct, teamwork, and punctuality' },
      { name: 'Work Education & Computer Literacy', category: 'Vocational', description: 'Digital skills and practical work' }
    ]);
    console.log(`Seeded ${cocurricular.length} Cocurricular Areas.`);

    // 5. Fetch existing Classes, Subjects, and Students
    const classes = await AcademicClass.find();
    const subjects = await AcademicSubject.find();
    const students = await Student.find();
    const classId1 = classes.length > 0 ? classes[0]._id : null;
    const classId2 = classes.length > 1 ? classes[1]._id : null;

    // 6. Seed Exams
    const now = new Date();
    const exams = await Exam.insertMany([
      {
        examName: 'Term 1 Examination 2026-2027',
        examType: 'Term 1 Exam',
        session: '2026-2027',
        academicClass: classId1,
        classes: classes.map(c => c._id),
        startDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        publishResults: true,
        description: 'First term assessments for Classes I through XII.'
      },
      {
        examName: 'Half-Yearly Examination 2026-2027',
        examType: 'Half-Yearly Exam',
        session: '2026-2027',
        academicClass: classId1,
        classes: classes.map(c => c._id),
        startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'Ongoing',
        publishResults: false,
        description: 'Mid-term comprehensive offline examinations.'
      },
      {
        examName: 'Pre-Board Mock Assessment 2027',
        examType: 'Pre-Board Exam',
        session: '2026-2027',
        academicClass: classId2,
        classes: classId2 ? [classId2] : [],
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        publishResults: false,
        description: 'Mock board exam simulation with full syllabus.'
      },
      {
        examName: 'Annual Board Examination 2027',
        examType: 'Annual Examination',
        session: '2026-2027',
        academicClass: classId1,
        classes: classes.map(c => c._id),
        startDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        publishResults: false,
        description: 'Annual final promotion examinations.'
      }
    ]);
    console.log(`Seeded ${exams.length} Exams.`);

    // 7. Seed Exam Schedules (Datesheet)
    const schedules = [];
    const ongoingExam = exams[1]; // Half-Yearly
    const completedExam = exams[0]; // Term 1

    if (classes.length > 0 && subjects.length > 0) {
      subjects.slice(0, 5).forEach((sub, idx) => {
        schedules.push({
          exam: ongoingExam._id,
          academicClass: classes[0]._id,
          subject: sub._id,
          examDate: new Date(now.getTime() + (idx * 2) * 24 * 60 * 60 * 1000),
          startTime: '09:30 AM',
          endTime: '12:30 PM',
          roomNo: `Room ${101 + idx}`,
          maxMarks: 100,
          passMarks: 33
        });
      });
      await ExamSchedule.insertMany(schedules);
      console.log(`Seeded ${schedules.length} Exam Schedules.`);
    }

    // 8. Seed Exam Results (Marks) for real students
    if (students.length > 0 && subjects.length > 0) {
      const results = [];
      const testSubjects = subjects.slice(0, 5);
      
      students.slice(0, 10).forEach(student => {
        testSubjects.forEach(subject => {
          const marksObtained = Math.floor(Math.random() * 40 + 55); // 55 to 95
          let grade = 'B1';
          if (marksObtained >= 91) grade = 'A1';
          else if (marksObtained >= 81) grade = 'A2';
          else if (marksObtained >= 71) grade = 'B1';
          else if (marksObtained >= 61) grade = 'B2';
          else if (marksObtained >= 51) grade = 'C1';

          results.push({
            exam: completedExam._id,
            student: student._id,
            subject: subject._id,
            academicClass: classId1,
            marksObtained,
            maxMarks: 100,
            grade,
            attendance: 'Present',
            remarks: 'Consistent class participation and good analytical skills.'
          });
        });
      });

      await ExamResult.insertMany(results);
      console.log(`Seeded ${results.length} Student Exam Results.`);
    }

    console.log('=== Offline Examination Database Seeding Complete! ===');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedExams();
