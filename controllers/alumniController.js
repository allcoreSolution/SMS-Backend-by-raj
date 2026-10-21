const Alumni = require('../models/Alumni');
const AlumniEvent = require('../models/AlumniEvent');

exports.registerAlumni = async (req, res) => {
  try {
    const alumni = new Alumni(req.body);
    await alumni.save();
    res.status(201).json({ success: true, data: alumni });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.getAlumniList = async (req, res) => {
  try {
    const alumni = await Alumni.find();
    res.status(200).json({ success: true, data: alumni });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.createEvent = async (req, res) => {
  try {
    const event = new AlumniEvent(req.body);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};