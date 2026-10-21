const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const LessonPlan = require('./models/LessonPlan');
const OSMSession = require('./models/OSMSession');
const PTM = require('./models/PTM');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding modules...');

    // 1. Seed Lesson Plans if count < 4
    const lpCount = await LessonPlan.countDocuments();
    if (lpCount < 4) {
      console.log('Seeding Lesson Plans...');
      await LessonPlan.deleteMany({});
      await LessonPlan.create([
        {
          title: 'Mathematics — Quadratic Equations & Roots',
          className: 'Class 10',
          sectionName: 'Section A',
          subjectName: 'Mathematics',
          topic: 'Quadratic Equations',
          subTopics: ['Standard Form', 'Factorization Method', 'Quadratic Formula', 'Discriminant & Nature of Roots'],
          startDate: new Date('2026-06-22'),
          endDate: new Date('2026-06-28'),
          weekLabel: '22 Jun - 28 Jun 2026',
          periods: 5,
          chapters: ['Chapter 4: Quadratic Equations'],
          objectives: 'Understand standard form ax² + bx + c = 0, apply quadratic formula to solve real-world projectile and geometric problems.',
          teachingMethods: ['Interactive Board Lecture', 'Pair Problem Solving', 'Digital Graph Plotting'],
          teachingAids: ['Smart Board', 'GeoGebra Software', 'Graph Paper'],
          homework: 'Exercise 4.2 Questions 1-8 in notebook.',
          status: 'Approved',
          coveragePct: 85,
          topicsList: [
            { text: 'Concept of quadratic roots and zero factorization', type: 'Syllabus', status: 'Covered' },
            { text: 'Completing the square method', type: 'Syllabus', status: 'Covered' },
            { text: 'Derivation of quadratic formula', type: 'Syllabus', status: 'Covered' },
            { text: 'Discriminant analysis (b² - 4ac)', type: 'Syllabus', status: 'Covered' },
            { text: 'Word problems on speed and distance', type: 'Additional', status: 'In-Progress' },
            { text: 'Weekly revision assessment', type: 'Syllabus', status: 'Pending' }
          ]
        },
        {
          title: 'English — Poetry: The Road Not Taken & Figurative Devices',
          className: 'Class 10',
          sectionName: 'Section A',
          subjectName: 'English',
          topic: 'Poetic Analysis & Rhyme Scheme',
          subTopics: ['Stanza Analysis', 'Metaphor & Symbolism', 'Theme of Choice in Life'],
          startDate: new Date('2026-06-15'),
          endDate: new Date('2026-06-21'),
          weekLabel: '15 Jun - 21 Jun 2026',
          periods: 4,
          chapters: ['Poetry Section - Unit 1'],
          objectives: 'Analyze Robert Frost’s poem, identify metaphor and symbolism, articulate personal reflections on decisions.',
          teachingMethods: ['Recitation with Intonation', 'Group Debate', 'Creative Writing Response'],
          teachingAids: ['Audio Recitation Track', 'Illustrated Presentation'],
          homework: 'Write a 150-word essay on a difficult choice made in life.',
          status: 'Approved',
          coveragePct: 100,
          topicsList: [
            { text: 'Author background & literary period', type: 'Syllabus', status: 'Covered' },
            { text: 'Stanza by stanza textual analysis', type: 'Syllabus', status: 'Covered' },
            { text: 'Rhyme scheme identification (ABAAB)', type: 'Syllabus', status: 'Covered' },
            { text: 'Symbolic meaning of the two diverged roads', type: 'Syllabus', status: 'Covered' }
          ]
        },
        {
          title: 'Science — Light: Reflection & Spherical Mirrors',
          className: 'Class 10',
          sectionName: 'Section B',
          subjectName: 'Physics',
          topic: 'Spherical Mirrors & Ray Diagrams',
          subTopics: ['Concave vs Convex Mirrors', 'Pole, Center of Curvature & Focus', 'Mirror Formula & Magnification'],
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-07-07'),
          weekLabel: '01 Jul - 07 Jul 2026',
          periods: 6,
          chapters: ['Chapter 10: Light - Reflection and Refraction'],
          objectives: 'Master drawing ray diagrams for different object positions in front of concave and convex mirrors.',
          teachingMethods: ['Lab Demonstration with Optical Bench', 'Ray Optics Simulation'],
          teachingAids: ['Concave & Convex Mirror Set', 'Optical Bench', 'Laser Pointer'],
          homework: 'Draw all 6 concave mirror ray diagrams in lab journal.',
          status: 'Approved',
          coveragePct: 70,
          topicsList: [
            { text: 'Laws of reflection review', type: 'Syllabus', status: 'Covered' },
            { text: 'Ray tracing rules for spherical mirrors', type: 'Syllabus', status: 'Covered' },
            { text: 'Concave mirror image formation (6 positions)', type: 'Syllabus', status: 'In-Progress' },
            { text: 'Convex mirror rear view mirror application', type: 'Syllabus', status: 'Pending' },
            { text: 'Mirror formula derivation 1/f = 1/v + 1/u', type: 'Syllabus', status: 'Pending' }
          ]
        },
        {
          title: 'Social Science — Sectors of the Indian Economy',
          className: 'Class 9',
          sectionName: 'Section A',
          subjectName: 'Economics',
          topic: 'Primary, Secondary, and Tertiary Sectors',
          subTopics: ['GDP Contribution', 'Employment Shifts', 'Disguised Unemployment in Agriculture'],
          startDate: new Date('2026-07-08'),
          endDate: new Date('2026-07-14'),
          weekLabel: '08 Jul - 14 Jul 2026',
          periods: 4,
          chapters: ['Chapter 2: Sectors of the Indian Economy'],
          objectives: 'Distinguish between organized and unorganized sectors, analyze historical employment trends in India.',
          teachingMethods: ['Case Study Discussion', 'Pie Chart Data Interpretation'],
          teachingAids: ['Economic Survey Data Sheets', 'Smart Board Charts'],
          homework: 'Tabulate 5 local businesses under primary, secondary, and tertiary categories.',
          status: 'Pending HOD',
          coveragePct: 40,
          topicsList: [
            { text: 'Classification of economic activities', type: 'Syllabus', status: 'Covered' },
            { text: 'Comparing the three sectors by GDP share', type: 'Syllabus', status: 'In-Progress' },
            { text: 'Underemployment and disguised unemployment', type: 'Syllabus', status: 'Pending' },
            { text: 'Government initiatives: MGNREGA', type: 'Syllabus', status: 'Pending' }
          ]
        }
      ]);
      console.log('Seeded 4 Lesson Plans successfully.');
    }

    // 2. Seed OSM Sessions if count < 3
    const osmCount = await OSMSession.countDocuments();
    if (osmCount < 3) {
      console.log('Seeding OSM Sessions...');
      await OSMSession.deleteMany({});
      await OSMSession.create([
        {
          title: 'Term-1 Mathematics Summative Evaluation',
          className: 'Class 10',
          section: 'A',
          subjectName: 'Mathematics',
          examType: 'Mid-Term Board Mock',
          totalMarks: 50,
          status: 'Evaluating',
          anonymous: true,
          allowAnnotations: true,
          moderationEnabled: true,
          deadline: new Date(Date.now() + 5 * 86400000),
          evaluatorName: 'Amit Sharma (Senior PGT)',
          questions: [
            { qNo: 'Q1', label: 'Algebra', maxMarks: 5, compulsory: true, text: 'Find roots of 2x² - 5x + 3 = 0 using quadratic formula.' },
            { qNo: 'Q2', label: 'Trigonometry', maxMarks: 5, compulsory: true, text: 'Prove that (sinθ - 2sin³θ) / (2cos³θ - cosθ) = tanθ.' },
            { qNo: 'Q3', label: 'Geometry', maxMarks: 10, compulsory: true, text: 'State and prove Basic Proportionality (Thales) Theorem.' },
            { qNo: 'Q4', label: 'Statistics', maxMarks: 10, compulsory: true, text: 'Calculate the median of given grouped frequency distribution table.' },
            { qNo: 'Q5', label: 'Word Problem', maxMarks: 20, compulsory: true, text: 'Case-based: Height of tower and angles of elevation from two points.' }
          ],
          sheets: [
            {
              id: 'SHT-101',
              studentId: 'STU-001',
              studentName: 'Aarav Sharma',
              rollNo: '101',
              anonymousCode: 'MASK-901',
              fileName: 'Aarav_Math_Paper.pdf',
              pages: 4,
              status: 'Evaluated',
              totalAwarded: 46,
              evaluatedAt: new Date(),
              marks: [
                { qNo: 'Q1', awardedMarks: 5, comments: 'Step-by-step discriminant calculation correct.' },
                { qNo: 'Q2', awardedMarks: 5, comments: 'Clean trigonometric identity substitution.' },
                { qNo: 'Q3', awardedMarks: 10, comments: 'Complete construction and proof statement.' },
                { qNo: 'Q4', awardedMarks: 8, comments: 'Minor arithmetic rounding error in cumulative frequency.' },
                { qNo: 'Q5', awardedMarks: 18, comments: 'Accurate ray diagram and tangent computation.' }
              ],
              annotations: [
                { page: 1, x: 80, y: 35, type: 'tick', comment: 'Correct formula' },
                { page: 2, x: 75, y: 60, type: 'tick', comment: 'QED proven' }
              ]
            },
            {
              id: 'SHT-102',
              studentId: 'STU-002',
              studentName: 'Diya Patel',
              rollNo: '102',
              anonymousCode: 'MASK-902',
              fileName: 'Diya_Math_Paper.pdf',
              pages: 3,
              status: 'In-Progress',
              totalAwarded: 28,
              marks: [
                { qNo: 'Q1', awardedMarks: 5, comments: 'Accurate.' },
                { qNo: 'Q2', awardedMarks: 4, comments: 'Missed final step simplification.' },
                { qNo: 'Q3', awardedMarks: 9, comments: 'Good proof, missed mentioning parallel line construction step.' },
                { qNo: 'Q4', awardedMarks: 10, comments: 'Spot on.' },
                { qNo: 'Q5', awardedMarks: 0, comments: 'Not yet evaluated' }
              ]
            },
            {
              id: 'SHT-103',
              studentId: 'STU-003',
              studentName: 'Rohan Verma',
              rollNo: '103',
              anonymousCode: 'MASK-903',
              fileName: 'Rohan_Math_Paper.pdf',
              pages: 3,
              status: 'Pending',
              totalAwarded: 0,
              marks: []
            }
          ]
        },
        {
          title: 'Physics Unit Assessment — Optics & Electricity',
          className: 'Class 10',
          section: 'A',
          subjectName: 'Physics',
          examType: 'Unit Test',
          totalMarks: 30,
          status: 'Evaluating',
          anonymous: true,
          allowAnnotations: true,
          moderationEnabled: false,
          deadline: new Date(Date.now() + 4 * 86400000),
          evaluatorName: 'Amit Sharma',
          questions: [
            { qNo: 'Q1', label: 'Reflection', maxMarks: 5, compulsory: true, text: 'Draw ray diagram for concave mirror when object is at C.' },
            { qNo: 'Q2', label: 'Refraction', maxMarks: 5, compulsory: true, text: 'State Snell’s Law and calculate refractive index.' },
            { qNo: 'Q3', label: 'Ohm’s Law', maxMarks: 10, compulsory: true, text: 'Circuit diagram for V-I graph verification.' },
            { qNo: 'Q4', label: 'Numericals', maxMarks: 10, compulsory: true, text: 'Equivalent resistance in series and parallel combination.' }
          ],
          sheets: [
            {
              id: 'SHT-201',
              studentId: 'STU-001',
              studentName: 'Aarav Sharma',
              rollNo: '101',
              anonymousCode: 'MASK-801',
              fileName: 'Aarav_Physics.pdf',
              pages: 3,
              status: 'Evaluated',
              totalAwarded: 27,
              evaluatedAt: new Date(),
              marks: [
                { qNo: 'Q1', awardedMarks: 5, comments: 'Sharp arrowheads on ray diagram.' },
                { qNo: 'Q2', awardedMarks: 4, comments: 'Good explanation.' },
                { qNo: 'Q3', awardedMarks: 9, comments: 'Ammeter & voltmeter placed correctly.' },
                { qNo: 'Q4', awardedMarks: 9, comments: 'Accurate equivalent calculation.' }
              ]
            }
          ]
        },
        {
          title: 'English Language Essay & Grammar Evaluation',
          className: 'Class 9',
          section: 'B',
          subjectName: 'English',
          examType: 'Language Assessment',
          totalMarks: 40,
          status: 'Completed',
          anonymous: false,
          allowAnnotations: true,
          moderationEnabled: true,
          deadline: new Date(Date.now() - 2 * 86400000),
          evaluatorName: 'Sunita Mehra',
          questions: [
            { qNo: 'Q1', label: 'Essay', maxMarks: 15, compulsory: true, text: 'Descriptive essay: Impact of Social Media on Teenagers.' },
            { qNo: 'Q2', label: 'Grammar', maxMarks: 10, compulsory: true, text: 'Reported speech and active-passive voice transformations.' },
            { qNo: 'Q3', label: 'Literature', maxMarks: 15, compulsory: true, text: 'Character sketch of the protagonist.' }
          ],
          sheets: [
            {
              id: 'SHT-301',
              studentId: 'STU-005',
              studentName: 'Kabir Mehta',
              rollNo: '105',
              anonymousCode: 'MASK-701',
              fileName: 'Kabir_English.pdf',
              pages: 2,
              status: 'Moderated',
              totalAwarded: 35,
              evaluatedAt: new Date(Date.now() - 3 * 86400000),
              marks: [
                { qNo: 'Q1', awardedMarks: 13, comments: 'Rich vocabulary.' },
                { qNo: 'Q2', awardedMarks: 9, comments: 'One tense mistake.' },
                { qNo: 'Q3', awardedMarks: 13, comments: 'Good character citations.' }
              ]
            }
          ]
        }
      ]);
      console.log('Seeded 3 OSM Sessions successfully.');
    }

    // 3. Seed PTM Meetings if count < 4
    const ptmCount = await PTM.countDocuments();
    if (ptmCount < 4) {
      console.log('Seeding PTM Meetings...');
      await PTM.deleteMany({});
      await PTM.create([
        {
          title: 'Term-1 Comprehensive Parent-Teacher Conference',
          meetingDate: new Date('2026-10-24'),
          startTime: '09:30 AM',
          endTime: '01:30 PM',
          mode: 'In person',
          scope: 'Class 10 - Section A',
          className: 'Class 10',
          sectionName: 'A',
          venue: 'Auditorium Block B (Room 102)',
          description: 'Discussion of Term-1 summative results, board exam preparation roadmap, and attendance review.',
          status: 'Scheduled',
          roster: [
            { studentId: 'STU-001', name: 'Aarav Sharma', roll: '101', className: 'Class 10-A', guardianName: 'Mr. Rajesh Sharma', phone: '+91 98765 43210', slot: '09:30 AM - 09:45 AM', notified: 'SMS & Email', attendance: 'Present', remarks: 'Exceptional math performance; keep encouraging peer guidance.', tags: ['High Achiever', 'Active Participation'], followUpNeeded: false },
            { studentId: 'STU-002', name: 'Neha Gupta', roll: '102', className: 'Class 10-A', guardianName: 'Mrs. Sunita Gupta', phone: '+91 98765 43211', slot: '09:45 AM - 10:00 AM', notified: 'WhatsApp Sent', attendance: 'Pending', remarks: 'Needs more focus on Physics numericals.', tags: ['Needs Academic Support'], followUpNeeded: true },
            { studentId: 'STU-003', name: 'Rohan Verma', roll: '103', className: 'Class 10-A', guardianName: 'Mr. Anil Verma', phone: '+91 98765 43212', slot: '10:00 AM - 10:15 AM', notified: 'Confirmed', attendance: 'Present', remarks: 'Discussed career counseling for Science stream.', tags: ['Career Guidance'], followUpNeeded: false },
            { studentId: 'STU-004', name: 'Sneha Patil', roll: '104', className: 'Class 10-A', guardianName: 'Ms. Kavita Patil', phone: '+91 98765 43213', slot: '10:15 AM - 10:30 AM', notified: 'Confirmed', attendance: 'Absent', remarks: 'Parent called to reschedule due to emergency travel.', tags: ['Reschedule'], followUpNeeded: true }
          ],
          followUps: [
            { student: 'Neha Gupta', meeting: 'Term-1 PTM', actionPlan: 'Provide extra numerical worksheet for Light & Electricity', assignee: 'Amit Sharma', due: '28 Oct 2026', priority: 'High', status: 'Open' },
            { student: 'Sneha Patil', meeting: 'Term-1 PTM', actionPlan: 'Schedule online 1-on-1 virtual call post travel', assignee: 'Class Teacher', due: '02 Nov 2026', priority: 'Medium', status: 'In Progress' }
          ]
        },
        {
          title: 'Virtual One-on-One Academic Progress Check',
          meetingDate: new Date('2026-10-28'),
          startTime: '03:00 PM',
          endTime: '05:00 PM',
          mode: 'Online',
          scope: 'Class 10 - Section A',
          className: 'Class 10',
          sectionName: 'A',
          venue: 'Virtual (Google Meet)',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          description: 'Special virtual slots for working parents to discuss mid-term academic scores and discipline.',
          status: 'Scheduled',
          roster: [
            { studentId: 'STU-005', name: 'Kabir Das', roll: '105', className: 'Class 10-A', guardianName: 'Mrs. Anjali Das', phone: '+91 87654 32109', slot: '03:00 PM - 03:20 PM', notified: 'Email Dispatched', attendance: 'Pending', remarks: 'Absent for 3 days post sports meet; clarify medical slip.', tags: ['Attendance Query'], followUpNeeded: true }
          ],
          followUps: [
            { student: 'Kabir Das', meeting: 'Virtual PTM', actionPlan: 'Collect medical fitness certificate from hospital', assignee: 'School Infirmary', due: '30 Oct 2026', priority: 'High', status: 'Open' }
          ]
        },
        {
          title: 'Quarterly Foundation Parent Orientation',
          meetingDate: new Date('2026-09-12'),
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          mode: 'In person',
          scope: 'Whole school',
          className: 'Class 9',
          sectionName: 'All',
          venue: 'School Amphitheatre',
          description: 'Orientation on new CBSE examination pattern, internal assessment rubrics, and portfolio marks.',
          status: 'Completed',
          roster: [
            { studentId: 'STU-006', name: 'Ishaan Gupta', roll: '106', className: 'Class 9-A', guardianName: 'Mr. Alok Gupta', phone: '+91 99887 76655', slot: 'General', notified: 'Attended', attendance: 'Present', remarks: 'Explained portfolio assessment criteria.', tags: ['Satisfied'], followUpNeeded: false }
          ],
          followUps: []
        }
      ]);
      console.log('Seeded 3 PTM Meetings successfully.');
    }

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
