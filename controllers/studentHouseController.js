const StudentHouse = require('../models/StudentHouse');
const Student = require('../models/Student');

// @desc    Get all student houses with live member count
// @route   GET /api/student-houses
exports.getHouses = async (req, res) => {
  try {
    const houses = await StudentHouse.find().sort({ createdAt: 1 });
    
    // Calculate live students in each house
    const populated = await Promise.all(
      houses.map(async (house) => {
        const studentCount = await Student.countDocuments({
          house: new RegExp(`^${house.name}`, 'i')
        });
        return {
          ...house.toObject(),
          students: studentCount
        };
      })
    );

    return res.json({
      success: true,
      count: populated.length,
      data: populated
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create house
// @route   POST /api/student-houses
exports.createHouse = async (req, res) => {
  try {
    const { name, color, description, headStudent } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'House name is required' });
    }

    const house = await StudentHouse.create({
      name,
      color: color || '#3b82f6',
      description: description || '',
      headStudent: headStudent || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Student house created successfully',
      data: { ...house.toObject(), students: 0 }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update house
// @route   PUT /api/student-houses/:id
exports.updateHouse = async (req, res) => {
  try {
    const { name, color, description, headStudent, status } = req.body;
    const house = await StudentHouse.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }

    if (name) house.name = name;
    if (color) house.color = color;
    if (description !== undefined) house.description = description;
    if (headStudent !== undefined) house.headStudent = headStudent;
    if (status) house.status = status;

    await house.save();

    const studentCount = await Student.countDocuments({
      house: new RegExp(`^${house.name}`, 'i')
    });

    return res.json({
      success: true,
      message: 'House updated successfully',
      data: { ...house.toObject(), students: studentCount }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete house
// @route   DELETE /api/student-houses/:id
exports.deleteHouse = async (req, res) => {
  try {
    const house = await StudentHouse.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }

    await house.deleteOne();
    return res.json({ success: true, message: 'House deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
