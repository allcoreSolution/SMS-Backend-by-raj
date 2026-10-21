const mongoose = require('mongoose');

// Book Schema
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    trim: true,
    default: function() {
      return `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }
  },
  category: {
    type: String,
    default: 'General'
  },
  publisher: {
    type: String,
    default: 'NCERT / Educational Press'
  },
  edition: {
    type: String,
    default: 'Latest Edition'
  },
  publishedYear: {
    type: Number,
    default: 2024
  },
  quantity: {
    type: Number,
    default: 5
  },
  available: {
    type: Number,
    default: 5
  },
  shelfNumber: {
    type: String,
    default: 'Shelf A-1'
  },
  rackNumber: {
    type: String,
    default: 'Rack 04'
  },
  price: {
    type: Number,
    default: 450
  },
  coverUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
  },
  description: {
    type: String,
    default: ''
  },
  isDigital: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Book Category Schema
const bookCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  section: {
    type: String,
    default: 'Main Library Wing'
  }
}, { timestamps: true });

// Book Issue / Circulation Schema
const bookIssueSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  memberType: {
    type: String,
    enum: ['Student', 'Staff'],
    default: 'Student'
  },
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  staffIssuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  memberName: {
    type: String,
    required: true
  },
  memberId: {
    type: String,
    required: true
  },
  memberPhone: {
    type: String,
    default: ''
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true,
    default: function() {
      const d = new Date();
      d.setDate(d.getDate() + 14); // 14 days standard borrowing period
      return d;
    }
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Overdue', 'Lost'],
    default: 'Issued'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Book Request Schema
const bookRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: 'Unknown'
  },
  requestedBy: {
    type: String,
    required: true
  },
  requesterType: {
    type: String,
    enum: ['Student', 'Staff', 'Parent'],
    default: 'Student'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Procured', 'Rejected'],
    default: 'Pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
const BookCategory = mongoose.model('BookCategory', bookCategorySchema);
const BookIssue = mongoose.model('BookIssue', bookIssueSchema);
const BookRequest = mongoose.model('BookRequest', bookRequestSchema);

module.exports = {
  Book,
  BookCategory,
  BookIssue,
  BookRequest
};
