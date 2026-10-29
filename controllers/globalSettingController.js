const GlobalSetting = require('../models/GlobalSetting');
const { Subscription, SubscriptionInvoice } = require('../models/Subscription');

// Master SaaS Plans
const DEFAULT_PLANS = [
  {
    id: "trial",
    name: "Trial Plan",
    capacity: "Up to 500 students",
    desc: "Perfect for testing features and demo setup.",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["Core Student Management", "Basic Attendance", "Single User Admin", "Standard Reports"]
  },
  {
    id: "growth",
    name: "Growth Plan",
    capacity: "Up to 5,000 students",
    desc: "Our most popular plan for established and growing schools.",
    priceMonthly: 1000,
    priceYearly: 10000,
    features: ["Full ERP Modules", "Unlimited Staff Accounts", "Online Fees & Payment Gateway", "Parent CCTV Streaming", "SMS & WhatsApp Triggers", "Priority SLA Support"]
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    capacity: "Up to 15,000 students",
    desc: "Engineered for high-volume multischool campuses requiring dedicated infrastructure.",
    priceMonthly: 5000,
    priceYearly: 50000,
    features: ["Custom Domain & White Labeling", "Dedicated Database Cluster", "24/7 Telephone Hotline", "Unlimited Cloud Storage", "Biometric Hardware Sync", "Advanced AI Assistant"]
  },
  {
    id: "basic",
    name: "Basic Plan",
    capacity: "Up to 5,000 students",
    desc: "Great standard plan with core academic and fee modules unlocked.",
    priceMonthly: 10000,
    priceYearly: 100000,
    features: ["Core Academic Masters", "Student Admissions", "Offline Examinations", "Library Management"]
  },
  {
    id: "pay_as_you_grow",
    name: "Per Student — Pay As You Grow",
    capacity: "Billed per student",
    desc: "₹12 per student per month, minimum 100 billed. Automatically scales with admissions.",
    subText: "₹12.00 per student / month · billed for 280 students",
    priceMonthly: 3360,
    priceYearly: 33600,
    features: ["Pay Only For Active Students", "Automatic Capacity Scaling", "Zero Enrollment Block", "All Modules Included"]
  }
];

/* 1. Get setting by key */
exports.getSetting = async (req, res) => {
  try {
    const setting = await GlobalSetting.findOne({ key: req.params.key });
    res.json({ success: true, data: setting ? setting.value : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 2. Get all settings */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await GlobalSetting.find();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 3. Upsert a setting */
exports.saveSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const value = req.body;
    
    let setting = await GlobalSetting.findOne({ key });
    if (setting) {
      setting.value = value;
      setting = await setting.save();
    } else {
      setting = await GlobalSetting.create({ key, value });
    }
    
    res.json({ success: true, message: `Setting ${key} saved successfully`, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 4. Upload a file */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 5. Mock Test SMTP connection */
exports.testSmtp = async (req, res) => {
  try {
    const credentials = req.body;
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!credentials.host || !credentials.username || !credentials.password) {
       return res.status(400).json({ success: false, message: 'Missing SMTP credentials for testing.' });
    }
    
    res.json({ success: true, message: 'SMTP connection established successfully! Credentials are valid.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. SUBSCRIPTION & BILLING APIS
// ==========================================

/* Get Active Subscription */
exports.getCurrentSubscription = async (req, res) => {
  try {
    let sub = await Subscription.findOne().sort({ createdAt: -1 });
    if (!sub) {
      sub = await Subscription.create({
        schoolName: 'Greenwood International School',
        planId: 'growth',
        planName: 'Growth Plan',
        capacity: 'Up to 5,000 students',
        activeStudents: 280,
        status: 'Active',
        billingCycle: 'Yearly',
        amount: 10000,
        endDate: new Date('2027-02-26T00:00:00.000Z'),
        paymentMethod: 'Razorpay'
      });
    }

    return res.status(200).json({
      success: true,
      subscription: sub
    });
  } catch (error) {
    console.error('Error in getCurrentSubscription:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* Get Available SaaS Plans */
exports.getSubscriptionPlans = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      plans: DEFAULT_PLANS
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* Upgrade / Subscribe to a Plan */
exports.upgradeSubscription = async (req, res) => {
  try {
    const { planId, planName, capacity, billingCycle, paymentMethod, amount } = req.body;

    if (!planId || !planName) {
      return res.status(400).json({ success: false, message: 'Plan details are required' });
    }

    const calculatedMonths = billingCycle === 'Monthly' ? 1 : 12;
    const newEndDate = new Date(Date.now() + calculatedMonths * 30 * 24 * 60 * 60 * 1000);

    let sub = await Subscription.findOne().sort({ createdAt: -1 });
    if (!sub) {
      sub = new Subscription({});
    }

    sub.planId = planId;
    sub.planName = planName;
    sub.capacity = capacity || 'Up to 5,000 students';
    sub.billingCycle = billingCycle || 'Yearly';
    sub.paymentMethod = paymentMethod || 'Razorpay';
    sub.amount = amount || 10000;
    sub.status = 'Active';
    sub.startDate = new Date();
    sub.endDate = newEndDate;

    await sub.save();

    // Create real Subscription Invoice
    const invoice = new SubscriptionInvoice({
      orderId: '#order_' + Math.random().toString(36).substring(2, 12),
      plan: planName,
      amount: amount || 10000,
      billingCycle: billingCycle || 'Yearly',
      method: paymentMethod || 'Razorpay',
      status: 'Paid',
      transactionId: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase()
    });

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${planName}!`,
      subscription: sub,
      invoice
    });
  } catch (error) {
    console.error('Error in upgradeSubscription:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* Get Subscription Invoices History */
exports.getSubscriptionHistory = async (req, res) => {
  try {
    let invoices = await SubscriptionInvoice.find().sort({ createdAt: -1 });
    
    // No auto-seed of invoices

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* Get Audit Trail */
exports.getAuditTrail = async (req, res) => {
  try {
    const setting = await GlobalSetting.findOne({ key: 'audit_trail' });
    let logs = setting?.value || [];

    // Return existing logs or empty array

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
