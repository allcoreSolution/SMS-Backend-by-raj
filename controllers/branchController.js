const Branch = require('../models/Branch');
const Tenant = require('../models/Tenant');

exports.addBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);

    // Auto-sync with Multi-School Tenant
    try {
      const email = branch.contactEmail || `branch_${(branch.branchCode || Date.now()).toString().toLowerCase()}@schoolerp.com`;
      const existingTenant = await Tenant.findOne({
        $or: [
          { schoolName: branch.branchName },
          { email: email }
        ]
      });

      if (!existingTenant) {
        await Tenant.create({
          schoolName: branch.branchName,
          email: email,
          phone: branch.contactPhone || '+91 98765 00000',
          plan: branch.subscriptionPlan || 'Enterprise',
          status: branch.status || 'Active',
          address: branch.address,
          adminName: branch.principalName || 'Principal',
          subdomain: (branch.branchCode || 'branch').toLowerCase().replace(/[^a-z0-9]/g, '')
        });
      }
    } catch (syncErr) {
      console.warn('Branch auto-sync Tenant notice:', syncErr.message);
    }

    res.status(201).json({ success: true, data: branch });
  } catch (error) { next(error); }
};

exports.getBranches = async (req, res, next) => {
  try {
    // Bidirectional sync: ensure Tenants appear as Branches
    try {
      const tenants = await Tenant.find();
      for (const t of tenants) {
        const branchExists = await Branch.findOne({
          $or: [
            { branchName: t.schoolName },
            ...(t.email ? [{ contactEmail: t.email }] : [])
          ]
        });

        if (!branchExists) {
          await Branch.create({
            branchName: t.schoolName,
            branchCode: 'BR-' + (t.subdomain ? t.subdomain.toUpperCase() : t._id.toString().slice(-4).toUpperCase()),
            address: t.address || 'Main Campus',
            contactEmail: t.email,
            contactPhone: t.phone || '+91 98765 00000',
            principalName: t.adminName || 'Principal',
            subscriptionPlan: t.plan?.includes('Enterprise') ? 'Enterprise' : (t.plan?.includes('Pro') ? 'Pro' : 'Basic'),
            status: t.status === 'Active' ? 'Active' : 'Suspended'
          });
        }
      }
    } catch (e) {
      console.warn('Branch back-sync notice:', e.message);
    }

    const branches = await Branch.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: branches.length, data: branches });
  } catch (error) { next(error); }
};

exports.updateBranch = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        let branch;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
          branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        } else {
          branch = await Branch.findOneAndUpdate(
            { $or: [{ branchCode: req.params.id }, { branchName: req.body.branchName }] },
            req.body,
            { new: true, runValidators: true }
          );
        }
        if (branch) {
          try {
            await Tenant.findOneAndUpdate(
              { $or: [{ schoolName: branch.branchName }, { email: branch.contactEmail }] },
              {
                schoolName: branch.branchName,
                address: branch.address,
                phone: branch.contactPhone,
                status: branch.status,
                plan: branch.subscriptionPlan
              }
            );
          } catch(e) {}
        }
        res.status(200).json({ success: true, data: branch });
    } catch (error) { next(error); }
};

exports.deleteBranch = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        let branch;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
          branch = await Branch.findById(req.params.id);
        } else {
          branch = await Branch.findOne({ branchCode: req.params.id });
        }
        if (branch) {
          try {
            await Tenant.findOneAndDelete({
              $or: [{ schoolName: branch.branchName }, { email: branch.contactEmail }]
            });
          } catch(e) {}
          await branch.deleteOne();
        }
        res.status(200).json({ success: true, message: 'Branch deleted' });
    } catch (error) { next(error); }
};


exports.getBranchDashboardStats = async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.status === 'Active').length;

    const Student = require('../models/Student');
    const Staff = require('../models/Staff');
    const FeeCollection = require('../models/FeeCollection');
    const Lead = require('../models/Lead');

    const studentCount = await Student.countDocuments();
    const staffCount = await Staff.countDocuments();
    const leadsCount = await Lead.countDocuments();

    // Fee collections aggregate
    let totalFee = 0;
    try {
      const feeAggr = await FeeCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ]);
      if (feeAggr.length > 0 && feeAggr[0].total) totalFee = feeAggr[0].total;
    } catch (_) {}

    // Recent leads for cross-panel visibility
    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(5);

    // Map real branch records without fake seed multipliers
    const mappedBranches = branches.map((b) => {
      const branchStudents = Number(b.students) || 0;
      const branchStaff = Number(b.staff) || 0;
      const attendancePct = b.attendance || '0%';
      const collectedFormatted = b.collected || '₹0';
      const collectedRaw = 0;

      return {
        _id: b._id,
        id: b._id,
        name: b.branchName,
        branchName: b.branchName,
        code: b.branchCode,
        branchCode: b.branchCode,
        email: b.contactEmail,
        contactEmail: b.contactEmail,
        phone: b.contactPhone,
        contactPhone: b.contactPhone,
        address: b.address,
        principal: b.principalName || 'Principal',
        principalName: b.principalName || 'Principal',
        plan: b.subscriptionPlan ? (b.subscriptionPlan.includes('Plan') ? b.subscriptionPlan : b.subscriptionPlan + ' Plan') : 'Basic Plan',
        subscriptionPlan: b.subscriptionPlan || 'Basic',
        status: b.status || 'Active',
        students: branchStudents,
        staff: branchStaff,
        attendance: attendancePct,
        collected: collectedFormatted,
        collectedRaw: collectedRaw,
        renews: '—',
        reg: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        domain: b.branchCode ? (b.branchCode.toLowerCase().replace(/[^a-z0-9]/g, '') + '.schoolerp.com') : 'branch.schoolerp.com'
      };
    });

    const sumStudents = mappedBranches.reduce((s, b) => s + b.students, 0);
    const sumStaff = mappedBranches.reduce((s, b) => s + b.staff, 0);
    const sumCollected = mappedBranches.reduce((s, b) => s + b.collectedRaw, 0);

    const stats = {
      branchesCount: totalBranches,
      activeBranches,
      totalStudents: sumStudents > 0 ? sumStudents : studentCount,
      totalStaff: sumStaff > 0 ? sumStaff : staffCount,
      totalCollected: totalFee > 0 ? ('₹' + (totalFee / 100000).toFixed(2) + ' Lakhs') : '₹0',
      leadsCount,
      branches: mappedBranches,
      recentLeads,
      timestamp: new Date()
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};


