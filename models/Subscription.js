const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      default: 'Greenwood International School'
    },
    planId: {
      type: String,
      default: 'growth'
    },
    planName: {
      type: String,
      default: 'Growth Plan'
    },
    capacity: {
      type: String,
      default: 'Up to 5,000 students'
    },
    activeStudents: {
      type: Number,
      default: 280
    },
    status: {
      type: String,
      enum: ['Active', 'Trial', 'Expired', 'Cancelled'],
      default: 'Active'
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Yearly'],
      default: 'Yearly'
    },
    amount: {
      type: Number,
      default: 10000
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay'
    },
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const subscriptionInvoiceSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    plan: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    billingCycle: {
      type: String,
      default: 'Yearly'
    },
    method: {
      type: String,
      default: 'Razorpay'
    },
    transactionId: {
      type: String,
      default: () => 'TXN_' + Math.random().toString(36).substring(2, 12).toUpperCase()
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending Payment', 'Failed'],
      default: 'Paid'
    },
    date: {
      type: String,
      default: () => {
        const d = new Date();
        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}, ${d.getFullYear()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    },
    invoiceUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
const SubscriptionInvoice = mongoose.model('SubscriptionInvoice', subscriptionInvoiceSchema);

module.exports = {
  Subscription,
  SubscriptionInvoice
};
