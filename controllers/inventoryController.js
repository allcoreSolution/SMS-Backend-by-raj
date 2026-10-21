const Vendor = require('../models/Vendor');
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
};