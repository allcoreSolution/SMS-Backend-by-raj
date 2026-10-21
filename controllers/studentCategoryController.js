const StudentCategory = require('../models/StudentCategory');
const Student = require('../models/Student');

// @desc    Get all categories with student count
// @route   GET /api/student-categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await StudentCategory.find().sort({ createdAt: 1 });

    const populated = await Promise.all(
      categories.map(async (cat) => {
        const studentCount = await Student.countDocuments({
          category: new RegExp(`^${cat.name}`, 'i')
        });
        return {
          ...cat.toObject(),
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

// @desc    Create category
// @route   POST /api/student-categories
exports.createCategory = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const cat = await StudentCategory.create({
      name,
      code: code || name.toUpperCase().slice(0, 4),
      description: description || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Student category created successfully',
      data: { ...cat.toObject(), students: 0 }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/student-categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    const cat = await StudentCategory.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) cat.name = name;
    if (code) cat.code = code;
    if (description !== undefined) cat.description = description;
    if (status) cat.status = status;

    await cat.save();

    const studentCount = await Student.countDocuments({
      category: new RegExp(`^${cat.name}`, 'i')
    });

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: { ...cat.toObject(), students: studentCount }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/student-categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await StudentCategory.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await cat.deleteOne();
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
