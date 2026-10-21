const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  console.log('Connected to MongoDB');

  const { SyllabusUnit, ClassworkLog, StudyResource } = require('./models/StudyCenter');
  const { LiveClass } = require('./models/LiveClass');

  // 1. Seed Class I Syllabus Units
  const syllabusExists = await SyllabusUnit.findOne({ className: /Class I/i });
  if (!syllabusExists) {
    console.log('Seeding Class I Syllabus...');
    await SyllabusUnit.insertMany([
      {
        unitNumber: 1,
        title: 'Unit 1: Numbers up to 100 & Place Values',
        className: 'Class I',
        subjectName: 'Mathematics',
        periodsEstimated: 12,
        periodsTaken: 12,
        status: 'Completed',
        completionPct: 100,
        learningObjectives: 'Counting 1-100, number names, before/after/between concepts, and grouping into tens and ones.',
        referenceBooks: 'NCERT Math-Magic Book 1, Chapter 1 & 2',
        topics: [
          { name: 'Counting & Number Names 1 to 50', status: 'Covered', completedDate: new Date('2026-08-10') },
          { name: 'Counting 51 to 100 & Skip Counting by 2s and 5s', status: 'Covered', completedDate: new Date('2026-08-18') },
          { name: 'Before, After and In-Between Numbers', status: 'Covered', completedDate: new Date('2026-08-25') },
          { name: 'Understanding Tens & Ones Place Values', status: 'Covered', completedDate: new Date('2026-09-02') }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Addition & Subtraction (Single & Two Digits)',
        className: 'Class I',
        subjectName: 'Mathematics',
        periodsEstimated: 14,
        periodsTaken: 11,
        status: 'In-Progress',
        completionPct: 80,
        learningObjectives: 'Basic single-digit addition, counting forward, number line subtraction, and simple story word problems.',
        referenceBooks: 'NCERT Math-Magic Book 1, Chapter 3 & 4',
        topics: [
          { name: 'Addition Using Pictures & Objects', status: 'Covered', completedDate: new Date('2026-09-12') },
          { name: 'Number Line Addition up to 20', status: 'Covered', completedDate: new Date('2026-09-20') },
          { name: 'Basic Subtraction by Crossing Out', status: 'Covered', completedDate: new Date('2026-09-28') },
          { name: 'Word Problems & Practical Scenarios', status: 'In-Progress' }
        ]
      },
      {
        unitNumber: 3,
        title: 'Unit 3: 2D Shapes & Spatial Arrangements',
        className: 'Class I',
        subjectName: 'Mathematics',
        periodsEstimated: 8,
        periodsTaken: 3,
        status: 'In-Progress',
        completionPct: 35,
        learningObjectives: 'Identify circle, square, rectangle, and triangle; understand rolling vs sliding motions.',
        referenceBooks: 'NCERT Math-Magic Book 1, Chapter 5',
        topics: [
          { name: 'Basic 2D Shapes in Daily Life', status: 'Covered', completedDate: new Date('2026-10-05') },
          { name: 'Rolling & Sliding Objects Experiment', status: 'In-Progress' },
          { name: 'Symmetry & Shape Patterns', status: 'Pending' }
        ]
      },
      {
        unitNumber: 1,
        title: 'Unit 1: About Myself, My Senses & Family',
        className: 'Class I',
        subjectName: 'Environmental Studies',
        periodsEstimated: 10,
        periodsTaken: 10,
        status: 'Completed',
        completionPct: 100,
        learningObjectives: 'Identify five body senses, personal hygiene habits, and family relationships.',
        referenceBooks: 'Primary Environmental Studies Book 1',
        topics: [
          { name: 'My Body Parts & 5 Sense Organs', status: 'Covered', completedDate: new Date('2026-08-12') },
          { name: 'Personal Hygiene & Good Clean Habits', status: 'Covered', completedDate: new Date('2026-08-22') },
          { name: 'My Family Members & Helping at Home', status: 'Covered', completedDate: new Date('2026-09-01') }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Plants & Animals in Our Surroundings',
        className: 'Class I',
        subjectName: 'Environmental Studies',
        periodsEstimated: 12,
        periodsTaken: 6,
        status: 'In-Progress',
        completionPct: 50,
        learningObjectives: 'Observe types of plants, identify domestic animals and pets, and understand animal homes.',
        referenceBooks: 'Primary Environmental Studies Book 1',
        topics: [
          { name: 'Parts of a Plant (Roots, Stem, Leaves, Flower)', status: 'Covered', completedDate: new Date('2026-09-18') },
          { name: 'Domestic vs Wild Animals', status: 'Covered', completedDate: new Date('2026-09-29') },
          { name: 'Animal Homes and Sounds', status: 'In-Progress' },
          { name: 'Care for Birds and Garden Plants', status: 'Pending' }
        ]
      },
      {
        unitNumber: 1,
        title: 'Unit 1: Alphabet Phonics, Rhyming & Sight Words',
        className: 'Class I',
        subjectName: 'English Literature',
        periodsEstimated: 10,
        periodsTaken: 10,
        status: 'Completed',
        completionPct: 100,
        learningObjectives: 'Master consonant and vowel phonics sounds, blend words, and essential sight words.',
        referenceBooks: 'Marigold English Book 1 (NCERT)',
        topics: [
          { name: 'Vowel Sounds A, E, I, O, U', status: 'Covered', completedDate: new Date('2026-08-15') },
          { name: 'Two-letter and Three-letter Word Blends', status: 'Covered', completedDate: new Date('2026-08-28') },
          { name: 'Rhyming Word Patterns', status: 'Covered', completedDate: new Date('2026-09-08') }
        ]
      },
      {
        unitNumber: 2,
        title: 'Unit 2: Three Little Pigs & The Bubble, Straw and Shoe',
        className: 'Class I',
        subjectName: 'English Literature',
        periodsEstimated: 10,
        periodsTaken: 7,
        status: 'In-Progress',
        completionPct: 70,
        learningObjectives: 'Story comprehension, expressive reading, character enactment, and basic noun vocabulary.',
        referenceBooks: 'Marigold English Book 1 (NCERT)',
        topics: [
          { name: 'Story Narration & Vocabulary', status: 'Covered', completedDate: new Date('2026-09-22') },
          { name: 'Enactment & Roleplay Dialogue', status: 'Covered', completedDate: new Date('2026-10-02') },
          { name: 'Action Verbs in Stories', status: 'In-Progress' },
          { name: 'Simple Sentence Framing', status: 'Pending' }
        ]
      },
      {
        unitNumber: 1,
        title: 'इकाई 1: स्वर और व्यंजन ज्ञान (वर्णमाला)',
        className: 'Class I',
        subjectName: 'Hindi Language',
        periodsEstimated: 12,
        periodsTaken: 12,
        status: 'Completed',
        completionPct: 100,
        learningObjectives: 'अ से ज्ञ तक वर्णों की पहचान, सही उच्चारण और चित्र मिलान।',
        referenceBooks: 'रिमझिम भाग 1 (NCERT)',
        topics: [
          { name: 'स्वर वर्ण (अ से अः) की पहचान और अभ्यास', status: 'Covered', completedDate: new Date('2026-08-14') },
          { name: 'व्यंजन वर्ण (क से ज्ञ) का सस्वर उच्चारण', status: 'Covered', completedDate: new Date('2026-08-29') },
          { name: 'वर्ण और चित्र मिलान गतिविधि', status: 'Covered', completedDate: new Date('2026-09-10') }
        ]
      },
      {
        unitNumber: 2,
        title: 'इकाई 2: बिना मात्रा वाले शब्द और \'आ\' की मात्रा',
        className: 'Class I',
        subjectName: 'Hindi Language',
        periodsEstimated: 14,
        periodsTaken: 8,
        status: 'In-Progress',
        completionPct: 60,
        learningObjectives: 'दो, तीन व चार अक्षर वाले बिना मात्रा के शब्द तथा \'आ\' की मात्रा का पठन।',
        referenceBooks: 'रिमझिम भाग 1 (NCERT)',
        topics: [
          { name: 'दो अक्षर वाले शब्द (घर, जल, फल)', status: 'Covered', completedDate: new Date('2026-09-24') },
          { name: 'तीन व चार अक्षर वाले शब्द (कमल, उपवन)', status: 'Covered', completedDate: new Date('2026-10-04') },
          { name: '\'आ\' की मात्रा वाले शब्द (आम, तारा, कान)', status: 'In-Progress' },
          { name: 'छोटे-छोटे सरल वाक्य पठन', status: 'Pending' }
        ]
      }
    ]);
    console.log('Class I Syllabus units inserted.');
  }

  // 2. Seed Class I Classwork Logs
  const classworkExists = await ClassworkLog.findOne({ className: /Class I/i });
  if (!classworkExists) {
    console.log('Seeding Class I Classwork Logs...');
    await ClassworkLog.insertMany([
      {
        date: new Date(),
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'Mathematics',
        period: 1,
        teacherName: 'Pooja Verma',
        topicTaught: 'Addition with Carry Over (Two-digit Numbers)',
        classworkSummary: 'Practiced carrying over 1s into 10s place using abacus beads and whiteboard exercises. Solved textbook page 42 questions 1-8.',
        homeworkAssigned: 'Complete textbook page 43 exercises A and B in fair homework notebook.',
        attendanceCount: 36,
        totalStudents: 38
      },
      {
        date: new Date(),
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'English Literature',
        period: 3,
        teacherName: 'Anita Roy',
        topicTaught: 'Phonics Blends - \'bl\', \'cl\', \'fl\' Sound Words',
        classworkSummary: 'Introduced consonant blends using colorful flashcards. Read \'The Blue Clock\' story together. Children practiced spelling and pronunciation.',
        homeworkAssigned: 'Write 3 words each starting with \'bl\', \'cl\', and \'fl\' in 4-line copy.',
        attendanceCount: 37,
        totalStudents: 38
      },
      {
        date: new Date(Date.now() - 86400000),
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'Environmental Studies',
        period: 2,
        teacherName: 'Neha Sharma',
        topicTaught: 'Parts of a Plant & Their Daily Functions',
        classworkSummary: 'Showed live potted plants in school garden. Identified roots, stem, green leaves, flower, and fruits. Students drew a labeled plant diagram.',
        homeworkAssigned: 'Collect 2 different fallen leaves from home/park and paste neatly in scrapbook.',
        attendanceCount: 35,
        totalStudents: 38
      },
      {
        date: new Date(Date.now() - 86400000),
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'Hindi Language',
        period: 4,
        teacherName: 'Sunita Joshi',
        topicTaught: 'वर्णमाला दोहराव और \'आ\' की मात्रा वाले शब्द',
        classworkSummary: 'आम, नाव, कान, हाथ शब्दों का उच्चारण, चित्र पहचान और सुंदर सुलेख अभ्यास कराया गया।',
        homeworkAssigned: '\'आ\' की मात्रा वाले 5 नए शब्द लिखकर सुंदर वाक्य बनायें।',
        attendanceCount: 36,
        totalStudents: 38
      },
      {
        date: new Date(Date.now() - 172800000),
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'Computer Basics',
        period: 5,
        teacherName: 'Vikas Saxena',
        topicTaught: 'Handling the Mouse: Single Click & Double Click',
        classworkSummary: 'Computer lab hands-on session. Taught correct finger placement on mouse buttons. Practiced clicking and dragging objects in Tux Paint.',
        homeworkAssigned: 'Remember names of 4 parts of a computer for oral quiz in next class.',
        attendanceCount: 38,
        totalStudents: 38
      }
    ]);
    console.log('Class I Classwork logs inserted.');
  }

  // 3. Seed Class I Study Resources
  const resourceExists = await StudyResource.findOne({ className: /Class I/i });
  if (!resourceExists) {
    console.log('Seeding Class I Study Resources...');
    await StudyResource.insertMany([
      {
        title: 'Class 1 Mathematics Pictorial Worksheet & Number Charts',
        description: 'Interactive colorful worksheets for counting, number tracing, basic additions, and shape identification.',
        className: 'Class I',
        subjectName: 'Mathematics',
        materialType: 'PDF',
        fileUrl: 'https://archive.org/download/primary-math-grade-1-worksheet/math_grade1.pdf',
        fileSize: '2.4 MB',
        authorTeacher: 'Pooja Verma',
        downloadsCount: 89,
        tags: ['Class 1', 'Maths', 'Worksheets', 'Counting']
      },
      {
        title: 'EVS Illustrated Book: Plants, Animals & My Environment',
        description: 'Visual illustrated e-book covering our body parts, wild and domestic animals, plant life, and healthy habits.',
        className: 'Class I',
        subjectName: 'Environmental Studies',
        materialType: 'E-Book',
        fileUrl: 'https://archive.org/download/primary-evs-grade-1/evs_illustrated.pdf',
        fileSize: '4.8 MB',
        authorTeacher: 'Neha Sharma',
        downloadsCount: 124,
        tags: ['EVS', 'Nature', 'Picture Book', 'Class 1']
      },
      {
        title: 'English Phonics Song & Pronunciation Audio-Visual Guide',
        description: 'Engaging animated video demonstrating 26 phonics sounds, blend words, and nursery rhymes for clear pronunciation.',
        className: 'Class I',
        subjectName: 'English Literature',
        materialType: 'Video',
        fileUrl: 'https://www.youtube.com/watch?v=BELlZKpi1Zs',
        fileSize: 'Video Stream',
        authorTeacher: 'Anita Roy',
        downloadsCount: 210,
        tags: ['Phonics', 'Rhymes', 'English', 'Animated']
      },
      {
        title: 'Hindi Balgeet Aur Varnamala Karyapatrika (Worksheet)',
        description: 'Swar aur Vyanjan tracing sheets with attractive cartoon sketches for handwriting improvement.',
        className: 'Class I',
        subjectName: 'Hindi Language',
        materialType: 'PDF',
        fileUrl: 'https://archive.org/download/hindi-varnamala-grade1/hindi_varnamala.pdf',
        fileSize: '1.9 MB',
        authorTeacher: 'Sunita Joshi',
        downloadsCount: 67,
        tags: ['Hindi', 'Varnamala', 'Swar', 'Vyanjan']
      },
      {
        title: 'Kids Computer Lab: Mouse & Keyboard Activity Guide',
        description: 'Simple step-by-step guide with diagrams explaining mouse clicks, spacebar, enter key, and MS Paint tools.',
        className: 'Class I',
        subjectName: 'Computer Basics',
        materialType: 'Doc',
        fileUrl: 'https://archive.org/download/kids-computer-guide-grade1/computer_activity.docx',
        fileSize: '950 KB',
        authorTeacher: 'Vikas Saxena',
        downloadsCount: 54,
        tags: ['Computer', 'Paint', 'Lab Guide']
      }
    ]);
    console.log('Class I Study Resources inserted.');
  }

  // 4. Seed Class I Live Classes
  const liveExists = await LiveClass.findOne({ className: /Class I/i });
  if (!liveExists) {
    console.log('Seeding Class I Live Classes...');
    await LiveClass.insertMany([
      {
        title: 'Fun with Numbers & Shapes: Origami Live Workshop',
        description: 'Hands-on origami folding session to explore square, triangle, and circle shapes with real craft paper.',
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'Mathematics',
        teacherName: 'Pooja Verma',
        provider: 'Zoom',
        meetingUrl: 'https://zoom.us/j/9128374650',
        meetingId: '912 837 4650',
        passcode: 'MATH1',
        startTime: new Date(Date.now() - 10 * 60000), // Live now!
        durationMinutes: 40,
        status: 'Live',
        attendeeCount: 24,
        maxStudents: 40
      },
      {
        title: 'Interactive Storytelling & Phonics Fun Live Session',
        description: 'Live interactive storytelling with puppets, phonics sound games, and rhyme recitation.',
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'English Literature',
        teacherName: 'Anita Roy',
        provider: 'GoogleMeet',
        meetingUrl: 'https://meet.google.com/abc-phon-ics',
        meetingId: 'abc-phon-ics',
        passcode: 'KIDS2026',
        startTime: new Date(Date.now() + 45 * 60000), // Scheduled in 45 mins
        durationMinutes: 35,
        status: 'Scheduled',
        attendeeCount: 0,
        maxStudents: 35
      },
      {
        title: 'Nature Walk & Plant Life Discovery Live Discussion',
        description: 'Virtual garden tour and Q&A session discussing garden plants, flowers, and insect pollination.',
        className: 'Class I',
        sectionName: 'A',
        subjectName: 'Environmental Studies',
        teacherName: 'Neha Sharma',
        provider: 'Jitsi',
        meetingUrl: 'https://meet.jit.si/school-erp-evs-class1',
        startTime: new Date(Date.now() - 86400000), // Yesterday
        durationMinutes: 30,
        status: 'Completed',
        attendeeCount: 32,
        maxStudents: 38,
        recordingUrl: 'https://archive.org/details/class1-evs-plant-discovery'
      }
    ]);
    console.log('Class I Live Classes inserted.');
  }

  console.log('All Class I Study Center data successfully seeded!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
