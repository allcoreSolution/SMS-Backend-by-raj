const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');

/**
 * Escapes regex special characters in a string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolves any raw tenant identifier (MongoDB ObjectId, slug, subdomain, or school name)
 * to a verified Tenant document and its MongoDB ObjectId.
 * 
 * @param {string|mongoose.Types.ObjectId|Object} rawTenant - The input tenant identifier
 * @param {Object} [options]
 * @param {boolean} [options.requireActive=true] - If true, rejects suspended or inactive tenants
 * @returns {Promise<{ tenant: Object, tenantId: mongoose.Types.ObjectId } | null>}
 */
async function resolveTenant(rawTenant, options = { requireActive: true }) {
  if (!rawTenant) return null;

  // Extract ID if an object was passed (e.g. { _id: ... } or populated doc)
  let identifier = rawTenant;
  if (typeof rawTenant === 'object' && rawTenant !== null) {
    if (rawTenant._id) {
      identifier = rawTenant._id;
    } else if (rawTenant.id) {
      identifier = rawTenant.id;
    } else if (rawTenant.tenant) {
      identifier = rawTenant.tenant;
    }
  }

  const strIdentifier = String(identifier).trim();
  if (!strIdentifier || strIdentifier === 'null' || strIdentifier === 'undefined' || strIdentifier === '[object Object]') {
    return null;
  }

  let tenantDoc = null;

  // 1. Check if it's already a valid 24-character hexadecimal MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(strIdentifier) && /^[0-9a-fA-F]{24}$/.test(strIdentifier)) {
    try {
      tenantDoc = await Tenant.findById(strIdentifier);
    } catch (_) {
      tenantDoc = null;
    }
  }

  // 2. Direct match on subdomain or schoolName
  if (!tenantDoc) {
    tenantDoc = await Tenant.findOne({
      $or: [
        { subdomain: strIdentifier },
        { subdomain: strIdentifier.toLowerCase() },
        { schoolName: strIdentifier },
        { schoolName: new RegExp(`^${escapeRegex(strIdentifier)}$`, 'i') }
      ]
    });
  }

  // 3. Keyword / Slug matching for external identifiers like "tenant-allcore-01", "sch-demo-01", etc.
  if (!tenantDoc) {
    // Strip common prefixes (tenant-, sch-, school-, branch-) and suffixes (-01, _01, etc.)
    const cleaned = strIdentifier
      .replace(/^(tenant|sch|school|branch)[-_]?/i, '')
      .replace(/[-_]\d+$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();

    if (cleaned.length >= 2) {
      tenantDoc = await Tenant.findOne({
        $or: [
          { schoolName: new RegExp(escapeRegex(cleaned), 'i') },
          { email: new RegExp(escapeRegex(cleaned), 'i') },
          { subdomain: new RegExp(escapeRegex(cleaned), 'i') }
        ]
      });
    }

    // 4. Compact alphanumeric match (e.g. "allcore" matching "All core ")
    if (!tenantDoc && cleaned.length >= 2) {
      const compactTarget = cleaned.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (compactTarget.length >= 2) {
        const candidateTenants = await Tenant.find({});
        for (const candidate of candidateTenants) {
          const compactSchool = (candidate.schoolName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const compactSub = (candidate.subdomain || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const compactEmail = (candidate.email || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          if (
            compactSchool.includes(compactTarget) ||
            compactTarget.includes(compactSchool) ||
            compactSub.includes(compactTarget) ||
            compactEmail.includes(compactTarget)
          ) {
            tenantDoc = candidate;
            break;
          }
        }
      }
    }
  }

  if (!tenantDoc) {
    return null;
  }

  // Check status if required
  if (options.requireActive && tenantDoc.status && tenantDoc.status === 'Suspended') {
    return null;
  }

  return {
    tenant: tenantDoc,
    tenantId: tenantDoc._id
  };
}

/**
 * Safely compares two tenant references (ObjectIds, strings, or objects) for equality
 */
function isSameTenant(tenantA, tenantB) {
  if (!tenantA || !tenantB) return false;
  const idA = String(tenantA._id || tenantA.tenant || tenantA).trim();
  const idB = String(tenantB._id || tenantB.tenant || tenantB).trim();
  return idA === idB;
}

module.exports = {
  resolveTenant,
  isSameTenant
};

