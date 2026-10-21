const express = require('express');
const router = express.Router();
const {
  getAssetDashboardStats,
  getAssets,
  getAssetById,
  addAsset,
  updateAsset,
  deleteAsset,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllocations,
  issueAsset,
  returnAsset,
  getMaintenances,
  addMaintenance,
  completeMaintenance,
  getDisposals,
  disposeAsset,
  getAudits,
  addAudit
} = require('../controllers/assetController');

// 1. Dashboard Stats
router.get('/stats', getAssetDashboardStats);

// 2. Categories CRUD
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// 3. Allocations / Assignments
router.get('/allocations', getAllocations);
router.post('/issue', issueAsset);
router.post('/return', returnAsset);

// 4. Maintenance Logs
router.get('/maintenances', getMaintenances);
router.post('/maintenances', addMaintenance);
router.put('/maintenances/:id/complete', completeMaintenance);

// 5. Disposals
router.get('/disposals', getDisposals);
router.post('/disposals', disposeAsset);

// 6. Audits
router.get('/audits', getAudits);
router.post('/audits', addAudit);

// 7. Assets Register CRUD
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', addAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
