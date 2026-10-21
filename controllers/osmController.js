const OSMSession = require('../models/OSMSession');

// @desc    Get all OSM sessions with optional filters
// @route   GET /api/osm
exports.getSessions = async (req, res) => {
  try {
    const { status, className, search } = req.query;
    let query = {};

    if (status && status !== 'All' && status !== 'All statuses') {
      query.status = status;
    }

    if (className && className !== 'All' && className !== 'All classes') {
      query.className = new RegExp(className, 'i');
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { subjectName: { $regex: search.trim(), $options: 'i' } },
        { className: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const sessions = await OSMSession.find(query).sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single session by ID
// @route   GET /api/osm/:id
exports.getSessionById = async (req, res) => {
  try {
    const session = await OSMSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new OSM session
// @route   POST /api/osm
exports.createSession = async (req, res) => {
  try {
    const session = await OSMSession.create(req.body);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update session (metadata, questions, sheets)
// @route   PUT /api/osm/:id
exports.updateSession = async (req, res) => {
  try {
    const session = await OSMSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete session
// @route   DELETE /api/osm/:id
exports.deleteSession = async (req, res) => {
  try {
    const session = await OSMSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit evaluation marks & annotations for a specific answer sheet
// @route   POST /api/osm/:id/evaluate-sheet
exports.evaluateSheet = async (req, res) => {
  try {
    const { sheetId, marks, annotations, totalAwarded, flaggedForModeration } = req.body;
    const session = await OSMSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const sheetIndex = session.sheets.findIndex(s => s.id === sheetId);
    if (sheetIndex === -1) {
      return res.status(404).json({ success: false, message: 'Sheet not found in this session' });
    }

    // Update sheet details
    session.sheets[sheetIndex].marks = marks || session.sheets[sheetIndex].marks;
    session.sheets[sheetIndex].annotations = annotations || session.sheets[sheetIndex].annotations;
    session.sheets[sheetIndex].totalAwarded = Number(totalAwarded) || 0;
    session.sheets[sheetIndex].flaggedForModeration = !!flaggedForModeration;
    session.sheets[sheetIndex].status = 'Evaluated';
    session.sheets[sheetIndex].evaluatedAt = new Date();

    // Auto-progress session status
    const allEvaluated = session.sheets.every(s => s.status === 'Evaluated' || s.status === 'Moderated');
    const hasFlags = session.sheets.some(s => s.flaggedForModeration);

    if (allEvaluated) {
      session.status = hasFlags && session.moderationEnabled ? 'Moderation' : 'Completed';
    } else {
      session.status = 'Evaluating';
    }

    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Moderate sheet marks
// @route   POST /api/osm/:id/moderate-sheet
exports.moderateSheet = async (req, res) => {
  try {
    const { sheetId, moderatorMarks, moderationNotes } = req.body;
    const session = await OSMSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const sheetIndex = session.sheets.findIndex(s => s.id === sheetId);
    if (sheetIndex === -1) {
      return res.status(404).json({ success: false, message: 'Sheet not found in this session' });
    }

    session.sheets[sheetIndex].moderatorMarks = Number(moderatorMarks);
    session.sheets[sheetIndex].moderationNotes = moderationNotes || '';
    session.sheets[sheetIndex].status = 'Moderated';

    // Check if all sheets are now moderated / evaluated
    const allDone = session.sheets.every(s => s.status === 'Evaluated' || s.status === 'Moderated');
    if (allDone) {
      session.status = 'Completed';
    }

    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
