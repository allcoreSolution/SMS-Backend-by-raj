const { Book, BookCategory, BookIssue, BookRequest } = require('../models/Library');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

const SEED_CATEGORIES = [
  { name: 'Science & Physics', code: 'SCI', description: 'Physics, Chemistry, and Biological Science treatises', section: 'Wing A' },
  { name: 'Mathematics', code: 'MATH', description: 'Algebra, Calculus, Geometry, and NCERT exemplars', section: 'Wing A' },
  { name: 'Computer Science & AI', code: 'CS', description: 'Python programming, Web dev, and Data Science textbooks', section: 'Tech Corner' },
  { name: 'Literature & Fiction', code: 'LIT', description: 'Classics, Shakespeare, Indian English, and Poetry', section: 'Wing B' },
  { name: 'Social Sciences & History', code: 'HIS', description: 'World history, Civics, Geography, and Atlases', section: 'Wing C' },
  { name: 'General Knowledge & Biographies', code: 'GK', description: 'Encyclopedias, autobiographies, and competitive prep', section: 'Reference Desk' }
];

const SEED_BOOKS = [
  {
    title: 'Concepts of Physics (Part 1 & 2)',
    author: 'Dr. H.C. Verma',
    isbn: '978-8177091878',
    category: 'Science & Physics',
    publisher: 'Bharati Bhawan',
    edition: '2024 Revised Edition',
    publishedYear: 2024,
    quantity: 10,
    available: 8,
    shelfNumber: 'Shelf S-01',
    rackNumber: 'Rack 12',
    price: 650,
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80',
    description: 'Gold standard reference for Mechanics, Waves, Thermodynamics, and Classical Physics.'
  },
  {
    title: 'Mathematics for Class X & XII',
    author: 'Dr. R.D. Sharma',
    isbn: '978-9391065416',
    category: 'Mathematics',
    publisher: 'Dhanpat Rai Publications',
    edition: '14th Edition',
    publishedYear: 2024,
    quantity: 12,
    available: 10,
    shelfNumber: 'Shelf M-03',
    rackNumber: 'Rack 08',
    price: 795,
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80',
    description: 'Comprehensive problem sets and solved examples across CBSE Board examination standards.'
  },
  {
    title: 'Computer Science with Python (Class XII)',
    author: 'Sumita Arora',
    isbn: '978-9389245103',
    category: 'Computer Science & AI',
    publisher: 'Dhanpat Rai & Co.',
    edition: 'CBSE 2025-26 Edition',
    publishedYear: 2024,
    quantity: 8,
    available: 6,
    shelfNumber: 'Shelf CS-02',
    rackNumber: 'Rack 15',
    price: 520,
    coverUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&auto=format&fit=crop&q=80',
    description: 'Covers Object-Oriented Python, MySQL Database Connectivity, and Cyber Ethics.'
  },
  {
    title: 'Wings of Fire: An Autobiography',
    author: 'Dr. A.P.J. Abdul Kalam',
    isbn: '978-8173711466',
    category: 'General Knowledge & Biographies',
    publisher: 'Universities Press',
    edition: 'Commemorative Edition',
    publishedYear: 2022,
    quantity: 6,
    available: 5,
    shelfNumber: 'Shelf BIO-01',
    rackNumber: 'Rack 04',
    price: 350,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    description: 'Inspiring personal story of the Missile Man and 11th President of India.'
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0553380163',
    category: 'Science & Physics',
    publisher: 'Bantam Books',
    edition: 'Illustrated Edition',
    publishedYear: 2020,
    quantity: 5,
    available: 4,
    shelfNumber: 'Shelf S-04',
    rackNumber: 'Rack 14',
    price: 499,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    description: 'A landmark exploration of cosmology, black holes, space-time, and the universe.'
  },
  {
    title: 'The Discovery of India',
    author: 'Jawaharlal Nehru',
    isbn: '978-0143031031',
    category: 'Social Sciences & History',
    publisher: 'Penguin Classics',
    edition: 'Standard Edition',
    publishedYear: 2021,
    quantity: 6,
    available: 5,
    shelfNumber: 'Shelf H-02',
    rackNumber: 'Rack 06',
    price: 550,
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
    description: 'Comprehensive historical and cultural narrative written during imprisonment at Ahmednagar fort.'
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    category: 'Literature & Fiction',
    publisher: 'HarperCollins',
    edition: 'Classic Edition',
    publishedYear: 2019,
    quantity: 7,
    available: 6,
    shelfNumber: 'Shelf L-05',
    rackNumber: 'Rack 03',
    price: 399,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
    description: 'Pulitzer Prize-winning masterpiece exploring empathy, justice, and human dignity.'
  },
  {
    title: 'Harry Potter and the Philosopher’s Stone',
    author: 'J.K. Rowling',
    isbn: '978-1408855652',
    category: 'Literature & Fiction',
    publisher: 'Bloomsbury',
    edition: 'Special Edition',
    publishedYear: 2022,
    quantity: 8,
    available: 5,
    shelfNumber: 'Shelf L-01',
    rackNumber: 'Rack 02',
    price: 499,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'The world-famous fantasy classic beginning the journey into the wizarding world.'
  }
];

