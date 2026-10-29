const Tenant = require('../models/Tenant');
const Branch = require('../models/Branch');
const SaaSPlan = require('../models/SaaSPlan');
const SupportTicket = require('../models/SupportTicket');
const Student = require('../models/Student'); 
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

exports.registerTenant = async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    
    // Auto-create Admin user for this school
    try {
      let adminRole = await Role.findOne({ name: 'Admin' });
      if (!adminRole) {
         adminRole = await Role.create({ name: 'Admin', permissions: ['all'] });
      }
      
      const adminEmail = req.body.adminEmail || req.body.email;
      const adminPwd = req.body.adminPassword || 'admin123';
      let user = await User.findOne({ email: adminEmail });
      if (user) {
        user.tenant = tenant._id;
        user.role = adminRole._id;
        user.password = adminPwd;
        await user.save();
      } else {
        user = new User({
          username: adminEmail,
          email: adminEmail,
          password: adminPwd,
          role: adminRole._id,
          tenant: tenant._id,
        });
        await user.save();
      }
    } catch(uErr) {
      console.warn('Admin user create notice:', uErr.message);
    }

    // Auto-sync with Branch Admin collection
    try {
      const existingBranch = await Branch.findOne({
        $or: [
          { branchName: tenant.schoolName },
          ...(tenant.email ? [{ contactEmail: tenant.email }] : [])
        ]
      });

      if (!existingBranch) {
        await Branch.create({
          branchName: tenant.schoolName,
          branchCode: 'BR-' + (tenant.subdomain ? tenant.subdomain.toUpperCase() : tenant._id.toString().slice(-4).toUpperCase()),
          address: tenant.address || 'Main Campus',
          contactEmail: tenant.email,
          contactPhone: tenant.phone || '+91 98765 00000',
          principalName: tenant.adminName || 'Principal',
          subscriptionPlan: tenant.plan?.includes('Enterprise') ? 'Enterprise' : (tenant.plan?.includes('Pro') ? 'Pro' : 'Basic'),
          status: tenant.status === 'Active' ? 'Active' : 'Suspended'
        });
      }
    } catch(bErr) {
      console.warn('Tenant auto-sync Branch notice:', bErr.message);
    }

    res.status(201).json({ success: true, data: tenant, user_created: true });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.getTenants = async (req, res) => {
  try {
    // Bidirectional sync: ensure all Branches appear in Multi-School Tenants
    try {
      const branches = await Branch.find();
      for (const b of branches) {
        const email = b.contactEmail || `branch_${(b.branchCode || Date.now()).toString().toLowerCase()}@schoolerp.com`;
        const tenantExists = await Tenant.findOne({
          $or: [
            { schoolName: b.branchName },
            { email: email }
          ]
        });

        if (!tenantExists) {
          await Tenant.create({
            schoolName: b.branchName,
            email: email,
            phone: b.contactPhone || '+91 98765 00000',
            plan: b.subscriptionPlan || 'Enterprise',
            status: b.status || 'Active',
            address: b.address,
            adminName: b.principalName || 'Principal',
            subdomain: (b.branchCode || 'branch').toLowerCase().replace(/[^a-z0-9]/g, '')
          });
        }
      }
    } catch (e) {
      console.warn('Tenant sync notice:', e.message);
    }

    const tenants = await Tenant.find().sort({ createdAt: -1 });
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
    if (tenant) {
      try {
        await Branch.findOneAndUpdate(
          { $or: [{ branchName: tenant.schoolName }, { contactEmail: tenant.email }] },
          { status: 'Suspended' }
        );
      } catch(e) {}
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    // Sync to branch
    try {
      await Branch.findOneAndUpdate(
        { $or: [{ branchName: tenant.schoolName }, { contactEmail: tenant.email }] },
        {
          branchName: tenant.schoolName,
          address: tenant.address,
          contactPhone: tenant.phone,
          status: tenant.status === 'Active' ? 'Active' : 'Suspended',
          subscriptionPlan: tenant.plan?.includes('Enterprise') ? 'Enterprise' : (tenant.plan?.includes('Pro') ? 'Pro' : 'Basic')
        }
      );
    } catch(e) {}

    res.status(200).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    try {
      await Branch.findOneAndDelete({
        $or: [{ branchName: tenant.schoolName }, { contactEmail: tenant.email }]
      });
    } catch(e) {}

    res.status(200).json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

// 1. Dashboard Metrics API
exports.getDashboardStats = async (req, res) => {
  try {
    const activeSchoolsCount = await Tenant.countDocuments({ status: 'Active' });
    const totalSchoolsCount = await Tenant.countDocuments();
    const totalStudents = await Student.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        activeSchools: activeSchoolsCount,
        totalSchools: totalSchoolsCount,
        totalRevenue: 0,
        totalStudents: totalStudents || 0,
        totalStudentsTarget: 0,
        activeSessions: 1
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