const Tenant = require('../models/Tenant');

const tenantAuth = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'];
    
    // For superadmin routes, bypass this.
    // Assuming superadmin routes will not provide x-tenant-id, or we verify it differently.
    
    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(403).json({ success: false, message: 'Invalid Tenant / School ID provided.' });
      }
      if (tenant.status !== 'Active') {
        return res.status(403).json({ success: false, message: 'This School account is currently Suspended or Inactive. Please contact Support.' });
      }
      
      req.schoolId = tenantId; // Now available to all controllers!
    } else {
      // If we STRICTLY enforce SaaS:
      // return res.status(400).json({ success: false, message: 'Missing x-tenant-id (School ID) in request headers.' });
      
      // Kept optional for backward compatibility during development
      req.schoolId = null;
    }

    next();
  } catch (error) {
    console.error("Tenant Auth Error: ", error);
    res.status(500).json({ success: false, message: 'Failed to authorize tenant/school.' });
  }
};

module.exports = tenantAuth;
