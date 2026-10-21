const CommsWallet = require('../models/CommsWallet');

// Helper to get or initialize the single institution wallet
async function getOrCreateWallet() {
  let wallet = await CommsWallet.findOne();
  if (!wallet) {
    wallet = await CommsWallet.create({
      schoolName: 'Greenwood International School',
      balance: 54550.00,
      totalRecharged: 54550.00,
      spent30Days: 1420.00,
      messagesSent: 1890,
      rates: {
        whatsapp: 0.78,
        smsTransactional: 0.22,
        smsPromotional: 0.18,
        voiceCall: 0.45
      },
      settings: {
        lowBalanceAlert: true,
        alertThreshold: 500,
        alertEmail: 'admin@greenwood.edu',
        alertPhone: '+91 98765 43210',
        autoRecharge: false,
        autoRechargeAmount: 5000
      },
      transactions: [
        {
          transactionId: 'TXN-CW-9912-101',
          orderId: '#order_CW8912aa',
          type: 'Credit',
          channel: 'Top-up',
          amount: 50000,
          balanceAfter: 54550,
          paymentMethod: 'Razorpay',
          status: 'Success',
          notes: 'Annual broadcast credits bulk top-up via Corporate NetBanking',
          date: '12 Oct, 2026 08:14 PM'
        },
        {
          transactionId: 'TXN-CW-8812-202',
          orderId: '#order_CW7733bb',
          type: 'Debit',
          channel: 'WhatsApp Broadcast',
          amount: 780,
          balanceAfter: 4550,
          paymentMethod: 'Automated Usage',
          status: 'Success',
          recipientCount: 1000,
          notes: 'Diwali Festival Greetings broadcast dispatched to 1,000 parents',
          date: '10 Oct, 2026 10:30 AM'
        },
        {
          transactionId: 'TXN-CW-7721-303',
          orderId: '#order_CW6644cc',
          type: 'Credit',
          channel: 'Top-up',
          amount: 2500,
          balanceAfter: 5330,
          paymentMethod: 'UPI Instant',
          status: 'Success',
          notes: 'Top-up via UPI QR (admin@icici)',
          date: '05 Oct, 2026 03:15 PM'
        },
        {
          transactionId: 'TXN-CW-6611-404',
          orderId: '#order_CW5522dd',
          type: 'Debit',
          channel: 'DLT SMS',
          amount: 640,
          balanceAfter: 2830,
          paymentMethod: 'Automated Usage',
          status: 'Success',
          recipientCount: 2909,
          notes: 'Quarterly Term 2 Fee Dues Reminder SMS campaign',
          date: '01 Oct, 2026 09:00 AM'
        },
        {
          transactionId: 'TXN-CW-5501-505',
          orderId: '#order_CW4411ee',
          type: 'Credit',
          channel: 'Top-up',
          amount: 1000,
          balanceAfter: 3470,
          paymentMethod: 'Razorpay',
          status: 'Success',
          notes: 'Trial wallet activation top-up',
          date: '15 Sep, 2026 11:20 AM'
        }
      ]
    });
  }
  return wallet;
}