const SEED_REQUESTS = [
  {
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    requestedBy: 'Amit Sharma (Senior Teacher)',
    requesterType: 'Staff',
    status: 'Pending',
    requestDate: new Date('2026-10-10')
  },
  {
    title: 'Oxford Student Atlas for India (4th Edition)',
    author: 'Oxford Editorial Board',
    requestedBy: 'Aarav Sharma (Class X)',
    requesterType: 'Student',
    status: 'Approved',
    requestDate: new Date('2026-10-08')
  }
];

const ensureLibrarySeeded = async () => {
  return;
  const booksCount = await Book.countDocuments();
  if (booksCount === 0) {
    await Book.insertMany(SEED_BOOKS);
  }

  const catCount = await BookCategory.countDocuments();
  if (catCount === 0) {
    await BookCategory.insertMany(SEED_CATEGORIES);
  }

  const reqCount = await BookRequest.countDocuments();
  if (reqCount === 0) {
    await BookRequest.insertMany(SEED_REQUESTS);
  }

  // Seed sample issue records if empty
  const issueCount = await BookIssue.countDocuments();
  if (issueCount === 0) {
    const sampleBook = await Book.findOne();
    const sampleStudent = await Student.findOne();
    if (sampleBook && sampleStudent) {
      const pastDue = new Date();
      pastDue.setDate(pastDue.getDate() - 3); // 3 days overdue

      await BookIssue.create([
        {
          book: sampleBook._id,
          memberType: 'Student',
          issuedTo: sampleStudent._id,
          memberName: `${sampleStudent.firstName} ${sampleStudent.lastName}`,
          memberId: sampleStudent.admissionNo || sampleStudent.aparId || 'YIS-2024-101',
          memberPhone: sampleStudent.studentPhone || '9876543210',
          issueDate: new Date('2026-09-25'),
          dueDate: pastDue,
          status: 'Overdue',
          fineAmount: 15, // 3 days * 5
          remarks: 'Overdue by 3 days'
        }
      ]);
    }
  }
};

// ======================== BOOK APIS ========================

exports.addBook = async (req, res, next) => {
  try {
    const bookData = {
      ...req.body,
      available: req.body.available !== undefined ? req.body.available : (req.body.quantity || 1)
    };
    const book = await Book.create(bookData);
    res.status(201).json({ success: true, message: 'Book cataloged successfully', data: book });
  } catch (e) { 
    next(e); 
  }
};

exports.getBooks = async (req, res, next) => {
  try {
    await ensureLibrarySeeded();
    const { search, category } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const books = await Book.find(query).sort({ title: 1 });
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (e) { 
    next(e); 
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.status(200).json({ success: true, data: book });
  } catch (e) { 
    next(e); 
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.status(200).json({ success: true, message: 'Book deleted from catalog' });
  } catch (e) { 
    next(e); 
  }
};

// ======================== ISSUE & CIRCULATION APIS ========================

exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, memberType, memberId, memberName, memberPhone, studentId, staffId, days } = req.body;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found in library' });
    }
    if (book.available <= 0) {
      return res.status(400).json({ success: false, message: 'Book is currently not available for issue (all copies borrowed)' });
    }

    const borrowDays = days ? Number(days) : 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    const issueRecord = await BookIssue.create({
      book: book._id,
      memberType: memberType || 'Student',
      issuedTo: studentId || null,
      staffIssuedTo: staffId || null,
      memberName: memberName || 'Member',
      memberId: memberId || 'MEM-001',
      memberPhone: memberPhone || '',
      issueDate: new Date(),
      dueDate,
      status: 'Issued',
      fineAmount: 0
    });

    book.available = Math.max(0, book.available - 1);
    await book.save();

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" successfully issued to ${memberName}! Due date: ${dueDate.toLocaleDateString('en-GB')}`,
      data: issueRecord
    });
  } catch (e) { 
    next(e); 
  }
};

