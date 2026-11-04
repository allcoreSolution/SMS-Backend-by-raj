const Tenant = require('../models/Tenant');
const { resolveTenant } = require('../services/tenantResolver');

const tenantAuth = async (req, res, next) => {
  try {
    const rawTenantId = req.headers['x-tenant-id'];
    
    if (rawTenantId) {
      const resolved = await resolveTenant(rawTenantId);
      if (!resolved) {
        return res.status(403).json({ success: false, message: 'Invalid Tenant / School ID provided.' });
      }
      if (resolved.tenant.status && resolved.tenant.status !== 'Active') {
        return res.status(403).json({ success: false, message: 'This School account is currently Suspended or Inactive. Please contact Support.' });
      }
      
      req.schoolId = String(resolved.tenantId);
      req.tenantId = String(resolved.tenantId);
    } else {
      req.schoolId = null;
    }

    next();
  } catch (error) {
    console.error("Tenant Auth Error: ", error);
    res.status(500).json({ success: false, message: 'Failed to authorize tenant/school.' });
  }
};

module.exports = tenantAuth;
