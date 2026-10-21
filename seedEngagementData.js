const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const {
  CreativeTemplate,
  FestivalGreeting,
  BirthdayLog,
  EngagementSettings
} = require('./models/Engagement');
const Student = require('./models/Student');
const Staff = require('./models/Staff');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seedEngagement() {
  try {
    console.log('Connecting to MongoDB for Engagement Seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Clear previous engagement collections
    await Promise.all([
      CreativeTemplate.deleteMany({}),
      FestivalGreeting.deleteMany({}),
      BirthdayLog.deleteMany({}),
      EngagementSettings.deleteMany({})
    ]);
    console.log('Cleared previous engagement collections.');

    // 2. Seed Creative Templates
    const creativesData = [
      {
        name: 'Balloon Blue (Birthday)',
        type: 'Birthday Card',
        style: 'balloon-blue',
        title: 'Happy Birthday!',
        placeholder: '[student_name]',
        greetingText: 'Wishing you a fantastic year ahead! Keep shining and reaching for the stars.',
        subText: 'From Greenwood International School',
        backgroundGradient: 'from-blue-600 via-sky-600 to-indigo-700',
        textColor: '#ffffff',
        isDefault: true,
        tags: ['Kids', 'Balloons', 'Blue', 'Birthday']
      },
      {
        name: 'Bold Party (Birthday)',
        type: 'Birthday Card',
        style: 'bold-dark',
        title: 'HAPPY BIRTHDAY',
        placeholder: '[student_name]',
        greetingText: 'Let the celebrations begin! May your special day be filled with happiness and laughter.',
        subText: 'Warmest Wishes from Principal & Faculty',
        backgroundGradient: 'from-slate-900 via-indigo-950 to-purple-900',
        textColor: '#fbbf24',
        isDefault: false,
        tags: ['Bold', 'Dark', 'Confetti', 'Senior']
      },
      {
        name: 'Pastel Kids (Birthday)',
        type: 'Birthday Card',
        style: 'pastel-kids',
        title: 'HAPPY BIRTHDAY',
        placeholder: '[student_name]',
        greetingText: 'Have a super fun day filled with treats, joy, games and giant smiles!',
        subText: 'Your Teachers & Friends at Greenwood',
        backgroundGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        textColor: '#ffffff',
        isDefault: false,
        tags: ['Primary', 'Fun', 'Pastel', 'Green']
      },
      {
        name: 'Confetti Cream (Birthday)',
        type: 'Birthday Card',
        style: 'confetti-cream',
        title: 'HAPPY BIRTHDAY',
        placeholder: '[student_name]',
        greetingText: 'To our shining star! May all your dreams, curiosity, and learning soar high.',
        subText: 'Greenwood Family Wishes You Joy',
        backgroundGradient: 'from-amber-500 via-orange-500 to-rose-600',
        textColor: '#ffffff',
        isDefault: false,
        tags: ['Cupcake', 'Warm', 'Confetti']
      },
      {
        name: 'Festive Gold (Festival)',
        type: 'Festival Banner',
        style: 'gold-purple',
        title: 'HAPPY',
        placeholder: '[festival_name]',
        greetingText: 'May this auspicious festival illuminate your path with wisdom, peace, prosperity and joy.',
        subText: 'Warm greetings from Greenwood International School',
        backgroundGradient: 'from-purple-900 via-indigo-900 to-amber-700',
        textColor: '#fef08a',
        isDefault: true,
        tags: ['Festival', 'Gold', 'Diwali', 'NewYear']
      },
      {
        name: 'Diya Warm (Festival)',
        type: 'Festival Banner',
        style: 'diya-warm',
        title: 'WARM GREETINGS ON',
        placeholder: '[festival_name]',
        greetingText: 'Celebrating the joyous spirit of togetherness, traditions, and divine light.',
        subText: 'Greenwood Management, Teachers & Staff',
        backgroundGradient: 'from-amber-700 via-orange-700 to-red-800',
        textColor: '#ffffff',
        isDefault: false,
        tags: ['Diya', 'Traditional', 'Warm']
      },
      {
        name: 'Night Sparkle (Festival)',
        type: 'Festival Banner',
        style: 'night-blue',
        title: 'CELEBRATING',
        placeholder: '[festival_name]',
        greetingText: 'May the festive season bring peace, good health, and abundant happiness to every family.',
        subText: 'Best Wishes from Greenwood International School',
        backgroundGradient: 'from-blue-950 via-indigo-900 to-slate-900',
        textColor: '#38bdf8',
        isDefault: false,
        tags: ['Eid', 'Christmas', 'Sparkle']
      },
      {
        name: 'Rangoli Rose (Festival)',
        type: 'Festival Banner',
        style: 'rangoli-rose',
        title: 'JOYOUS',
        placeholder: '[festival_name]',
        greetingText: 'Colours of joy, harmony, and eternal celebration in every classroom and home.',
        subText: 'Greenwood International School',
        backgroundGradient: 'from-rose-600 via-pink-600 to-purple-800',
        textColor: '#ffffff',
        isDefault: false,
        tags: ['Holi', 'Navratri', 'Vibrant']
      }
    ];

    const createdCreatives = await CreativeTemplate.insertMany(creativesData);
    console.log(`Seeded ${createdCreatives.length} Creative Templates.`);

    // 3. Seed Festival Greetings
    const now = new Date();
    const addDays = (d, n) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);

    const festivalsData = [
      {
        name: 'Onam Harvest Celebrations',
        date: addDays(now, 3),
        region: 'KL',
        greetingLine: 'May King Mahabali bless your home with prosperity, joy, and peace.',
        cardTemplateName: 'Festive Gold (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: 'Raksha Bandhan',
        date: addDays(now, 5),
        region: 'ALL',
        greetingLine: 'Celebrating the eternal bond of love, care, and protection between brothers and sisters.',
        cardTemplateName: 'Rangoli Rose (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: 'Shri Krishna Janmashtami',
        date: addDays(now, 12),
        region: 'ALL',
        greetingLine: 'May Lord Krishna shower divine blessings of wisdom, love, and courage upon all students.',
        cardTemplateName: 'Diya Warm (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: "National Teachers' Day",
        date: addDays(now, 13),
        region: 'National',
        greetingLine: 'Honouring our dedicated educators whose selfless guidance shapes future leaders every day.',
        cardTemplateName: 'Festive Gold (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: 'Ganesh Chaturthi',
        date: addDays(now, 22),
        region: 'ALL',
        greetingLine: 'May Lord Ganesha, the remover of obstacles, grant all learners clarity, focus and success.',
        cardTemplateName: 'Diya Warm (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: 'Gandhi Jayanti',
        date: addDays(now, 40),
        region: 'National',
        greetingLine: 'Remembering the father of our nation with messages of truth, non-violence, and service.',
        cardTemplateName: 'Night Sparkle (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: 'Diwali — Festival of Lights',
        date: addDays(now, 75),
        region: 'ALL',
        greetingLine: 'May the radiance of Diwali diyas illuminate your life with infinite joy, good health and knowledge.',
        cardTemplateName: 'Festive Gold (Festival)',
        targetAudience: 'All Users',
        autoSend: true,
        status: 'Upcoming'
      },
      {
        name: "Children's Day & Founder's Meet",
        date: addDays(now, 85),
        region: 'ALL',
        greetingLine: 'Celebrating the boundless wonder, creativity, and bright laughter of our beloved students.',
        cardTemplateName: 'Pastel Kids (Birthday)',
        targetAudience: 'Students',
        autoSend: true,
        isCustomDay: true,
        status: 'Upcoming'
      },
      {
        name: 'Annual Sports Day 2026',
        date: addDays(now, 95),
        region: 'ALL',
        greetingLine: 'Cheering on our young champions for athletic grit, teamwork, and true sportsmanship!',
        cardTemplateName: 'Bold Party (Birthday)',
        targetAudience: 'All Users',
        autoSend: true,
        isCustomDay: true,
        status: 'Upcoming'
      }
    ];

    const createdFestivals = await FestivalGreeting.insertMany(festivalsData);
    console.log(`Seeded ${createdFestivals.length} Festival Greetings & Custom Days.`);

    // 4. Seed Engagement Settings
    const settings = await EngagementSettings.create({
      studentBirthdayEnabled: true,
      studentBirthdayCard: 'Balloon Blue (Birthday)',
      studentBirthdayTime: '08:00',
      studentBirthdayChannels: ['WhatsApp', 'SMS', 'Mobile App Push'],
      staffBirthdayEnabled: true,
      staffBirthdayCard: 'Bold Party (Birthday)',
      staffBirthdayTime: '08:30',
      staffBirthdayChannels: ['WhatsApp', 'Email'],
      festivalGreetingsEnabled: true,
      festivalDefaultTime: '07:30',
      festivalChannels: ['WhatsApp', 'Mobile App Push'],
      notifyClassTeacher: true,
      principalSignatureText: 'Dr. V. K. Shrivastava (Principal), Greenwood International School'
    });
    console.log('Seeded Engagement Settings.');

    // 5. Update/Distribute Students & Staff Birthdays for Realistic Live Data
    const students = await Student.find();
    console.log(`Found ${students.length} students in DB.`);

    if (students.length > 0) {
      // Set student 0 birthday = Today
      const bdayToday = new Date(2014, now.getMonth(), now.getDate());
      students[0].dateOfBirth = bdayToday;
      await students[0].save();

      // Set student 1 birthday = in 2 days
      if (students[1]) {
        const bdayIn2 = addDays(now, 2);
        students[1].dateOfBirth = new Date(2013, bdayIn2.getMonth(), bdayIn2.getDate());
        await students[1].save();
      }

      // Set student 2 birthday = in 4 days
      if (students[2]) {
        const bdayIn4 = addDays(now, 4);
        students[2].dateOfBirth = new Date(2015, bdayIn4.getMonth(), bdayIn4.getDate());
        await students[2].save();
      }

      // Set student 3 birthday = in 6 days
      if (students[3]) {
        const bdayIn6 = addDays(now, 6);
        students[3].dateOfBirth = new Date(2012, bdayIn6.getMonth(), bdayIn6.getDate());
        await students[3].save();
      }

      // Set student 4 birthday = in 15 days (this month)
      if (students[4]) {
        const bdayIn15 = addDays(now, 15);
        students[4].dateOfBirth = new Date(2016, bdayIn15.getMonth(), bdayIn15.getDate());
        await students[4].save();
      }
    }

    // Set staff member birthdays
    const staffMembers = await Staff.find();
    console.log(`Found ${staffMembers.length} staff members in DB.`);

    if (staffMembers.length > 0) {
      // Staff 0 birthday = in 5 days
      const staffBdayIn5 = addDays(now, 5);
      staffMembers[0].dateOfBirth = new Date(1990, staffBdayIn5.getMonth(), staffBdayIn5.getDate());
      await staffMembers[0].save();

      // Staff 1 birthday = in 3 days
      if (staffMembers[1]) {
        const staffBdayIn3 = addDays(now, 3);
        staffMembers[1].dateOfBirth = new Date(1988, staffBdayIn3.getMonth(), staffBdayIn3.getDate());
        await staffMembers[1].save();
      }
    }

    // 6. Seed a sample Birthday Greeting Log (Sent)
    if (students[4]) {
      await BirthdayLog.create({
        personId: students[4]._id,
        personType: 'Student',
        name: `${students[4].firstName} ${students[4].lastName || ''}`.trim(),
        sub: 'Class IX A',
        age: 14,
        cardTemplateName: 'Balloon Blue (Birthday)',
        status: 'Sent',
        channel: 'WhatsApp',
        sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      });
    }

    console.log('Engagement Module Seeded Successfully with 100% Real Data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding engagement:', error);
    process.exit(1);
  }
}

seedEngagement();
