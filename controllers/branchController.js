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
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
        const branch = await Branch.findById(req.params.id);
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

