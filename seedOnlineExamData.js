require('dotenv').config();
const mongoose = require('mongoose');
const { 
  OnlineQuestion, 
  ChapterTopic, 
  OnlineExam, 
  OnlineExamResult 
} = require('./models/OnlineExam');
const AcademicClass = require('./models/AcademicClass');
const AcademicSubject = require('./models/AcademicSubject');
const Student = require('./models/Student');

async function seedOnlineExams() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Online Exams seeding...');

    // Clean old online exam collections
    await OnlineQuestion.deleteMany({});
    await ChapterTopic.deleteMany({});
    await OnlineExam.deleteMany({});
    await OnlineExamResult.deleteMany({});
    console.log('Cleared existing online exam data.');

    // Fetch classes and subjects if available
    const classes = await AcademicClass.find();
    const subjects = await AcademicSubject.find();
    const students = await Student.find().limit(10);

    const defaultClassId = classes[0]?._id;
    const defaultClassName = classes[0]?.className || 'Class X';
    const defaultSubjectId = subjects[0]?._id;

    // 1. Seed Chapters and Topics
    const chMath = await ChapterTopic.create({
      name: 'Algebra & Quadratic Equations',
      type: 'chapter',
      subject: 'Mathematics',
      academicClass: 'Class X',
      questionsCount: 8
    });

    const topMath1 = await ChapterTopic.create({
      name: 'Factorization Method',
      type: 'topic',
      subject: 'Mathematics',
      academicClass: 'Class X',
      parentId: chMath._id,
      questionsCount: 4
    });

    const chSci = await ChapterTopic.create({
      name: 'Chemical Reactions & Equations',
      type: 'chapter',
      subject: 'Science',
      academicClass: 'Class X',
      questionsCount: 6
    });

    const topSci1 = await ChapterTopic.create({
      name: 'Oxidation & Reduction',
      type: 'topic',
      subject: 'Science',
      academicClass: 'Class X',
      parentId: chSci._id,
      questionsCount: 3
    });

    const chEng = await ChapterTopic.create({
      name: 'Grammar & Syntax Rules',
      type: 'chapter',
      subject: 'English',
      academicClass: 'Class X',
      questionsCount: 6
    });

    const topEng1 = await ChapterTopic.create({
      name: 'Tenses & Modals',
      type: 'topic',
      subject: 'English',
      academicClass: 'Class X',
      parentId: chEng._id,
      questionsCount: 3
    });

    console.log('Seeded chapters and topics.');

    // 2. Seed Question Bank
    const sampleQuestions = [
      {
        text: 'What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?',
        questionType: 'Multiple Choice - Single Answer',
        options: ['-8', '8', '16', '-16'],
        correctOptionIndex: 0,
        marks: 2,
        difficultyLevel: 'Medium',
        className: 'Class X',
        subjectName: 'Mathematics',
        chapter: 'Algebra & Quadratic Equations',
        topic: 'Factorization Method',
        explanation: 'Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8.',
        status: 'Published',
        usedCount: 2
      },
      {
        text: 'The chemical formula of Plaster of Paris is CaSO4 · ½H2O.',
        questionType: 'True / False',
        options: ['True', 'False'],
        correctOptionIndex: 0,
        marks: 1,
        difficultyLevel: 'Easy',
        className: 'Class X',
        subjectName: 'Science',
        chapter: 'Chemical Reactions & Equations',
        topic: 'Salts & Hydrates',
        explanation: 'Plaster of Paris is calcium sulphate hemihydrate.',
        status: 'Published',
        usedCount: 3
      },
      {
        text: 'Identify the conjunction in: "She ran quickly, yet she missed the morning school bus."',
        questionType: 'Multiple Choice - Single Answer',
        options: ['quickly', 'yet', 'missed', 'morning'],
        correctOptionIndex: 1,
        marks: 1,
        difficultyLevel: 'Easy',
        className: 'Class X',
        subjectName: 'English',
        chapter: 'Grammar & Syntax Rules',
        topic: 'Tenses & Modals',
        explanation: '"Yet" functions as the coordinating conjunction connecting two independent clauses.',
        status: 'Published',
        usedCount: 1
      },
      {
        text: 'If sin θ + cos θ = √2 cos θ, then the value of cos θ - sin θ is:',
        questionType: 'Multiple Choice - Single Answer',
        options: ['√2 sin θ', '√2 cos θ', '1/√2 sin θ', '2 sin θ'],
        correctOptionIndex: 0,
        marks: 3,
        difficultyLevel: 'Hard',
        className: 'Class X',
        subjectName: 'Mathematics',
        chapter: 'Trigonometry',
        topic: 'Trigonometric Identities',
        explanation: 'Squaring and using Pythagorean identities yields cos θ - sin θ = √2 sin θ.',
        status: 'Published',
        usedCount: 2
      },
      {
        text: 'Which organelle is universally known as the powerhouse of the eukaryotic cell?',
        questionType: 'Multiple Choice - Single Answer',
        options: ['Golgi Apparatus', 'Endoplasmic Reticulum', 'Mitochondria', 'Chloroplast'],
        correctOptionIndex: 2,
        marks: 1,
        difficultyLevel: 'Easy',
        className: 'Class IX',
        subjectName: 'Science',
        chapter: 'Cell Structure & Function',
        topic: 'Cell Organelles',
        explanation: 'Mitochondria produce cellular ATP through oxidative phosphorylation.',
        status: 'Published',
        usedCount: 4
      },
      {
        text: 'Select the antonym of the word "BENEVOLENT":',
        questionType: 'Multiple Choice - Single Answer',
        options: ['Generous', 'Compassionate', 'Malevolent', 'Altruistic'],
        correctOptionIndex: 2,
        marks: 1,
        difficultyLevel: 'Medium',
        className: 'Class X',
        subjectName: 'English',
        chapter: 'Vocabulary & Lexicon',
        topic: 'Antonyms & Synonyms',
        explanation: 'Benevolent means well-meaning; malevolent means wishing evil upon others.',
        status: 'Published',
        usedCount: 1
      },
      {
        text: 'Binary equivalent of decimal number 25 is 11001.',
        questionType: 'True / False',
        options: ['True', 'False'],
        correctOptionIndex: 0,
        marks: 1,
        difficultyLevel: 'Medium',
        className: 'Class X',
        subjectName: 'Computer Science',
        chapter: 'Number Systems',
        topic: 'Decimal to Binary Conversion',
        explanation: '25 = 16 + 8 + 1 = 11001 in base 2.',
        status: 'Published',
        usedCount: 2
      },
      {
        text: 'In Python, which keyword is used to define an immutable function parameter or lambda?',
        questionType: 'Multiple Choice - Single Answer',
        options: ['def', 'func', 'lambda', 'val'],
        correctOptionIndex: 2,
        marks: 2,
        difficultyLevel: 'Medium',
        className: 'Class XI',
        subjectName: 'Computer Science',
        chapter: 'Python Programming',
        topic: 'Anonymous Functions',
        explanation: 'The lambda keyword defines small anonymous functions in Python.',
        status: 'Draft',
        usedCount: 0
      }
    ];

    const insertedQuestions = await OnlineQuestion.insertMany(sampleQuestions);
    console.log(`Seeded ${insertedQuestions.length} questions in Question Bank.`);

    // 3. Seed Online Exams
    const exam1 = await OnlineExam.create({
      title: 'CBSE Class X Mathematics All-India Mock Test',
      examType: 'Competitive Mock',
      academicClass: defaultClassId,
      className: defaultClassName,
      subject: defaultSubjectId,
      subjectName: 'Mathematics',
      questions: [insertedQuestions[0], insertedQuestions[3]],
      durationMinutes: 90,
      totalMarks: 50,
      passingMarks: 20,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Open for 5 days
      status: 'Live',
      instructions: 'Attempt all questions. Calculators are prohibited. System auto-locks after 90 minutes.',
      isActive: true,
      autoPublishResults: true
    });

    const exam2 = await OnlineExam.create({
      title: 'Science & Environment Periodic Online Assessment',
      examType: 'Term Test',
      academicClass: defaultClassId,
      className: defaultClassName,
      subjectName: 'Science',
      questions: [insertedQuestions[1], insertedQuestions[4]],
      durationMinutes: 45,
      totalMarks: 25,
      passingMarks: 10,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'Scheduled',
      instructions: 'Online objective test covering Chapters 1 through 4.',
      isActive: true
    });

    const exam3 = await OnlineExam.create({
      title: 'English Vocabulary & Reading Comprehension Quiz',
      examType: 'Quiz',
      className: 'Class X',
      subjectName: 'English',
      questions: [insertedQuestions[2], insertedQuestions[5]],
      durationMinutes: 30,
      totalMarks: 20,
      passingMarks: 8,
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'Completed',
      instructions: 'Vocabulary assessment completed last week.',
      isActive: true
    });

    const exam4 = await OnlineExam.create({
      title: 'Computer Science & Python Coding Basics',
      examType: 'Practice Assessment',
      className: 'Class XI',
      subjectName: 'Computer Science',
      questions: [insertedQuestions[6], insertedQuestions[7]],
      durationMinutes: 60,
      totalMarks: 40,
      passingMarks: 16,
      status: 'Draft',
      instructions: 'Draft practice paper under teacher review.',
      isActive: true
    });

    console.log('Seeded 4 Online Exams (Live, Scheduled, Completed, Draft).');

    // 4. Seed Online Exam Results
    if (students.length > 0) {
      await OnlineExamResult.create({
        onlineExam: exam1._id,
        student: students[0]._id,
        studentName: `${students[0].firstName || ''} ${students[0].lastName || ''}`.trim() || 'Aarav Sharma',
        rollNo: students[0].rollNumber || '101',
        className: defaultClassName,
        score: 42,
        totalMarks: 50,
        percentage: 84,
        grade: 'A',
        status: 'Passed',
        timeTakenMinutes: 72
      });

      if (students[1]) {
        await OnlineExamResult.create({
          onlineExam: exam1._id,
          student: students[1]._id,
          studentName: `${students[1].firstName || ''} ${students[1].lastName || ''}`.trim() || 'Diya Patel',
          rollNo: students[1].rollNumber || '102',
          className: defaultClassName,
          score: 46,
          totalMarks: 50,
          percentage: 92,
          grade: 'A+',
          status: 'Passed',
          timeTakenMinutes: 68
        });
      }
    }

    console.log('Seeded sample student exam results.');
    console.log('Online Examination Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding online exams:', err);
    process.exit(1);
  }
}

seedOnlineExams();
