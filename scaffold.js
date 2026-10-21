const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const controllersDir = path.join(__dirname, 'controllers');
const routesDir = path.join(__dirname, 'routes');

const filesToCreate = [
  // ALUMNI MODULE
  {
    path: path.join(modelsDir, 'Alumni.js'),
    content: `const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  passoutYear: { type: Number, required: true },
  profession: { type: String },
  currentCompany: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('Alumni', alumniSchema);`
  },
  {
    path: path.join(modelsDir, 'AlumniEvent.js'),
    content: `const mongoose = require('mongoose');

const alumniEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' }],
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('AlumniEvent', alumniEventSchema);`
  },
  {
    path: path.join(controllersDir, 'alumniController.js'),
    content: `const Alumni = require('../models/Alumni');
const AlumniEvent = require('../models/AlumniEvent');

exports.registerAlumni = async (req, res) => {
  try {
    const alumni = new Alumni(req.body);
    await alumni.save();
    res.status(201).json({ success: true, data: alumni });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.getAlumniList = async (req, res) => {
  try {
    const alumni = await Alumni.find();
    res.status(200).json({ success: true, data: alumni });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.createEvent = async (req, res) => {
  try {
    const event = new AlumniEvent(req.body);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};`
  },
  {
    path: path.join(routesDir, 'alumniRoutes.js'),
    content: `const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

router.post('/register', alumniController.registerAlumni);
router.get('/list', alumniController.getAlumniList);
router.post('/events', alumniController.createEvent);

module.exports = router;`
  },

  // INVENTORY MODULE
  {
    path: path.join(modelsDir, 'Vendor.js'),
    content: `const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);`
  },
  {
    path: path.join(modelsDir, 'InventoryItem.js'),
    content: `const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  totalStock: { type: Number, default: 0 },
  unitPrice: { type: Number },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);`
  },
  {
    path: path.join(modelsDir, 'InventoryIssue.js'),
    content: `const mongoose = require('mongoose');

const inventoryIssueSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  issuedToMode: { type: String, enum: ['Student', 'Staff'], required: true },
  issuedToId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Ref to Student or Staff
  quantity: { type: Number, required: true },
  issueDate: { type: Date, default: Date.now },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = mongoose.model('InventoryIssue', inventoryIssueSchema);`
  },
  {
    path: path.join(controllersDir, 'inventoryController.js'),
    content: `const Vendor = require('../models/Vendor');
const InventoryItem = require('../models/InventoryItem');
const InventoryIssue = require('../models/InventoryIssue');

exports.addVendor = async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json({ success: true, data: vendor });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.addItem = async (req, res) => {
  try {
    const item = new InventoryItem(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.issueItem = async (req, res) => {
  try {
    const issue = new InventoryIssue(req.body);
    
    // Decrease stock
    const item = await InventoryItem.findById(req.body.item);
    if(item.totalStock >= req.body.quantity) {
       item.totalStock -= req.body.quantity;
       await item.save();
       await issue.save();
       res.status(201).json({ success: true, data: issue });
    } else {
       res.status(400).json({ success: false, message: 'Not enough stock!' });
    }
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};`
  },
  {
    path: path.join(routesDir, 'inventoryRoutes.js'),
    content: `const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/vendors', inventoryController.addVendor);
router.post('/items', inventoryController.addItem);
router.post('/issue', inventoryController.issueItem);

module.exports = router;`
  },

  // TENANT MODULE (SaaS)
  {
    path: path.join(modelsDir, 'Tenant.js'),
    content: `const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subdomain: { type: String, unique: true },
  plan: { type: String, enum: ['Trial', 'Growth', 'Enterprise'], default: 'Trial' },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  validUntil: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);`
  },
  {
    path: path.join(controllersDir, 'tenantController.js'),
    content: `const Tenant = require('../models/Tenant');

exports.registerTenant = async (req, res) => {
  try {
    const tenant = new Tenant(req.body);
    await tenant.save();
    res.status(201).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json({ success: true, data: tenants });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.suspendTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: 'Suspended' }, { new: true });
    res.status(200).json({ success: true, data: tenant });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};`
  },
  {
    path: path.join(routesDir, 'tenantRoutes.js'),
    content: `const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

router.post('/register', tenantController.registerTenant);
router.get('/list', tenantController.getTenants);
router.put('/:id/suspend', tenantController.suspendTenant);

module.exports = router;`
  },

  // WEBHOOK AND COMMUNICATION MODULE
  {
    path: path.join(controllersDir, 'webhookController.js'),
    content: `const crypto = require('crypto');

exports.razorpayWebhook = async (req, res) => {
  try {
    // Basic verification Logic for Razorpay
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'secret';
    // Validate signature...
    // Update DB fees...
    console.log("Razorpay Webhook Triggered:", req.body);
    res.status(200).send('OK');
  } catch (error) { res.status(400).send(error.message); }
};`
  },
  {
    path: path.join(routesDir, 'webhookRoutes.js'),
    content: `const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/razorpay', webhookController.razorpayWebhook);

module.exports = router;`
  },
  
  // CRON SETUP
  {
    path: path.join(__dirname, 'cronJobs.js'),
    content: `// Placeholder for cron tasks, to be integrated into app.js
const schedule = require('node-schedule');

// Run everyday at midnight (0 0 * * *)
schedule.scheduleJob('0 0 * * *', function(){
  console.log('Cron Job: Checking due fees and applying late fines...');
  // Logic to apply fines goes here
});

console.log("Cron Jobs Scheduled Successfully!");`
  }
];

filesToCreate.forEach(file => {
  fs.writeFileSync(file.path, file.content);
  console.log('Created: ' + file.path.replace(__dirname, ''));
});

console.log("--- ALL FILES GENERATED SUCCESSFULLY ---");