// 1. GET Wallet Summary & Rates
exports.getWalletSummary = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet();

    const availableWhatsapp = Math.floor(wallet.balance / (wallet.rates.whatsapp || 0.78));
    const availableSms = Math.floor(wallet.balance / (wallet.rates.smsTransactional || 0.22));

    res.status(200).json({
      success: true,
      data: {
        schoolName: wallet.schoolName,
        balance: wallet.balance,
        totalRecharged: wallet.totalRecharged,
        spent30Days: wallet.spent30Days,
        messagesSent: wallet.messagesSent,
        rates: wallet.rates,
        settings: wallet.settings,
        quotas: {
          availableWhatsapp,
          availableSms
        },
        totalTransactions: wallet.transactions.length
      }
    });
  } catch (error) {
    console.error('Error in getWalletSummary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET Wallet Transactions (with search & filter)
exports.getTransactions = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet();
    const { type, channel, search, limit = 50 } = req.query;

    let txs = [...wallet.transactions];

    // Filter by type
    if (type && type !== 'All') {
      txs = txs.filter(t => t.type.toLowerCase() === type.toLowerCase());
    }

    // Filter by channel
    if (channel && channel !== 'All') {
      txs = txs.filter(t => t.channel.toLowerCase() === channel.toLowerCase());
    }

    // Filter by search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      txs = txs.filter(t => 
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.orderId && t.orderId.toLowerCase().includes(q)) ||
        (t.transactionId && t.transactionId.toLowerCase().includes(q)) ||
        (t.channel && t.channel.toLowerCase().includes(q))
      );
    }

    // Sort descending by creation
    txs.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    res.status(200).json({
      success: true,
      count: txs.length,
      data: txs.slice(0, Number(limit))
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST Top-Up Wallet (Recharge)
exports.topupWallet = async (req, res) => {
  try {
    const { amount, paymentMethod = 'Razorpay', notes } = req.body;
    const rechargeAmount = parseFloat(amount);

    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid recharge amount greater than 0.' });
    }

    const wallet = await getOrCreateWallet();

    const newBalance = Number((wallet.balance + rechargeAmount).toFixed(2));
    const newTotalRecharged = Number((wallet.totalRecharged + rechargeAmount).toFixed(2));

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTx = {
      transactionId: `TXN-CW-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: `#order_${Math.random().toString(36).substring(2, 10)}`,
      type: 'Credit',
      channel: 'Top-up',
      amount: rechargeAmount,
      balanceAfter: newBalance,
      paymentMethod,
      status: 'Success',
      notes: notes || `Top-up via ${paymentMethod} (instant credit)`,
      date: dateFormatted
    };

    wallet.balance = newBalance;
    wallet.totalRecharged = newTotalRecharged;
    wallet.transactions.unshift(newTx);

    await wallet.save();

    res.status(200).json({
      success: true,
      message: `Successfully credited ₹${rechargeAmount.toLocaleString('en-IN')} to Communication Wallet.`,
      data: {
        newBalance,
        totalRecharged: newTotalRecharged,
        transaction: newTx
      }
    });
  } catch (error) {
    console.error('Error in topupWallet:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. PUT Update Settings
exports.updateSettings = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet();
    const { lowBalanceAlert, alertThreshold, alertEmail, alertPhone, autoRecharge, autoRechargeAmount } = req.body;

    if (lowBalanceAlert !== undefined) wallet.settings.lowBalanceAlert = lowBalanceAlert;
    if (alertThreshold !== undefined) wallet.settings.alertThreshold = Number(alertThreshold);
    if (alertEmail) wallet.settings.alertEmail = alertEmail;
    if (alertPhone) wallet.settings.alertPhone = alertPhone;
    if (autoRecharge !== undefined) wallet.settings.autoRecharge = autoRecharge;
    if (autoRechargeAmount !== undefined) wallet.settings.autoRechargeAmount = Number(autoRechargeAmount);

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Wallet threshold and notification preferences updated.',
      data: wallet.settings
    });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST Deduct Debit (Broadcast send usage)
exports.simulateDebit = async (req, res) => {
  try {
    const { channel = 'WhatsApp Broadcast', recipientCount = 100, customRate, notes } = req.body;
    const wallet = await getOrCreateWallet();

    const rate = customRate || (channel.includes('WhatsApp') ? wallet.rates.whatsapp : wallet.rates.smsTransactional);
    const debitAmount = Number((recipientCount * rate).toFixed(2));

    if (wallet.balance < debitAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance (₹${wallet.balance}) for ${recipientCount} messages (Cost: ₹${debitAmount}). Please recharge your wallet.`
      });
    }

    const newBalance = Number((wallet.balance - debitAmount).toFixed(2));
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTx = {
      transactionId: `TXN-CW-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: `#order_${Math.random().toString(36).substring(2, 10)}`,
      type: 'Debit',
      channel,
      amount: debitAmount,
      balanceAfter: newBalance,
      paymentMethod: 'Automated Usage',
      recipientCount,
      status: 'Success',
      notes: notes || `Broadcast dispatch to ${recipientCount} recipients`,
      date: dateFormatted
    };

    wallet.balance = newBalance;
    wallet.spent30Days = Number((wallet.spent30Days + debitAmount).toFixed(2));
    wallet.messagesSent += Number(recipientCount);
    wallet.transactions.unshift(newTx);

    await wallet.save();

    res.status(200).json({
      success: true,
      message: `Deducted ₹${debitAmount} for ${recipientCount} messages.`,
      data: {
        newBalance,
        spent30Days: wallet.spent30Days,
        messagesSent: wallet.messagesSent,
        transaction: newTx
      }
    });
  } catch (error) {
    console.error('Error in simulateDebit:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
