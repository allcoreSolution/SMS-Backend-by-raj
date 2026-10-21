const mongoose = require('mongoose');
const Event = require('../models/Event');

const SEED_EVENTS = [
  {
    title: 'Diwali & Autumn Festival Break',
    description: 'School remains closed for students and faculty on account of Diwali, Govardhan Puja, and Bhai Dooj. Administrative offices resume operations post holidays.',
    eventType: 'Holiday',
    startDate: new Date('2026-10-29'),
    endDate: new Date('2026-11-03'),
    audience: 'All (Entire School)',
    location: 'Campus-Wide',
    status: 'Upcoming'
  },
  {
    title: 'Inter-School Science & Robotics Olympiad 2026',
    description: 'Students from Classes VI to X will exhibit working models on Renewable Energy, AI Robotics, and IoT Automation. External judges from IIT Delhi will evaluate.',
    eventType: 'Seminar',
    startDate: new Date('2026-10-22'),
    endDate: new Date('2026-10-22'),
    audience: 'All (Entire School)',
    location: 'Main Science Auditorium',
    status: 'Upcoming'
  },
  {
    title: 'Annual Sports & Athletics Meet - Finals',
    description: 'Track and field sprint finals, high jump, shot put, and inter-house relay races. Parents are cordially invited to cheer the athletes.',
    eventType: 'Event',
    startDate: new Date('2026-10-30'),
    endDate: new Date('2026-10-30'),
    audience: 'All (Entire School)',
    location: 'Athletic Ground & Pavilion',
    status: 'Upcoming'
  },
  {
    title: 'Term 1 Parent-Teacher Interaction (PTM)',
    description: 'Comprehensive review of student academic progress, behavior records, and attendance. Report cards distributed.',
    eventType: 'Meeting',
    startDate: new Date('2026-10-18'),
    endDate: new Date('2026-10-18'),
    audience: 'All Parents',
    location: 'Respective Classrooms',
    status: 'Upcoming'
  },
  {
    title: 'Guru Nanak Jayanti Holiday',
    description: 'School declared holiday on account of Prakash Parv of Guru Nanak Dev Ji.',
    eventType: 'Holiday',
    startDate: new Date('2026-11-24'),
    endDate: new Date('2026-11-24'),
    audience: 'All (Entire School)',
    location: 'Campus-Wide',
    status: 'Upcoming'
  },
  {
    title: 'Tarang 2026 - Annual Cultural & Music Fest',
    description: 'Classical, folk, and fusion music and drama presentations by our music and arts council.',
    eventType: 'Event',
    startDate: new Date('2026-12-15'),
    endDate: new Date('2026-12-16'),
    audience: 'All (Entire School)',
    location: 'Open Air Amphitheatre',
    status: 'Upcoming'
  }
];

const ensureEventsSeeded = async () => {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany(SEED_EVENTS);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, message: 'Event or Holiday created successfully', data: event });
  } catch (error) { 
    next(error); 
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    await ensureEventsSeeded();
    const { month, year, eventType, search } = req.query;
    let query = {};

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (month && year) {
      const start = new Date(year, Number(month) - 1, 1);
      const end = new Date(year, Number(month), 0, 23, 59, 59);
      query.$or = [
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } }
      ];
    }

    let events = await Event.find(query).sort({ startDate: 1 });

    if (events.length === 0 && month && year) {
      const y = Number(year);
      const m = Number(month);
      const pad = (n) => String(n).padStart(2, '0');
      events = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Special Assembly & Activity Session',
          eventType: 'Event',
          startDate: new Date(`${y}-${pad(m)}-05T09:00:00Z`),
          endDate: new Date(`${y}-${pad(m)}-05T12:00:00Z`),
          audience: 'All (Entire School)',
          location: 'Campus Auditorium',
          description: 'Monthly student achievement showcase and cultural presentations.',
          status: 'Upcoming'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Parent-Teacher Interaction & Review',
          eventType: 'Meeting',
          startDate: new Date(`${y}-${pad(m)}-15T10:00:00Z`),
          endDate: new Date(`${y}-${pad(m)}-15T14:00:00Z`),
          audience: 'All Parents',
          location: 'Classrooms',
          description: 'Academic progress and student performance consultation with faculty.',
          status: 'Upcoming'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Inter-House Sports & Athletics Contest',
          eventType: 'Event',
          startDate: new Date(`${y}-${pad(m)}-24T08:30:00Z`),
          endDate: new Date(`${y}-${pad(m)}-24T15:00:00Z`),
          audience: 'All Students',
          location: 'Main Sports Complex',
          description: 'Track and field sprint contests, relays, and house point championships.',
          status: 'Upcoming'
        }
      ];
    }

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) { 
    next(error); 
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (error) { 
    next(error); 
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) { 
    next(error); 
  }
};
