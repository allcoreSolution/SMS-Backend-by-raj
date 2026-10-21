const { Hostel, RoomType, HostelRoom, HostelAllocation } = require('../models/Hostel');
const Student = require('../models/Student');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
exports.getHostelDashboardStats = async (req, res, next) => {
  try {
    const [hostels, rooms, allocations] = await Promise.all([
      Hostel.find({ status: 'Active' }),
      HostelRoom.find().populate('allocatedStudents', 'firstName lastName admissionNo rollNo'),
      HostelAllocation.find({ status: 'Allocated' }).sort({ createdAt: -1 }).limit(10)
    ]);

    const totalHostels = hostels.length;
    const totalRooms = rooms.length;
    
    let totalCapacity = 0;
    let occupiedBeds = 0;

    rooms.forEach(room => {
      totalCapacity += (room.bedCapacity || 0);
      occupiedBeds += (room.allocatedStudents ? room.allocatedStudents.length : 0);
    });

    const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

    // Occupancy by Hostel for Recharts BarChart
    const hostelOccupancy = hostels.map(h => {
      const hostelRooms = rooms.filter(r => r.hostelName === h.hostelName || (r.hostel && r.hostel.toString() === h._id.toString()));
      const cap = hostelRooms.reduce((acc, r) => acc + (r.bedCapacity || 0), 0);
      const occ = hostelRooms.reduce((acc, r) => acc + (r.allocatedStudents ? r.allocatedStudents.length : 0), 0);
      return {
        name: h.hostelName,
        type: h.type,
        totalRooms: hostelRooms.length,
        capacity: cap,
        occupied: occ,
        available: Math.max(0, cap - occ),
        occupancyRate: cap > 0 ? Math.round((occ / cap) * 100) : 0
      };
    });

    // Room Type Distribution for PieChart
    const roomTypeMap = {};
    rooms.forEach(r => {
      const type = r.roomTypeName || 'Standard';
      roomTypeMap[type] = (roomTypeMap[type] || 0) + 1;
    });
    const roomTypeDistribution = Object.keys(roomTypeMap).map(key => ({
      name: key,
      value: roomTypeMap[key]
    }));

    res.status(200).json({
      success: true,
      data: {
        totalHostels,
        totalRooms,
        totalCapacity,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        hostelOccupancy,
        roomTypeDistribution,
        recentAllocations: allocations
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. HOSTEL BUILDINGS CRUD
// ==========================================
exports.getHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    const rooms = await HostelRoom.find();

    const data = hostels.map(h => {
      const hostelRooms = rooms.filter(r => r.hostelName === h.hostelName || (r.hostel && r.hostel.toString() === h._id.toString()));
      const capacity = hostelRooms.reduce((acc, r) => acc + (r.bedCapacity || 0), 0);
      const occupied = hostelRooms.reduce((acc, r) => acc + (r.allocatedStudents ? r.allocatedStudents.length : 0), 0);
      return {
        ...h.toObject(),
        roomsCount: hostelRooms.length,
        totalCapacity: capacity,
        occupiedBeds: occupied,
        availableBeds: Math.max(0, capacity - occupied)
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

exports.createHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json({ success: true, data: hostel });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Hostel with this name already exists' });
    }
    next(error);
  }
};

exports.updateHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
    res.status(200).json({ success: true, data: hostel });
  } catch (error) {
    next(error);
  }
};

exports.deleteHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });

    const roomsCount = await HostelRoom.countDocuments({
      $or: [{ hostel: hostel._id }, { hostelName: hostel.hostelName }]
    });

    if (roomsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hostel: ${roomsCount} room(s) are currently attached to this hostel. Please remove them first.`
      });
    }

    await hostel.deleteOne();
    res.status(200).json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. ROOM TYPES CRUD
// ==========================================
exports.getRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await RoomType.find().sort({ createdAt: -1 });
    const rooms = await HostelRoom.find();

    const data = roomTypes.map(rt => {
      const associatedRooms = rooms.filter(r => r.roomTypeName === rt.roomType || (r.roomType && r.roomType.toString() === rt._id.toString()));
      return {
        ...rt.toObject(),
        roomsCount: associatedRooms.length
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

exports.createRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.create(req.body);
    res.status(201).json({ success: true, data: roomType });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Room type with this name already exists' });
    }
    next(error);
  }
};

exports.updateRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!roomType) return res.status(404).json({ success: false, message: 'Room type not found' });
    res.status(200).json({ success: true, data: roomType });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findById(req.params.id);
    if (!roomType) return res.status(404).json({ success: false, message: 'Room type not found' });

    const roomsCount = await HostelRoom.countDocuments({
      $or: [{ roomType: roomType._id }, { roomTypeName: roomType.roomType }]
    });

    if (roomsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room type: ${roomsCount} room(s) are assigned this room type.`
      });
    }

    await roomType.deleteOne();
    res.status(200).json({ success: true, message: 'Room type deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. HOSTEL ROOMS CRUD
// ==========================================
exports.getRooms = async (req, res, next) => {
  try {
    const { hostelName, roomType } = req.query;
    let query = {};
    if (hostelName && hostelName !== 'All') query.hostelName = hostelName;
    if (roomType && roomType !== 'All') query.roomTypeName = roomType;

    const rooms = await HostelRoom.find(query)
      .populate('allocatedStudents', 'firstName lastName admissionNo rollNo gender contactNumber')
      .sort({ roomNumber: 1 });

    const computedRooms = rooms.map(room => {
      const occ = room.allocatedStudents ? room.allocatedStudents.length : 0;
      let calculatedStatus = 'Available';
      if (occ >= room.bedCapacity) calculatedStatus = 'Full';
      else if (occ > 0) calculatedStatus = 'Partially Occupied';

      return {
        ...room.toObject(),
        occupiedCount: occ,
        availableCount: Math.max(0, room.bedCapacity - occ),
        computedStatus: calculatedStatus
      };
    });

    res.status(200).json({ success: true, count: computedRooms.length, data: computedRooms });
  } catch (error) {
    next(error);
  }
};

exports.addRoom = async (req, res, next) => {
  try {
    const { hostelName, roomNumber, roomTypeName, bedCapacity, costPerBed, description } = req.body;

    // Check if room with this number already exists in this hostel
    const existing = await HostelRoom.findOne({ hostelName, roomNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: `Room ${roomNumber} already exists in ${hostelName}` });
    }

    // Try finding hostel ref
    const hostelDoc = await Hostel.findOne({ hostelName });
    const roomTypeDoc = await RoomType.findOne({ roomType: roomTypeName });

    const room = await HostelRoom.create({
      hostel: hostelDoc ? hostelDoc._id : undefined,
      hostelName,
      roomNumber,
      roomType: roomTypeDoc ? roomTypeDoc._id : undefined,
      roomTypeName: roomTypeName || 'Standard Non-AC',
      bedCapacity: Number(bedCapacity) || 4,
      costPerBed: Number(costPerBed) || 3000,
      description: description || '',
      status: 'Available'
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    
    if (room.allocatedStudents && room.allocatedStudents.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete room with currently allocated students. Please deallocate students first.' 
      });
    }

    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. STUDENT ALLOCATIONS & DEALLOCATIONS
// ==========================================
exports.getAllocations = async (req, res, next) => {
  try {
    const { status, hostelName } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (hostelName && hostelName !== 'All') query.hostelName = hostelName;

    const allocations = await HostelAllocation.find(query)
      .populate('student', 'firstName lastName admissionNo rollNo class section gender contactNumber')
      .populate('room')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (error) {
    next(error);
  }
};

exports.allocateBed = async (req, res, next) => {
  try {
    const { roomId, studentId, bedNumber, monthlyFee, remarks } = req.body;

    if (!roomId || !studentId) {
      return res.status(400).json({ success: false, message: 'Room and Student are required' });
    }

    const room = await HostelRoom.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.allocatedStudents.length >= room.bedCapacity) {
      return res.status(400).json({ success: false, message: 'Room has reached its maximum bed capacity' });
    }

    // Check if student is already allocated anywhere
    const existingAllocation = await HostelAllocation.findOne({
      student: studentId,
      status: 'Allocated'
    });

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: `Student is already allocated to Room ${existingAllocation.roomNumber} in ${existingAllocation.hostelName}`
      });
    }

    // Fetch student details
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const studentName = `${student.firstName} ${student.lastName || ''}`.trim();

    // Add to room's allocatedStudents
    if (!room.allocatedStudents.includes(studentId)) {
      room.allocatedStudents.push(studentId);
      if (room.allocatedStudents.length >= room.bedCapacity) {
        room.status = 'Full';
      } else {
        room.status = 'Partially Occupied';
      }
      await room.save();
    }

    // Create allocation record
    const allocation = await HostelAllocation.create({
      student: studentId,
      studentName,
      admissionNo: student.admissionNo || student.aparId || '',
      className: student.class ? `${student.class} ${student.section || ''}`.trim() : 'Standard',
      room: room._id,
      roomNumber: room.roomNumber,
      hostel: room.hostel,
      hostelName: room.hostelName,
      bedNumber: bedNumber || `Bed ${room.allocatedStudents.length}`,
      monthlyFee: Number(monthlyFee) || room.costPerBed || 0,
      allocationDate: new Date(),
      status: 'Allocated',
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.deallocateBed = async (req, res, next) => {
  try {
    const { allocationId, roomId, studentId } = req.body;

    let allocation = null;
    if (allocationId) {
      allocation = await HostelAllocation.findById(allocationId);
    } else if (roomId && studentId) {
      allocation = await HostelAllocation.findOne({
        room: roomId,
        student: studentId,
        status: 'Allocated'
      });
    }

    if (!allocation) {
      // If no allocation record, fallback to removing student from room directly
      if (roomId && studentId) {
        const room = await HostelRoom.findById(roomId);
        if (room) {
          room.allocatedStudents = room.allocatedStudents.filter(id => id.toString() !== studentId.toString());
          room.status = room.allocatedStudents.length === 0 ? 'Available' : 'Partially Occupied';
          await room.save();
          return res.status(200).json({ success: true, message: 'Student removed from room' });
        }
      }
      return res.status(404).json({ success: false, message: 'Active allocation record not found' });
    }

    // Mark allocation as vacated
    allocation.status = 'Vacated';
    allocation.vacateDate = new Date();
    await allocation.save();

    // Update room
    const targetRoomId = allocation.room || roomId;
    const targetStudentId = allocation.student || studentId;

    if (targetRoomId) {
      const room = await HostelRoom.findById(targetRoomId);
      if (room) {
        room.allocatedStudents = room.allocatedStudents.filter(id => id.toString() !== targetStudentId.toString());
        if (room.allocatedStudents.length === 0) {
          room.status = 'Available';
        } else {
          room.status = 'Partially Occupied';
        }
        await room.save();
      }
    }

    res.status(200).json({ success: true, message: 'Student successfully deallocated / vacated', data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation record not found' });

    // If currently allocated, remove student from room
    if (allocation.status === 'Allocated') {
      const room = await HostelRoom.findById(allocation.room);
      if (room) {
        room.allocatedStudents = room.allocatedStudents.filter(id => id.toString() !== allocation.student.toString());
        room.status = room.allocatedStudents.length === 0 ? 'Available' : 'Partially Occupied';
        await room.save();
      }
    }

    await allocation.deleteOne();
    res.status(200).json({ success: true, message: 'Allocation record deleted' });
  } catch (error) {
    next(error);
  }
};
