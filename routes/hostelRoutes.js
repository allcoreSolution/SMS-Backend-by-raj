const express = require('express');
const router = express.Router();
const {
  getHostelDashboardStats,
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  getAllocations,
  allocateBed,
  deallocateBed,
  deleteAllocation
} = require('../controllers/hostelController');

// 1. Dashboard Stats
router.get('/stats', getHostelDashboardStats);

// 2. Room Types CRUD (Define before :id param routes)
router.get('/room-types', getRoomTypes);
router.post('/room-types', createRoomType);
router.put('/room-types/:id', updateRoomType);
router.delete('/room-types/:id', deleteRoomType);

// 3. Rooms CRUD
router.get('/rooms', getRooms);
router.post('/rooms', addRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// 4. Student Allocations
router.get('/allocations', getAllocations);
router.post('/allocate', allocateBed);
router.post('/deallocate', deallocateBed);
router.delete('/allocations/:id', deleteAllocation);

// 5. Hostel Buildings CRUD
router.get('/', getHostels);
router.post('/', createHostel);
router.put('/:id', updateHostel);
router.delete('/:id', deleteHostel);

module.exports = router;
