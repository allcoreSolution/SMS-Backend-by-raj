const {
  AssetCategory,
  Asset,
  AssetAllocation,
  AssetMaintenance,
  AssetDisposal,
  AssetAudit
} = require('../models/Asset');
const Staff = require('../models/Staff');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
exports.getAssetDashboardStats = async (req, res, next) => {
  try {
    const [assets, categories, allocations, maintenances, disposals, audits] = await Promise.all([
      Asset.find(),
      AssetCategory.find({ status: 'Active' }),
      AssetAllocation.find({ status: 'Issued' }),
      AssetMaintenance.find(),
      AssetDisposal.find(),
      AssetAudit.find().sort({ auditDate: -1 }).limit(3)
    ]);

    const nonDisposedAssets = assets.filter(a => a.status !== 'Disposed');
    const totalAssets = nonDisposedAssets.length;

    let totalOriginalCost = 0;
    let totalCurrentValue = 0;
    const categoryMap = {};

    nonDisposedAssets.forEach(a => {
      const c = Number(a.cost || 0);
      const v = Number(a.currentValue || a.cost || 0);
      totalOriginalCost += c;
      totalCurrentValue += v;

      const catName = a.category || 'General';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { count: 0, cost: 0, value: 0 };
      }
      categoryMap[catName].count += 1;
      categoryMap[catName].cost += c;
      categoryMap[catName].value += v;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(k => ({
      name: k,
      count: categoryMap[k].count,
      cost: categoryMap[k].cost,
      value: categoryMap[k].value
    }));

    const statusCounts = {
      Active: assets.filter(a => a.status === 'Active').length,
      Assigned: assets.filter(a => a.status === 'Assigned').length,
      InMaintenance: assets.filter(a => a.status === 'In Maintenance').length,
      Disposed: assets.filter(a => a.status === 'Disposed').length,
    };

    const recentMaintenances = maintenances.slice(-5).reverse();
    const recentAllocations = allocations.slice(-5).reverse();
    const recentAssets = assets.slice(-5).reverse();

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        totalOriginalCost,
        totalCurrentValue,
        totalDepreciation: Math.max(0, totalOriginalCost - totalCurrentValue),
        assignedAssetsCount: allocations.length,
        inMaintenanceCount: statusCounts.InMaintenance,
        disposedCount: statusCounts.Disposed,
        categoryBreakdown,
        statusCounts,
        recentAssets,
        recentAllocations,
        recentMaintenances,
        recentAudits: audits
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. ASSETS REGISTER CRUD
// ==========================================
exports.getAssets = async (req, res, next) => {
  try {
    const { category, status, location, q } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (location && location !== 'All') query.location = location;

    if (q) {
      query.$or = [
        { assetName: { $regex: q, $options: 'i' } },
        { assetCode: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { modelNo: { $regex: q, $options: 'i' } },
        { serialNumber: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    next(error);
  }
};

exports.getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    // Also fetch allocations and maintenance history for this asset
    const [allocations, maintenances] = await Promise.all([
      AssetAllocation.find({ asset: asset._id }).sort({ issueDate: -1 }),
      AssetMaintenance.find({ asset: asset._id }).sort({ serviceDate: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...asset.toObject(),
        allocations,
        maintenances
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.addAsset = async (req, res, next) => {
  try {
    let {
      assetCode,
      assetName,
      category,
      brand,
      modelNo,
      serialNumber,
      purchaseDate,
      cost,
      currentValue,
      quantity,
      location,
      vendor,
      invoiceNo,
      warrantyExpiry,
      condition,
      notes
    } = req.body;

    // Generate assetCode if missing
    if (!assetCode) {
      const count = await Asset.countDocuments();
      assetCode = `AST-${1000 + count + 1}`;
    }

    const existing = await Asset.findOne({ assetCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Asset code ${assetCode} already exists.` });
    }

    // Default currentValue if not provided
    const numericCost = Number(cost) || 0;
    const numericCurrentVal = currentValue !== undefined ? Number(currentValue) : numericCost;

    const asset = await Asset.create({
      assetCode,
      assetName,
      category: category || 'General Equipment',
      brand: brand || '',
      modelNo: modelNo || '',
      serialNumber: serialNumber || '',
      purchaseDate: purchaseDate || new Date(),
      cost: numericCost,
      currentValue: numericCurrentVal,
      quantity: Number(quantity) || 1,
      available: Number(quantity) || 1,
      location: location || 'Main Campus',
      vendor: vendor || '',
      invoiceNo: invoiceNo || '',
      warrantyExpiry: warrantyExpiry || undefined,
      condition: condition || 'Good',
      status: 'Active',
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status === 'Assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete asset that is currently assigned to a staff member. Please deallocate/return it first.'
      });
    }

    await asset.deleteOne();
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. ASSET CATEGORIES CRUD
// ==========================================
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await AssetCategory.find().sort({ name: 1 });
    const assets = await Asset.find();

    const data = categories.map(cat => {
      const catAssets = assets.filter(a => a.category === cat.name);
      const totalCost = catAssets.reduce((sum, a) => sum + (a.cost || 0), 0);
      const totalValue = catAssets.reduce((sum, a) => sum + (a.currentValue || a.cost || 0), 0);

      return {
        ...cat.toObject(),
        assetCount: catAssets.length,
        totalCost,
        totalValue
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

exports.addCategory = async (req, res, next) => {
  try {
    const { name, code, depreciationMethod, usefulLifeYears, depreciationRate, description } = req.body;
    
    const existing = await AssetCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await AssetCategory.create({
      name,
      code: code || `CAT-${name.substring(0, 3).toUpperCase()}`,
      depreciationMethod: depreciationMethod || 'Straight Line',
      usefulLifeYears: Number(usefulLifeYears) || 5,
      depreciationRate: Number(depreciationRate) || 20,
      description: description || '',
      status: 'Active'
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await AssetCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const assetsCount = await Asset.countDocuments({ category: category.name });
    if (assetsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${assetsCount} asset(s) are registered under it.`
      });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. ASSET ALLOCATIONS & ASSIGNMENTS
// ==========================================
exports.getAllocations = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const allocations = await AssetAllocation.find(query).sort({ issueDate: -1 });
    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (error) {
    next(error);
  }
};

exports.issueAsset = async (req, res, next) => {
  try {
    const { assetId, staffId, staffName, department, role, expectedReturnDate, conditionOnIssue, remarks } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status === 'Assigned' || asset.available <= 0) {
      return res.status(400).json({ success: false, message: 'Asset is already assigned or unavailable.' });
    }

    // Try finding staff name if only staffId was sent
    let finalStaffName = staffName;
    let finalDept = department;
    if (staffId && !finalStaffName) {
      const staffMember = await Staff.findById(staffId);
      if (staffMember) {
        finalStaffName = `${staffMember.firstName} ${staffMember.lastName || ''}`.trim();
        finalDept = staffMember.department || department;
      }
    }

    const allocation = await AssetAllocation.create({
      asset: asset._id,
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      assignedTo: staffId || undefined,
      staffName: finalStaffName || 'Staff Member',
      department: finalDept || 'General',
      role: role || 'Staff',
      issueDate: new Date(),
      expectedReturnDate: expectedReturnDate || undefined,
      status: 'Issued',
      conditionOnIssue: conditionOnIssue || 'Good',
      remarks: remarks || ''
    });

    // Update asset status
    asset.status = 'Assigned';
    asset.available = 0;
    asset.allocatedTo = {
      staffId: staffId || undefined,
      staffName: finalStaffName || 'Staff Member',
      department: finalDept || 'General',
      allocationDate: new Date()
    };
    await asset.save();

    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.returnAsset = async (req, res, next) => {
  try {
    const { allocationId, conditionOnReturn, remarks } = req.body;

    const allocation = await AssetAllocation.findById(allocationId);
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation record not found' });

    allocation.status = 'Returned';
    allocation.returnDate = new Date();
    if (conditionOnReturn) allocation.conditionOnReturn = conditionOnReturn;
    if (remarks) allocation.remarks = remarks;
    await allocation.save();

    // Free up asset
    const asset = await Asset.findById(allocation.asset);
    if (asset) {
      asset.status = 'Active';
      asset.available = 1;
      asset.allocatedTo = undefined;
      if (conditionOnReturn) asset.condition = conditionOnReturn;
      await asset.save();
    }

    res.status(200).json({ success: true, message: 'Asset successfully returned', data: allocation });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. ASSET MAINTENANCE LOGS
// ==========================================
exports.getMaintenances = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;

    const maintenances = await AssetMaintenance.find(query).sort({ serviceDate: -1 });
    res.status(200).json({ success: true, count: maintenances.length, data: maintenances });
  } catch (error) {
    next(error);
  }
};

exports.addMaintenance = async (req, res, next) => {
  try {
    const { assetId, maintenanceType, serviceDate, cost, vendor, technician, issueDescription } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const maintenance = await AssetMaintenance.create({
      asset: asset._id,
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      maintenanceType: maintenanceType || 'Routine Service',
      serviceDate: serviceDate || new Date(),
      cost: Number(cost) || 0,
      vendor: vendor || '',
      technician: technician || '',
      issueDescription: issueDescription || 'Periodic maintenance service',
      status: 'In Progress'
    });

    asset.status = 'In Maintenance';
    await asset.save();

    res.status(201).json({ success: true, data: maintenance });
  } catch (error) {
    next(error);
  }
};

exports.completeMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const maintenance = await AssetMaintenance.findById(id);
    if (!maintenance) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    maintenance.status = 'Completed';
    maintenance.completionDate = new Date();
    if (resolutionNotes) maintenance.resolutionNotes = resolutionNotes;
    await maintenance.save();

    const asset = await Asset.findById(maintenance.asset);
    if (asset && asset.status === 'In Maintenance') {
      asset.status = 'Active';
      await asset.save();
    }

    res.status(200).json({ success: true, message: 'Maintenance marked as completed', data: maintenance });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. ASSET DISPOSALS
// ==========================================
exports.getDisposals = async (req, res, next) => {
  try {
    const disposals = await AssetDisposal.find().sort({ disposalDate: -1 });
    res.status(200).json({ success: true, count: disposals.length, data: disposals });
  } catch (error) {
    next(error);
  }
};

exports.disposeAsset = async (req, res, next) => {
  try {
    const { assetId, disposalMethod, saleValue, reason, approvedBy } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const originalCost = Number(asset.cost || 0);
    const saleVal = Number(saleValue || 0);
    const lossOrGain = saleVal - originalCost;

    const disposal = await AssetDisposal.create({
      asset: asset._id,
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      disposalDate: new Date(),
      disposalMethod: disposalMethod || 'Scrapped',
      originalCost,
      saleValue: saleVal,
      lossOrGain,
      reason: reason || 'End of economic life',
      approvedBy: approvedBy || 'School Administrator'
    });

    asset.status = 'Disposed';
    asset.available = 0;
    asset.currentValue = 0;
    await asset.save();

    res.status(201).json({ success: true, data: disposal });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. ASSET PHYSICAL AUDITS
// ==========================================
exports.getAudits = async (req, res, next) => {
  try {
    const audits = await AssetAudit.find().sort({ auditDate: -1 });
    res.status(200).json({ success: true, count: audits.length, data: audits });
  } catch (error) {
    next(error);
  }
};

exports.addAudit = async (req, res, next) => {
  try {
    const { auditTitle, auditorName, location, totalAudited, verifiedCount, missingCount, damagedCount, remarks } = req.body;

    const audit = await AssetAudit.create({
      auditTitle: auditTitle || 'Annual Campus Asset Verification',
      auditDate: new Date(),
      auditorName: auditorName || 'Internal Audit Committee',
      location: location || 'All Campus Wings',
      totalAudited: Number(totalAudited) || 0,
      verifiedCount: Number(verifiedCount) || 0,
      missingCount: Number(missingCount) || 0,
      damagedCount: Number(damagedCount) || 0,
      remarks: remarks || '',
      status: 'Completed'
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    next(error);
  }
};
