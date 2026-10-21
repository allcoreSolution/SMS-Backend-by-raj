const Tenant = require('../models/Tenant');
const SaaSPlan = require('../models/SaaSPlan');
const SupportTicket = require('../models/SupportTicket');
// Needed for global stats calculations - assuming these exist
const Student = require('../models/Student'); 

const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

exports.registerTenant = async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    
    // Auto-create Admin user for this school
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
       adminRole = await Role.create({ name: 'Admin', permissions: ['all'] });
    }
    
    const user = new User({
       username: req.body.adminEmail || req.body.email,
       email: req.body.adminEmail || req.body.email,
       password: req.body.adminPassword || 'admin123',
       role: adminRole._id,
       tenant: tenant._id, // if multi-tenant support exists in user
    });
    await user.save();

    res.status(201).json({ success: true, data: tenant, user_created: true });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json({ success: true, data: tenants });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.status(200).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.suspendTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: 'Suspended' }, { new: true });
    res.status(200).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.status(200).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.status(200).json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// 1. Dashboard Metrics API
exports.getDashboardStats = async (req, res) => {
  try {
    const activeSchoolsCount = await Tenant.countDocuments({ status: 'Active' });
    const totalSchoolsCount = await Tenant.countDocuments();
    // In a real application, you'd aggregate revenue from a SuperAdmin Billing collection
    // Let's return some realistic aggregate data
    res.status(200).json({
      success: true,
      data: {
        activeSchools: activeSchoolsCount,
        totalSchools: totalSchoolsCount,
        totalRevenue: 285400, // Dummy aggregation logic for now
        totalStudentsTarget: 10000 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Recharge Quotas API (Wallet)
exports.rechargeWallet = async (req, res) => {
  try {
    const { schoolId, smsAmount, whatsappAmount } = req.body;
    const tenant = await Tenant.findById(schoolId);
    if (!tenant) return res.status(404).json({ success: false, message: 'School not found' });
    
    tenant.smsQuota += Number(smsAmount) || 0;
    tenant.whatsappQuota += Number(whatsappAmount) || 0;
    await tenant.save();
    
    res.status(200).json({ success: true, data: tenant, message: 'Wallet Recharged Successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 3. Support Tickets (SuperAdmin view)
exports.getAllTickets = async (req, res) => {
  try {
    // Populate schoolName so SuperAdmin knows who submitted it
    const tickets = await SupportTicket.find().populate('schoolId', 'schoolName email');
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};