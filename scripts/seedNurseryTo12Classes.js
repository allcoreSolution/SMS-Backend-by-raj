const mongoose = require('mongoose');
const AcademicClass = require('../models/AcademicClass');
const AcademicSection = require('../models/AcademicSection');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const seedClasses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp');
    console.log('MongoDB Connected...');

    const sections = await AcademicSection.find({ sectionName: { $in: ['A', 'B'] } });
    const sectionIds = sections.map(s => s._id);

    const classesToEnsure = [
      { className: 'Nursery', numericValue: 0 },
      { className: 'LKG', numericValue: 0.1 },
      { className: 'UKG', numericValue: 0.2 },
      { className: 'Class XI', numericValue: 11 },
      { className: 'Class XII', numericValue: 12 }
    ];

    for (const c of classesToEnsure) {
      let exists = await AcademicClass.findOne({ className: c.className });
      if (!exists) {
        await AcademicClass.create({
          className: c.className,
          numericValue: c.numericValue,
          sections: sectionIds,
          status: 'active'
        });
        console.log('Created class:', c.className);
      } else {
        console.log('Class already exists:', c.className);
      }
    }

    const all = await AcademicClass.find().sort({ numericValue: 1 });
    console.log('Total Classes count:', all.length);
    console.log('All classes now:', all.map(a => `${a.className} (${a.numericValue})`).join(', '));
    process.exit(0);
  } catch (error) {
    console.error('Error seeding classes:', error);
    process.exit(1);
  }
};

seedClasses();
