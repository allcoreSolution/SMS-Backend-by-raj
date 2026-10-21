require('dotenv').config();
const mongoose = require('mongoose');
const { Hostel, RoomType, HostelRoom, HostelAllocation } = require('./models/Hostel');
const Student = require('./models/Student');

async function seedHostel() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Hostel Seeding...');

    // Clear existing hostel data
    await Hostel.deleteMany({});
    await RoomType.deleteMany({});
    await HostelRoom.deleteMany({});
    await HostelAllocation.deleteMany({});
    console.log('Cleared previous hostel records.');

    // 1. Seed Hostels
    const hostelsData = [
      {
        hostelName: 'Tagore Boys Hostel (Block A)',
        type: 'Boys',
        wardenName: 'Rajesh Sharma',
        wardenContact: '+91 98765 43210',
        address: 'North Campus, Wing 1, Green Valley Road',
        intakeCapacity: 60,
        description: 'Primary residential facility for senior secondary male students with recreational lounge and gym.',
        status: 'Active'
      },
      {
        hostelName: 'Sarojini Girls Hostel (Block B)',
        type: 'Girls',
        wardenName: 'Sunita Verma',
        wardenContact: '+91 98765 43211',
        address: 'South Campus, Wing 2, Near Botanical Garden',
        intakeCapacity: 60,
        description: 'Secure, modern residential facility for female students with 24/7 security and reading library.',
        status: 'Active'
      },
      {
        hostelName: 'Vivekananda Senior Wing',
        type: 'Combined',
        wardenName: 'Anil Kumar Deshmukh',
        wardenContact: '+91 98765 43212',
        address: 'East Wing, Academic Complex',
        intakeCapacity: 40,
        description: 'Co-educational honors block with separated wings and dedicated study rooms.',
        status: 'Active'
      },
      {
        hostelName: 'Aryabhata Science Hostel',
        type: 'Boys',
        wardenName: 'Dr. Manoj Tiwari',
        wardenContact: '+91 98765 43213',
        address: 'West Block, Near Sports Arena',
        intakeCapacity: 50,
        description: 'Dedicated residential wing for competitive exam aspirants with quiet study pods.',
        status: 'Active'
      }
    ];

    const createdHostels = await Hostel.insertMany(hostelsData);
    console.log(`Seeded ${createdHostels.length} hostels.`);

    // 2. Seed Room Types
    const roomTypesData = [
      {
        roomType: 'Deluxe AC (2-Bed)',
        costPerBed: 5500,
        description: 'Dual sharing room with split air conditioner, attached washroom, study desk and wardrobe.',
        status: 'Active'
      },
      {
        roomType: 'Standard AC (3-Bed)',
        costPerBed: 4200,
        description: 'Triple sharing with split AC, high-speed Wi-Fi, shared study table and individual lockers.',
        status: 'Active'
      },
      {
        roomType: 'Standard Non-AC (4-Bed)',
        costPerBed: 3000,
        description: 'Four-bed accommodation with ceiling fans, dedicated storage, and modern common washrooms.',
        status: 'Active'
      },
      {
        roomType: 'Economy Dormitory (6-Bed)',
        costPerBed: 2200,
        description: 'Spacious 6-bed dormitory with high ceiling, study nook and individual lockable cupboards.',
        status: 'Active'
      }
    ];

    const createdRoomTypes = await RoomType.insertMany(roomTypesData);
    console.log(`Seeded ${createdRoomTypes.length} room types.`);

    // Map helpers
    const tagoreHostel = createdHostels.find(h => h.hostelName.includes('Tagore'));
    const sarojiniHostel = createdHostels.find(h => h.hostelName.includes('Sarojini'));
    const vivekanandaHostel = createdHostels.find(h => h.hostelName.includes('Vivekananda'));
    const aryabhataHostel = createdHostels.find(h => h.hostelName.includes('Aryabhata'));

    const deluxeAC = createdRoomTypes.find(rt => rt.roomType.includes('Deluxe AC'));
    const standardAC = createdRoomTypes.find(rt => rt.roomType.includes('Standard AC'));
    const standardNonAC = createdRoomTypes.find(rt => rt.roomType.includes('Standard Non-AC'));
    const economyDorm = createdRoomTypes.find(rt => rt.roomType.includes('Economy'));

    // 3. Seed Rooms
    const roomsToCreate = [
      // Tagore Boys Hostel
      {
        hostel: tagoreHostel._id,
        hostelName: tagoreHostel.hostelName,
        roomNumber: '101',
        roomType: deluxeAC._id,
        roomTypeName: deluxeAC.roomType,
        bedCapacity: 2,
        costPerBed: deluxeAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Ground floor, garden view, dual sharing.'
      },
      {
        hostel: tagoreHostel._id,
        hostelName: tagoreHostel.hostelName,
        roomNumber: '102',
        roomType: standardAC._id,
        roomTypeName: standardAC.roomType,
        bedCapacity: 3,
        costPerBed: standardAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Ground floor, facing inner courtyard.'
      },
      {
        hostel: tagoreHostel._id,
        hostelName: tagoreHostel.hostelName,
        roomNumber: '103',
        roomType: standardNonAC._id,
        roomTypeName: standardNonAC.roomType,
        bedCapacity: 4,
        costPerBed: standardNonAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'First floor corner room, well-ventilated.'
      },
      {
        hostel: tagoreHostel._id,
        hostelName: tagoreHostel.hostelName,
        roomNumber: '104',
        roomType: economyDorm._id,
        roomTypeName: economyDorm.roomType,
        bedCapacity: 6,
        costPerBed: economyDorm.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'First floor spacious dormitory block.'
      },

      // Sarojini Girls Hostel
      {
        hostel: sarojiniHostel._id,
        hostelName: sarojiniHostel.hostelName,
        roomNumber: '201',
        roomType: deluxeAC._id,
        roomTypeName: deluxeAC.roomType,
        bedCapacity: 2,
        costPerBed: deluxeAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'First floor east facing, attached balcony.'
      },
      {
        hostel: sarojiniHostel._id,
        hostelName: sarojiniHostel.hostelName,
        roomNumber: '202',
        roomType: standardAC._id,
        roomTypeName: standardAC.roomType,
        bedCapacity: 3,
        costPerBed: standardAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Second floor, quiet wing.'
      },
      {
        hostel: sarojiniHostel._id,
        hostelName: sarojiniHostel.hostelName,
        roomNumber: '203',
        roomType: standardNonAC._id,
        roomTypeName: standardNonAC.roomType,
        bedCapacity: 4,
        costPerBed: standardNonAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Second floor, near common recreation room.'
      },

      // Vivekananda Senior Wing
      {
        hostel: vivekanandaHostel._id,
        hostelName: vivekanandaHostel.hostelName,
        roomNumber: '301',
        roomType: deluxeAC._id,
        roomTypeName: deluxeAC.roomType,
        bedCapacity: 2,
        costPerBed: deluxeAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Senior prefect suite.'
      },
      {
        hostel: vivekanandaHostel._id,
        hostelName: vivekanandaHostel.hostelName,
        roomNumber: '302',
        roomType: standardNonAC._id,
        roomTypeName: standardNonAC.roomType,
        bedCapacity: 4,
        costPerBed: standardNonAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Standard quadruple sharing.'
      },

      // Aryabhata Science Hostel
      {
        hostel: aryabhataHostel._id,
        hostelName: aryabhataHostel.hostelName,
        roomNumber: '401',
        roomType: standardAC._id,
        roomTypeName: standardAC.roomType,
        bedCapacity: 3,
        costPerBed: standardAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Equipped with 24/7 power backup and study lamps.'
      },
      {
        hostel: aryabhataHostel._id,
        hostelName: aryabhataHostel.hostelName,
        roomNumber: '402',
        roomType: standardNonAC._id,
        roomTypeName: standardNonAC.roomType,
        bedCapacity: 4,
        costPerBed: standardNonAC.costPerBed,
        allocatedStudents: [],
        status: 'Available',
        description: 'Ground floor, easy accessibility.'
      }
    ];

    const createdRooms = await HostelRoom.insertMany(roomsToCreate);
    console.log(`Seeded ${createdRooms.length} rooms.`);

    // 4. Fetch real students and allocate beds
    const students = await Student.find().limit(7);
    console.log(`Found ${students.length} students to allocate.`);

    if (students.length >= 5) {
      // Allocate student 0 & 1 to Tagore 101 (Deluxe 2-Bed -> Full)
      const room101 = createdRooms.find(r => r.roomNumber === '101' && r.hostelName.includes('Tagore'));
      if (room101) {
        const s1 = students[0];
        const s2 = students[1];

        room101.allocatedStudents.push(s1._id, s2._id);
        room101.status = 'Full';
        await room101.save();

        await HostelAllocation.create([
          {
            student: s1._id,
            studentName: `${s1.firstName} ${s1.lastName || ''}`.trim(),
            admissionNo: s1.admissionNo || s1.aparId,
            className: s1.class ? `${s1.class} ${s1.section || ''}`.trim() : 'Class 10 A',
            room: room101._id,
            roomNumber: room101.roomNumber,
            hostel: room101.hostel,
            hostelName: room101.hostelName,
            bedNumber: 'Bed 1',
            monthlyFee: room101.costPerBed,
            allocationDate: new Date('2026-08-01'),
            status: 'Allocated',
            remarks: 'Early semester allocation'
          },
          {
            student: s2._id,
            studentName: `${s2.firstName} ${s2.lastName || ''}`.trim(),
            admissionNo: s2.admissionNo || s2.aparId,
            className: s2.class ? `${s2.class} ${s2.section || ''}`.trim() : 'Class 10 B',
            room: room101._id,
            roomNumber: room101.roomNumber,
            hostel: room101.hostel,
            hostelName: room101.hostelName,
            bedNumber: 'Bed 2',
            monthlyFee: room101.costPerBed,
            allocationDate: new Date('2026-08-02'),
            status: 'Allocated',
            remarks: 'Early semester allocation'
          }
        ]);
      }

      // Allocate student 2 to Tagore 102 (Standard AC 3-Bed -> Partially Occupied)
      const room102 = createdRooms.find(r => r.roomNumber === '102' && r.hostelName.includes('Tagore'));
      if (room102) {
        const s3 = students[2];
        room102.allocatedStudents.push(s3._id);
        room102.status = 'Partially Occupied';
        await room102.save();

        await HostelAllocation.create({
          student: s3._id,
          studentName: `${s3.firstName} ${s3.lastName || ''}`.trim(),
          admissionNo: s3.admissionNo || s3.aparId,
          className: s3.class ? `${s3.class} ${s3.section || ''}`.trim() : 'Class 9 A',
          room: room102._id,
          roomNumber: room102.roomNumber,
          hostel: room102.hostel,
          hostelName: room102.hostelName,
          bedNumber: 'Bed 1',
          monthlyFee: room102.costPerBed,
          allocationDate: new Date('2026-08-10'),
          status: 'Allocated',
          remarks: 'Standard allocation'
        });
      }

      // Allocate student 3 to Sarojini 201 (Deluxe 2-Bed -> Partially Occupied)
      const room201 = createdRooms.find(r => r.roomNumber === '201' && r.hostelName.includes('Sarojini'));
      if (room201) {
        const s4 = students[3];
        room201.allocatedStudents.push(s4._id);
        room201.status = 'Partially Occupied';
        await room201.save();

        await HostelAllocation.create({
          student: s4._id,
          studentName: `${s4.firstName} ${s4.lastName || ''}`.trim(),
          admissionNo: s4.admissionNo || s4.aparId,
          className: s4.class ? `${s4.class} ${s4.section || ''}`.trim() : 'Class 11 Science',
          room: room201._id,
          roomNumber: room201.roomNumber,
          hostel: room201.hostel,
          hostelName: room201.hostelName,
          bedNumber: 'Bed 1',
          monthlyFee: room201.costPerBed,
          allocationDate: new Date('2026-08-12'),
          status: 'Allocated',
          remarks: 'Prefect allocation'
        });
      }

      // Allocate student 4 to Sarojini 202 (Standard AC 3-Bed -> Partially Occupied)
      const room202 = createdRooms.find(r => r.roomNumber === '202' && r.hostelName.includes('Sarojini'));
      if (room202) {
        const s5 = students[4];
        room202.allocatedStudents.push(s5._id);
        room202.status = 'Partially Occupied';
        await room202.save();

        await HostelAllocation.create({
          student: s5._id,
          studentName: `${s5.firstName} ${s5.lastName || ''}`.trim(),
          admissionNo: s5.admissionNo || s5.aparId,
          className: s5.class ? `${s5.class} ${s5.section || ''}`.trim() : 'Class 12 Commerce',
          room: room202._id,
          roomNumber: room202.roomNumber,
          hostel: room202.hostel,
          hostelName: room202.hostelName,
          bedNumber: 'Bed 1',
          monthlyFee: room202.costPerBed,
          allocationDate: new Date('2026-08-15'),
          status: 'Allocated',
          remarks: 'Annual boarding'
        });
      }

      // Add one historical vacated allocation
      if (students.length >= 6) {
        const s6 = students[5];
        await HostelAllocation.create({
          student: s6._id,
          studentName: `${s6.firstName} ${s6.lastName || ''}`.trim(),
          admissionNo: s6.admissionNo || s6.aparId,
          className: s6.class ? `${s6.class} ${s6.section || ''}`.trim() : 'Class 10 A',
          room: room102._id,
          roomNumber: room102.roomNumber,
          hostel: room102.hostel,
          hostelName: room102.hostelName,
          bedNumber: 'Bed 3',
          monthlyFee: room102.costPerBed,
          allocationDate: new Date('2026-06-01'),
          vacateDate: new Date('2026-07-28'),
          status: 'Vacated',
          remarks: 'Transferred to day boarding'
        });
      }

      console.log('Seeded allocations successfully!');
    }

    console.log('Hostel module seeded with 100% success!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding hostel data:', error);
    process.exit(1);
  }
}

seedHostel();
