const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const IncomeHead = require('./models/IncomeHead');
const ExpenseHead = require('./models/ExpenseHead');
const BankAccount = require('./models/BankAccount');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const User = require('./models/User');

const seedAccounts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Accounts Seeding...');

    let admin = await User.findOne({ email: 'admin123@gmail.com' });
    if (!admin) admin = await User.findOne();

    // 1. Seed Income Heads
    const incomeHeadsData = [
      { name: 'Government Aid & SSA Grants', description: 'Central and state government educational grants', status: 'Active' },
      { name: 'School Transportation Operations', description: 'Bus and van operational collections', status: 'Active' },
      { name: 'Alumni & Trustee Endowments', description: 'Voluntary donations and endowment funds', status: 'Active' },
      { name: 'Canteen & Cafeteria Franchise', description: 'Monthly lease and revenue sharing from canteen', status: 'Active' },
      { name: 'Annual Sports & Cultural Sponsorships', description: 'Corporate sponsorships for school events', status: 'Active' },
      { name: 'Uniform & Stationery Sales', description: 'Proceeds from school store supplies', status: 'Active' }
    ];

    const seededIncomeHeads = [];
    for (const data of incomeHeadsData) {
      let head = await IncomeHead.findOne({ name: data.name });
      if (!head) {
        head = await IncomeHead.create(data);
      }
      seededIncomeHeads.push(head);
    }
    console.log(`Seeded ${seededIncomeHeads.length} Income Heads.`);

    // 2. Seed Expense Heads
    const expenseHeadsData = [
      { name: 'Faculty & Staff Payroll', description: 'Monthly salaries, PF, and teacher allowances', status: 'Active' },
      { name: 'Campus & Civil Maintenance', description: 'Repairs, painting, plumbing, and electrical works', status: 'Active' },
      { name: 'Laboratory & Computer Hardware', description: 'Science lab consumables and computer lab upgrades', status: 'Active' },
      { name: 'Electricity, Water & Utilities', description: 'Municipal power bills, generator diesel, and water charges', status: 'Active' },
      { name: 'Library Books & Subscriptions', description: 'Journals, reference books, and e-learning licenses', status: 'Active' },
      { name: 'Printing, Stationery & Exams', description: 'Question papers, answer sheets, and report cards printing', status: 'Active' }
    ];

    const seededExpenseHeads = [];
    for (const data of expenseHeadsData) {
      let head = await ExpenseHead.findOne({ name: data.name });
      if (!head) {
        head = await ExpenseHead.create(data);
      }
      seededExpenseHeads.push(head);
    }
    console.log(`Seeded ${seededExpenseHeads.length} Expense Heads.`);

    // 3. Seed Bank Accounts
    const bankAccountsData = [
      {
        accountTitle: 'SBI School Operating Account',
        bankName: 'State Bank of India',
        branchName: 'Civil Lines, Raipur',
        accountNumber: '40992381293',
        ifscCode: 'SBIN0001234',
        accountType: 'Current',
        openingBalance: 1250000,
        currentBalance: 1250000,
        status: 'Active'
      },
      {
        accountTitle: 'HDFC Bank Fee Collection Escrow',
        bankName: 'HDFC Bank',
        branchName: 'Marine Drive Branch, Raipur',
        accountNumber: '501004812399',
        ifscCode: 'HDFC0001822',
        accountType: 'Current',
        openingBalance: 875000,
        currentBalance: 875000,
        status: 'Active'
      },
      {
        accountTitle: 'ICICI Campus Development Fund',
        bankName: 'ICICI Bank',
        branchName: 'Telibandha Branch, Raipur',
        accountNumber: '082305001122',
        ifscCode: 'ICIC0000823',
        accountType: 'Savings',
        openingBalance: 500000,
        currentBalance: 500000,
        status: 'Active'
      }
    ];

    const seededBankAccounts = [];
    for (const data of bankAccountsData) {
      let acc = await BankAccount.findOne({ accountNumber: data.accountNumber });
      if (!acc) {
        acc = await BankAccount.create(data);
      }
      seededBankAccounts.push(acc);
    }
    console.log(`Seeded ${seededBankAccounts.length} Bank Accounts.`);

    // 4. Seed Income Records (if none)
    const incomeCount = await Income.countDocuments();
    if (incomeCount === 0) {
      const sampleIncomes = [
        {
          name: 'Annual SSA State Infrastructure Grant',
          incomeHead: seededIncomeHeads[0]._id,
          amount: 250000,
          date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          invoiceNumber: 'INC-2026-001',
          paymentMode: 'Bank Transfer',
          bankAccount: seededBankAccounts[0]._id,
          description: 'Quarterly state grant for ICT lab & smart classrooms',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'Alumni Trust Gold Jubilee Endowment',
          incomeHead: seededIncomeHeads[2]._id,
          amount: 150000,
          date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
          invoiceNumber: 'INC-2026-002',
          paymentMode: 'Cheque',
          bankAccount: seededBankAccounts[2]._id,
          description: 'Donation for high school merit scholarships',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'School Canteen Monthly Lease & Utility Share',
          incomeHead: seededIncomeHeads[3]._id,
          amount: 35000,
          date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          invoiceNumber: 'INC-2026-003',
          paymentMode: 'UPI/Online',
          bankAccount: seededBankAccounts[1]._id,
          description: 'Monthly concessionaire fees for campus cafeteria',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'Inter-School Athletics Sports Meet Sponsorship',
          incomeHead: seededIncomeHeads[4]._id,
          amount: 50000,
          date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
          invoiceNumber: 'INC-2026-004',
          paymentMode: 'Bank Transfer',
          bankAccount: seededBankAccounts[0]._id,
          description: 'Corporate sponsorship by Decathlon Sports India',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'School Stationery & Diary Counter Collection',
          incomeHead: seededIncomeHeads[5]._id,
          amount: 28400,
          date: new Date(),
          invoiceNumber: 'INC-2026-005',
          paymentMode: 'Cash',
          bankAccount: seededBankAccounts[0]._id,
          description: 'Cash counter collection for syllabus booklets',
          recordedBy: admin ? admin._id : null
        }
      ];

      await Income.insertMany(sampleIncomes);
      console.log(`Seeded ${sampleIncomes.length} Income Transactions.`);
    }

    // 5. Seed Expense Records (if few)
    const expenseCount = await Expense.countDocuments();
    if (expenseCount < 5) {
      const sampleExpenses = [
        {
          name: 'State Electricity Board Monthly Power Bill',
          title: 'State Electricity Board Monthly Power Bill',
          expenseHead: seededExpenseHeads[3]._id,
          category: 'Electricity, Water & Utilities',
          amount: 42800,
          date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          invoiceNumber: 'EXP-2026-001',
          paymentMode: 'Bank Transfer',
          bankAccount: seededBankAccounts[0]._id,
          description: 'High-tension campus power bill for educational block',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'Science Lab Chemicals & Microscope Consumables',
          title: 'Science Lab Chemicals & Microscope Consumables',
          expenseHead: seededExpenseHeads[2]._id,
          category: 'Laboratory & Computer Hardware',
          amount: 27500,
          date: new Date(Date.now() - 7 * 24 * 3600 * 1000),
          invoiceNumber: 'EXP-2026-002',
          paymentMode: 'Cheque',
          bankAccount: seededBankAccounts[1]._id,
          description: 'Annual replenish for Biology and Chemistry senior labs',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'Annual Exam Question Papers & OMR Sheets Printing',
          title: 'Annual Exam Question Papers & OMR Sheets Printing',
          expenseHead: seededExpenseHeads[5]._id,
          category: 'Printing, Stationery & Exams',
          amount: 38200,
          date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          invoiceNumber: 'EXP-2026-003',
          paymentMode: 'Bank Transfer',
          bankAccount: seededBankAccounts[0]._id,
          description: 'Secure printing of final summative evaluation booklets',
          recordedBy: admin ? admin._id : null
        },
        {
          name: 'Solar Inverter Batteries & Campus Maintenance',
          title: 'Solar Inverter Batteries & Campus Maintenance',
          expenseHead: seededExpenseHeads[1]._id,
          category: 'Campus & Civil Maintenance',
          amount: 19600,
          date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
          invoiceNumber: 'EXP-2026-004',
          paymentMode: 'UPI/Online',
          bankAccount: seededBankAccounts[0]._id,
          description: 'Preventative battery servicing and water filter replacements',
          recordedBy: admin ? admin._id : null
        }
      ];

      await Expense.insertMany(sampleExpenses);
      console.log(`Seeded ${sampleExpenses.length} Expense Transactions.`);
    }

    console.log('✅ Accounts Seeding Finished Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedAccounts();
