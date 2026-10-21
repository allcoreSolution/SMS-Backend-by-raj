const Tenant = require('../models/Tenant');
const SaaSPlan = require('../models/SaaSPlan');
const User = require('../models/User');
const Role = require('../models/Role');

async function getSuperAdminRole() {
  let role = await Role.findOne({
    name: { $in: ['SuperAdmin', 'super_admin', 'Super Admin', 'Admin'] },
  });
  if (!role) {
    role = await Role.create({
      name: 'SuperAdmin',
      permissions: ['all'],
      description: 'Platform Super Admin',
    });
  }
  return role;
}

/* Dashboard Analytics */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalSchools = await Tenant.countDocuments();
    const activeSchools = await Tenant.countDocuments({ status: 'Active' });
    const totalPlans = await SaaSPlan.countDocuments();
    const superRole = await getSuperAdminRole();
    const totalSuperAdmins = await User.countDocuments({ role: superRole._id });

    let totalStudents = 0;
    try {
      const statsAggr = await Tenant.aggregate([
        { $group: { _id: null, totalStudents: { $sum: '$studentsCount' } } },
      ]);
      totalStudents = statsAggr.length > 0 ? statsAggr[0].totalStudents : 0;
    } catch (_) {}

    res.json({
      success: true,
      data: {
        totalSchools,
        activeSchools,
        totalPlans,
        totalSuperAdmins,
        revenue: 0,
        activeStudents: totalStudents,
      },
    });
  } catch (error) {
    console.error('Dashboard Analytics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Team Management */
exports.getTeamMembers = async (req, res) => {
  try {
    const superRole = await getSuperAdminRole();
    const admins = await User.find({ role: superRole._id })
      .select('-password')
      .populate('role');

    const data = admins.map((u) => ({
      _id: u._id,
      name: u.username || u.email,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      role: (u.role && u.role.name) || 'SuperAdmin',
      status: u.isActive === false ? 'Inactive' : 'Active',
      createdAt: u.createdAt,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const superRole = await getSuperAdminRole();

    // username REQUIRED — User model mein name field nahi hai
    const base = (name || email.split('@')[0] || 'admin')
      .toString()
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase();
    const username = `${base}_${Date.now().toString().slice(-5)}`;

    const newAdmin = await User.create({
      username,                                    // required
      email: String(email).toLowerCase(),
      password: password || 'admin@123',
      role: superRole._id,                         // ObjectId, NOT string
      isActive: status !== 'Inactive',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newAdmin._id,
        name: name || newAdmin.username,
        email: newAdmin.email,
        phone: phone || '',
        role: 'SuperAdmin',
        status: newAdmin.isActive ? 'Active' : 'Inactive',
        createdAt: newAdmin.createdAt,
      },
      message: 'Team member added successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (email) user.email = String(email).toLowerCase();
    if (name) {
      user.username = String(name).trim().replace(/\s+/g, '_').toLowerCase();
    }
    if (typeof status === 'string') {
      user.isActive = status !== 'Inactive';
    }
    if (password) user.password = password;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: name || user.username,
        email: user.email,
        status: user.isActive ? 'Active' : 'Inactive',
      },
      message: 'Member updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Rate Cards & Comms */
exports.getRateCards = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { sms_rate: 0.5, whatsapp_rate: 1.2, email_rate: 0.05 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRateCards = async (req, res) => {
  try {
    res.json({ success: true, message: 'Rate cards updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Website templates */
exports.getWebsiteTemplates = async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};