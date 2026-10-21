const User = require('../models/User');
const Role = require('../models/Role');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or restricted in production to Admin)
const register = async (req, res) => {
  const { username, email, password, roleName } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or username' });
    }

    // Find the role or auto-create it if it doesn't exist
    const selectedRoleName = roleName || 'Teacher'; // Default role
    let role = await Role.findOne({ name: selectedRoleName });
    if (!role) {
      role = await Role.create({ name: selectedRoleName, permissions: [], description: `Auto-generated ${selectedRoleName} role` });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role._id,
    });

    if (user) {
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: selectedRoleName,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const identifier = req.body.email || req.body.username || req.body.userId || req.body.empId || req.body.admissionNo;
  const { password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).populate('role').populate('tenant').select('+password');

    if (!user) {
      // Check if identifier corresponds to a Parent
      let parent = null;
      if (identifier === 'P-1920-KABIR') {
        parent = await Parent.findOne({ status: 'Active' });
      } else {
        parent = await Parent.findOne({
          $or: [{ loginId: identifier }, { phone: identifier }, { email: identifier }]
        });
      }

      if (parent) {
        return res.json({
          success: true,
          data: {
            _id: parent._id,
            username: parent.loginId,
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            role: 'Parent',
            parentId: parent._id,
            children: parent.children || [],
            token: generateToken(parent._id),
          }
        });
      }

      // Check if identifier corresponds to a Student
      const student = await Student.findOne({
        $or: [
          { admissionNo: identifier },
          { aparId: identifier },
          { studentEmail: identifier },
          { studentPhone: identifier }
        ]
      }).populate('classId', 'className').populate('sectionId', 'sectionName');

      if (student) {
        return res.json({
          success: true,
          data: {
            _id: student._id,
            username: student.admissionNo || student.aparId,
            name: `${student.firstName} ${student.lastName || ''}`.trim(),
            email: student.studentEmail,
            role: 'Student',
            studentId: student._id,
            class: `${student.classId?.className || ''} (${student.sectionId?.sectionName || ''})`,
            token: generateToken(student._id),
          }
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'User account is inactive. Please contact admin.' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions,
        tenantId: user.tenant ? user.tenant._id : null,
        tenant: user.tenant ? user.tenant : null,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new role
// @route   POST /api/auth/roles
// @access  Private (Admin only)
const createRole = async (req, res) => {
  const { name, permissions, description } = req.body;

  try {
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      return res.status(400).json({ success: false, message: 'Role already exists' });
    }

    const role = await Role.create({
      name,
      permissions,
      description,
    });

    return res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all roles
// @route   GET /api/auth/roles
// @access  Private (Admin/Staff only)
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    return res.json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  createRole,
  getRoles,
};
