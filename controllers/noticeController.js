const Notice = require('../models/Notice');
const AcademicClass = require('../models/AcademicClass');
const fs = require('fs');
const path = require('path');

const SEED_NOTICES = [
  {
    noticeNumber: 'NOT-2026-1001',
    title: 'Annual Sports Day 2026 Participation & Rehearsal Schedule',
    content: 'Dear Parents, Students and Faculty, the Annual Inter-House Athletics and Sports Meet is scheduled from 28th October to 30th October 2026. All shortlisted participants from Red Phoenix, Blue Pegasus, Green Dragon, and Yellow Hydra houses must report to the sports ground by 7:45 AM daily for morning drills.',
    sentTo: 'All (Entire School)',
    targetAudience: 'All',
    priority: 'High',
    publishDate: new Date('2026-10-12'),
    createdByRole: 'Sports Council',
    viewsCount: 142
  },
  {
    noticeNumber: 'NOT-2026-1002',
    title: 'CBSE Mid-Term Assessment Date Sheet Published',
    content: 'The Mid-Term Examination Date Sheet for Classes VI to X has been finalized and uploaded to the student and parent portal. Examinations will commence from 5th November 2026. Admit cards will be issued starting next Monday.',
    sentTo: 'All Parents',
    targetAudience: 'Parent',
    priority: 'Urgent',
    publishDate: new Date('2026-10-10'),
    createdByRole: 'Examination Cell',
    viewsCount: 285
  },
  {
    noticeNumber: 'NOT-2026-1003',
    title: 'Winter Uniform Guidelines & School Timings Update',
    content: 'Effective 1st November 2026, the school timings for all students will be 8:30 AM to 2:30 PM. All students must wear the designated navy blue blazer, gray trousers/skirts, and institutional tie. School uniform shop is open on weekdays.',
    sentTo: 'All (Entire School)',
    targetAudience: 'All',
    priority: 'Normal',
    publishDate: new Date('2026-10-08'),
    createdByRole: 'Administrative Office',
    viewsCount: 198
  },
  {
    noticeNumber: 'NOT-2026-1004',
    title: 'Parent-Teacher Meeting (PTM) for Term 1 Evaluations',
    content: 'The Term 1 Parent-Teacher Meeting will take place this Saturday, 18th October, between 9:00 AM and 1:00 PM. Parents are requested to adhere to their designated roll-number time slots. Tea and light refreshments will be served in the cafeteria.',
    sentTo: 'All Parents',
    targetAudience: 'Parent',
    priority: 'High',
    publishDate: new Date('2026-10-05'),
    createdByRole: 'Academic Coordinator',
    viewsCount: 312
  }
];

const ensureNoticesSeeded = async () => {
  const count = await Notice.countDocuments();
  if (count === 0) {
    await Notice.insertMany(SEED_NOTICES);
  }
};

const deleteFileFromDisk = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error(`Failed to delete file: ${absolutePath}`, err);
  });
};

exports.createNotice = async (req, res, next) => {
  try {
    const noticeData = { ...req.body };
    
    if (req.file) {
      noticeData.attachmentUrl = `uploads/documents/${req.file.filename}`;
    }

    if (noticeData.publishDate) {
      noticeData.publishDate = new Date(noticeData.publishDate);
    }

    const notice = await Notice.create(noticeData);
    res.status(201).json({ success: true, message: 'Notice published successfully', data: notice });
  } catch (error) { 
    if (req.file) deleteFileFromDisk(`uploads/documents/${req.file.filename}`);
    next(error); 
  }
};

exports.getNotices = async (req, res, next) => {
  try {
    await ensureNoticesSeeded();
    const { audience, classId, priority, search } = req.query;
    let query = { isActive: true };
    
    if (audience && audience !== 'All') {
      query.$or = [{ targetAudience: 'All' }, { targetAudience: audience }, { sentTo: { $regex: audience, $options: 'i' } }];
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (classId) {
      query.$or = [{ targetClass: classId }, { targetClass: { $exists: false } }, { targetClass: null }];
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { noticeNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const notices = await Notice.find(query).sort({ publishDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) { 
    next(error); 
  }
};

exports.updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) { 
    next(error); 
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (notice.attachmentUrl) {
      deleteFileFromDisk(notice.attachmentUrl);
    }

    await notice.deleteOne();
    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) { 
    next(error); 
  }
};

exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

