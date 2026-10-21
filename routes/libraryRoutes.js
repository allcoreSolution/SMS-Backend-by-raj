const express = require('express');
const router = express.Router();
const { 
  addBook, 
  getBooks, 
  updateBook, 
  deleteBook, 
  issueBook, 
  getIssuedBooks, 
  returnBook,
  getCategories,
  addCategory,
  deleteCategory,
  getRequests,
  addRequest,
  updateRequestStatus,
  getLibraryStats
} = require('../controllers/libraryController');

// Books CRUD
router.post('/books', addBook);
router.get('/books', getBooks);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Issue & Return Circulation
router.post('/issue', issueBook);
router.get('/issue', getIssuedBooks);
router.get('/issues', getIssuedBooks); // Alias for service compatibility
router.put('/return/:issueId', returnBook);

// Categories
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);

// Requests
router.get('/requests', getRequests);
router.post('/requests', addRequest);
router.put('/requests/:id', updateRequestStatus);

// Statistics
router.get('/stats', getLibraryStats);

module.exports = router;