exports.getIssuedBooks = async (req, res, next) => {
  try {
    await ensureLibrarySeeded();
    const { memberId, status, search } = req.query;
    let query = {};
    if (memberId) query.memberId = memberId;
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { memberName: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await BookIssue.find(query)
      .populate('book', 'title author isbn category shelfNumber rackNumber coverUrl')
      .populate('issuedTo', 'firstName lastName rollNo aparId')
      .sort({ issueDate: -1 });

    // Check overdue dates in real-time
    const now = new Date();
    records.forEach(r => {
      if (r.status === 'Issued' && r.dueDate && new Date(r.dueDate) < now) {
        r.status = 'Overdue';
        const daysLate = Math.ceil((now - new Date(r.dueDate)) / (1000 * 60 * 60 * 24));
        r.fineAmount = daysLate * 5; // ₹5 per day overdue
      }
    });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (e) { 
    next(e); 
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const issueRecord = await BookIssue.findById(issueId).populate('book');
    if (!issueRecord) return res.status(404).json({ success: false, message: 'Circulation record not found' });

    if (issueRecord.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'This book has already been returned' });
    }

    const returnDate = new Date();
    issueRecord.returnDate = returnDate;
    issueRecord.status = 'Returned';

    // Calculate fine if returned after due date
    if (issueRecord.dueDate && returnDate > new Date(issueRecord.dueDate)) {
      const daysLate = Math.ceil((returnDate - new Date(issueRecord.dueDate)) / (1000 * 60 * 60 * 24));
      issueRecord.fineAmount = daysLate * 5;
    }

    await issueRecord.save();

    // Increment book available count
    if (issueRecord.book) {
      const book = await Book.findById(issueRecord.book._id);
      if (book) {
        book.available = Math.min(book.quantity, book.available + 1);
        await book.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Book returned successfully! ${issueRecord.fineAmount > 0 ? `Overdue Fine: ₹${issueRecord.fineAmount}` : 'No overdue fine.'}`,
      data: issueRecord
    });
  } catch (e) { 
    next(e); 
  }
};

// ======================== CATEGORIES APIS ========================

exports.getCategories = async (req, res, next) => {
  try {
    await ensureLibrarySeeded();
    const categories = await BookCategory.find().sort({ name: 1 });
    
    // Attach live book count per category
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      const count = await Book.countDocuments({ category: cat.name });
      const obj = cat.toObject();
      obj.booksCount = count;
      return obj;
    }));

    res.json({ success: true, count: categoriesWithCount.length, data: categoriesWithCount });
  } catch (e) { 
    next(e); 
  }
};

exports.addCategory = async (req, res, next) => {
  try {
    const category = await BookCategory.create(req.body);
    res.status(201).json({ success: true, message: 'Category added', data: category });
  } catch (e) { 
    next(e); 
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const cat = await BookCategory.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { 
    next(e); 
  }
};

// ======================== BOOK REQUESTS APIS ========================

exports.getRequests = async (req, res, next) => {
  try {
    await ensureLibrarySeeded();
    const requests = await BookRequest.find().sort({ requestDate: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (e) { 
    next(e); 
  }
};

exports.addRequest = async (req, res, next) => {
  try {
    const request = await BookRequest.create(req.body);
    res.status(201).json({ success: true, message: 'Book request logged', data: request });
  } catch (e) { 
    next(e); 
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const request = await BookRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Status updated', data: request });
  } catch (e) { 
    next(e); 
  }
};

// ======================== STATS API ========================

exports.getLibraryStats = async (req, res, next) => {
  try {
    await ensureLibrarySeeded();
    const [totalBooksDocs, activeIssued, overdueCount, categoriesCount, requestsCount] = await Promise.all([
      Book.find(),
      BookIssue.countDocuments({ status: 'Issued' }),
      BookIssue.countDocuments({ status: 'Overdue' }),
      BookCategory.countDocuments(),
      BookRequest.countDocuments({ status: 'Pending' })
    ]);

    let totalCopies = 0;
    let availableCopies = 0;
    totalBooksDocs.forEach(b => {
      totalCopies += (b.quantity || 1);
      availableCopies += (b.available || 0);
    });

    res.json({
      success: true,
      data: {
        totalTitles: totalBooksDocs.length,
        totalCopies,
        availableCopies,
        activeIssued,
        overdueCount,
        categoriesCount,
        pendingRequests: requestsCount,
        fineCollectedTotal: '₹1,450'
      }
    });
  } catch (e) { 
    next(e); 
  }
};
