require('dotenv').config();
const mongoose = require('mongoose');
const {
  AssetCategory,
  Asset,
  AssetAllocation,
  AssetMaintenance,
  AssetDisposal,
  AssetAudit
} = require('./models/Asset');
const Staff = require('./models/Staff');

async function seedAssets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Asset Management Seeding...');

    // Clear previous collections
    try {
      await mongoose.connection.db.dropCollection('assetcategories');
      await mongoose.connection.db.dropCollection('assets');
      await mongoose.connection.db.dropCollection('assetallocations');
      await mongoose.connection.db.dropCollection('assetmaintenances');
      await mongoose.connection.db.dropCollection('assetdisposals');
      await mongoose.connection.db.dropCollection('assetaudits');
      console.log('Dropped previous asset collections.');
    } catch (e) {
      // ignore
    }

    // 1. Seed Asset Categories
    const categoriesData = [
      { name: 'IT & Computer Equipment', code: 'CAT-IT', depreciationMethod: 'Straight Line', usefulLifeYears: 5, depreciationRate: 20, description: 'Desktops, laptops, printers, servers, switches and networking hardware.', status: 'Active' },
      { name: 'Smart Classroom & AV', code: 'CAT-AV', depreciationMethod: 'Straight Line', usefulLifeYears: 7, depreciationRate: 15, description: 'Interactive smart touch panels, digital projectors, PA sound systems, and video walls.', status: 'Active' },
      { name: 'Furniture & Fixtures', code: 'CAT-FUR', depreciationMethod: 'Straight Line', usefulLifeYears: 10, depreciationRate: 10, description: 'Classroom student dual desks, teacher tables, library bookshelves, executive chairs.', status: 'Active' },
      { name: 'Laboratory Apparatus', code: 'CAT-LAB', depreciationMethod: 'Straight Line', usefulLifeYears: 7, depreciationRate: 15, description: 'Microscopes, digital balances, fume hoods, spectrophotometers, and physics apparatus.', status: 'Active' },
      { name: 'Sports Gear & Athletics', code: 'CAT-SPT', depreciationMethod: 'Straight Line', usefulLifeYears: 4, depreciationRate: 25, description: 'Basketball posts, gym equipment, table tennis tables, athletic mats, and goal nets.', status: 'Active' },
      { name: 'Campus Utility & Power', code: 'CAT-PWR', depreciationMethod: 'Straight Line', usefulLifeYears: 10, depreciationRate: 10, description: 'Diesel generators, online UPS systems, solar battery banks, and RO water purification plants.', status: 'Active' }
    ];

    const createdCategories = await AssetCategory.insertMany(categoriesData);
    console.log(`Seeded ${createdCategories.length} Asset Categories.`);

    // 2. Fetch staff for assignment
    const staffList = await Staff.find().limit(5);
    const s1 = staffList[0];
    const s2 = staffList[1];
    const s1Name = s1?.fullName || (s1?.firstName ? `${s1.firstName} ${s1.lastName || ''}`.trim() : 'Rahul Verma (IT Head)');
    const s2Name = s2?.fullName || (s2?.firstName ? `${s2.firstName} ${s2.lastName || ''}`.trim() : 'Priya Sharma (Media Coord)');

    // 3. Seed Assets
    const assetsData = [
      {
        assetCode: 'AST-1001',
        assetName: 'Dell OptiPlex 7090 Desktop Core i7',
        category: 'IT & Computer Equipment',
        brand: 'Dell',
        modelNo: 'OptiPlex 7090 MT',
        serialNumber: 'DL-7090-9941A',
        purchaseDate: new Date('2024-04-10'),
        cost: 65000,
        currentValue: 45500,
        quantity: 1,
        available: 1,
        location: 'Computer Lab 1',
        vendor: 'Dell India Direct Enterprise',
        invoiceNo: 'INV-DEL-2024-88',
        warrantyExpiry: new Date('2027-04-10'),
        condition: 'Good',
        status: 'Active',
        notes: 'High performance lab system with 16GB RAM and 512GB NVMe SSD.'
      },
      {
        assetCode: 'AST-1002',
        assetName: 'BenQ 75" 4K Interactive Flat Panel Display',
        category: 'Smart Classroom & AV',
        brand: 'BenQ',
        modelNo: 'RM7502K',
        serialNumber: 'BQ-75K-30219',
        purchaseDate: new Date('2024-06-15'),
        cost: 145000,
        currentValue: 116000,
        quantity: 1,
        available: 1,
        location: 'Smart Classroom 10A',
        vendor: 'CyberSpace Audio Visuals Ltd',
        invoiceNo: 'CS-AV-9921',
        warrantyExpiry: new Date('2027-06-15'),
        condition: 'New',
        status: 'Active',
        notes: 'Germ-resistant 4K screen with cloud whiteboard and dual pens.'
      },
      {
        assetCode: 'AST-1003',
        assetName: 'HP LaserJet Pro Enterprise MFP M428fdw',
        category: 'IT & Computer Equipment',
        brand: 'HP',
        modelNo: 'LaserJet M428fdw',
        serialNumber: 'HP-MFP-42810',
        purchaseDate: new Date('2024-05-20'),
        cost: 42000,
        currentValue: 33600,
        quantity: 1,
        available: 1,
        location: 'Administrative Office',
        vendor: 'National Infotech Solutions',
        invoiceNo: 'NIS-8841',
        warrantyExpiry: new Date('2026-05-20'),
        condition: 'Good',
        status: 'Active',
        notes: 'Duplex wireless network printer and scanner.'
      },
      {
        assetCode: 'AST-1004',
        assetName: 'Olympus CX23 Binocular Biological Microscope',
        category: 'Laboratory Apparatus',
        brand: 'Olympus',
        modelNo: 'CX23 LED',
        serialNumber: 'OLY-MIC-5521',
        purchaseDate: new Date('2024-01-18'),
        cost: 32000,
        currentValue: 25600,
        quantity: 1,
        available: 1,
        location: 'Biology Lab',
        vendor: 'Scientific Lab Supplies Corp',
        invoiceNo: 'SLS-4412',
        warrantyExpiry: new Date('2026-01-18'),
        condition: 'Good',
        status: 'Active',
        notes: 'Plan achromat objectives with integrated LED illumination.'
      },
      {
        assetCode: 'AST-1005',
        assetName: 'Godrej Executive Wooden Conference Table (16-Seater)',
        category: 'Furniture & Fixtures',
        brand: 'Godrej Interio',
        modelNo: 'Plana-Conf-16',
        serialNumber: 'GD-CONF-1601',
        purchaseDate: new Date('2023-08-10'),
        cost: 55000,
        currentValue: 44000,
        quantity: 1,
        available: 1,
        location: 'Board Room',
        vendor: 'Godrej Interio Hub',
        invoiceNo: 'GD-99120',
        warrantyExpiry: new Date('2028-08-10'),
        condition: 'Good',
        status: 'Active',
        notes: 'Pre-laminated teak finish table with integrated cable raceways.'
      },
      {
        assetCode: 'AST-1006',
        assetName: 'Kirloskar 62.5 kVA Silent Diesel Generator Set',
        category: 'Campus Utility & Power',
        brand: 'Kirloskar',
        modelNo: 'KG62.5WS',
        serialNumber: 'KIR-GEN-6250',
        purchaseDate: new Date('2023-02-14'),
        cost: 480000,
        currentValue: 384000,
        quantity: 1,
        available: 1,
        location: 'Generator Yard',
        vendor: 'Kirloskar Power Systems',
        invoiceNo: 'KIR-INV-1102',
        warrantyExpiry: new Date('2026-02-14'),
        condition: 'Good',
        status: 'Active',
        notes: 'CPCB-II compliant acoustic enclosure with automatic mains failure (AMF) panel.'
      },
      {
        assetCode: 'AST-1007',
        assetName: 'Lenovo ThinkPad L14 Gen 2 Laptop Core i5',
        category: 'IT & Computer Equipment',
        brand: 'Lenovo',
        modelNo: 'ThinkPad L14 G2',
        serialNumber: 'LN-TP-99212',
        purchaseDate: new Date('2024-03-01'),
        cost: 72000,
        currentValue: 50400,
        quantity: 1,
        available: 0,
        location: 'Principal Office',
        vendor: 'Lenovo Corporate Commercial',
        invoiceNo: 'LNV-88219',
        warrantyExpiry: new Date('2027-03-01'),
        condition: 'Good',
        status: 'Assigned',
        allocatedTo: {
          staffId: s1?._id,
          staffName: s1Name,
          department: s1?.department || 'Leadership',
          allocationDate: new Date('2024-03-05')
        },
        notes: 'Assigned to Principal for official administration and academic review.'
      },
      {
        assetCode: 'AST-1008',
        assetName: 'Epson EB-E01 XGA 3LCD Projector 3300 Lumens',
        category: 'Smart Classroom & AV',
        brand: 'Epson',
        modelNo: 'EB-E01',
        serialNumber: 'EP-E01-44129',
        purchaseDate: new Date('2024-07-20'),
        cost: 38000,
        currentValue: 30400,
        quantity: 1,
        available: 1,
        location: 'Audio-Visual Room',
        vendor: 'Visual Display Systems',
        invoiceNo: 'VDS-9912',
        warrantyExpiry: new Date('2026-07-20'),
        condition: 'New',
        status: 'Active',
        notes: 'High brightness 3LCD technology for bright classroom presentations.'
      },
      {
        assetCode: 'AST-1009',
        assetName: 'Canon EOS 1500D DSLR Camera Kit with 18-55mm Lens',
        category: 'IT & Computer Equipment',
        brand: 'Canon',
        modelNo: 'EOS 1500D',
        serialNumber: 'CN-1500D-8821',
        purchaseDate: new Date('2024-04-25'),
        cost: 44000,
        currentValue: 35200,
        quantity: 1,
        available: 0,
        location: 'Media & Photography Lab',
        vendor: 'Chopra Camera Emporium',
        invoiceNo: 'CCE-7712',
        warrantyExpiry: new Date('2026-04-25'),
        condition: 'Good',
        status: 'Assigned',
        allocatedTo: {
          staffId: s2?._id,
          staffName: s2Name,
          department: s2?.department || 'Media & Communications',
          allocationDate: new Date('2024-05-01')
        },
        notes: 'Allocated to Media Coordinator for campus event photography and social coverage.'
      },
      {
        assetCode: 'AST-1010',
        assetName: 'Nivia Pro Hydraulic Movable Basketball Post & Acrylic Backboard',
        category: 'Sports Gear & Athletics',
        brand: 'Nivia',
        modelNo: 'Pro-Hydro-BB',
        serialNumber: 'NIV-BB-102',
        purchaseDate: new Date('2023-11-12'),
        cost: 85000,
        currentValue: 68000,
        quantity: 1,
        available: 1,
        location: 'Sports Complex',
        vendor: 'National Sports Emporium',
        invoiceNo: 'NSE-9921',
        warrantyExpiry: new Date('2026-11-12'),
        condition: 'Good',
        status: 'Active',
        notes: 'Official regulation height shatter-proof acrylic backboard with heavy counterbalance.'
      },
      {
        assetCode: 'AST-1011',
        assetName: 'Digital High Precision Analytical Balance 0.001g',
        category: 'Laboratory Apparatus',
        brand: 'Wensar',
        modelNo: 'PGB-200',
        serialNumber: 'WN-BAL-200',
        purchaseDate: new Date('2024-02-10'),
        cost: 24000,
        currentValue: 19200,
        quantity: 1,
        available: 1,
        location: 'Chemistry Lab',
        vendor: 'Precision Instruments Lab',
        invoiceNo: 'PIL-4412',
        warrantyExpiry: new Date('2026-02-10'),
        condition: 'Good',
        status: 'Active',
        notes: 'Electromagnetic force compensation weighing cell with draft shield chamber.'
      },
      {
        assetCode: 'AST-1012',
        assetName: 'Dual Student Ergonomic Wooden Desk & Bench Sets (Lot of 50)',
        category: 'Furniture & Fixtures',
        brand: 'Featherlite Institutional',
        modelNo: 'FL-Study-Dual',
        serialNumber: 'FL-DSK-LOT50',
        purchaseDate: new Date('2023-06-01'),
        cost: 210000,
        currentValue: 189000,
        quantity: 50,
        available: 50,
        location: 'Senior Wing Block B',
        vendor: 'Featherlite Commercial Ltd',
        invoiceNo: 'FLC-8819',
        warrantyExpiry: new Date('2028-06-01'),
        condition: 'Good',
        status: 'Active',
        notes: 'Heavy gauge steel frame with post-formed edge laminated wooden tops.'
      },
      {
        assetCode: 'AST-1013',
        assetName: 'eSSL MB20 Multi-Biometric Time Attendance Machine',
        category: 'IT & Computer Equipment',
        brand: 'eSSL',
        modelNo: 'MB20',
        serialNumber: 'ESSL-MB20-991',
        purchaseDate: new Date('2023-09-15'),
        cost: 18500,
        currentValue: 14800,
        quantity: 1,
        available: 0,
        location: 'Staff Room Entry',
        vendor: 'Security Systems India',
        invoiceNo: 'SSI-1102',
        warrantyExpiry: new Date('2025-09-15'),
        condition: 'Fair',
        status: 'In Maintenance',
        notes: 'Fingerprint scanner optical prism requires recalibration and firmware update.'
      },
      {
        assetCode: 'AST-1014',
        assetName: 'Ahuja 500W High Power PA Amplifier & Weatherproof Speakers',
        category: 'Smart Classroom & AV',
        brand: 'Ahuja',
        modelNo: 'SSA-5000EM',
        serialNumber: 'AHJ-PA-500',
        purchaseDate: new Date('2024-01-05'),
        cost: 62000,
        currentValue: 49600,
        quantity: 1,
        available: 1,
        location: 'Morning Assembly Ground',
        vendor: 'Sound Craft Electronics',
        invoiceNo: 'SCE-9910',
        warrantyExpiry: new Date('2026-01-05'),
        condition: 'Good',
        status: 'Active',
        notes: '6 Mic inputs, 2 Aux inputs with built-in MP3 player and Bluetooth receiver.'
      },
      {
        assetCode: 'AST-1015',
        assetName: 'Luminous 10kVA Online Solar Hybrid Inverter & Tubular Battery Bank',
        category: 'Campus Utility & Power',
        brand: 'Luminous',
        modelNo: 'Solarverter PRO 10kVA',
        serialNumber: 'LUM-SOL-10K',
        purchaseDate: new Date('2023-10-20'),
        cost: 195000,
        currentValue: 156000,
        quantity: 1,
        available: 1,
        location: 'Server Room',
        vendor: 'Luminous Power Technologies',
        invoiceNo: 'LPT-INV-9901',
        warrantyExpiry: new Date('2026-10-20'),
        condition: 'New',
        status: 'Active',
        notes: 'Pure sine wave inverter with MPPT solar charge controller for zero downtime.'
      }
    ];

    const createdAssets = await Asset.insertMany(assetsData);
    console.log(`Seeded ${createdAssets.length} Assets.`);

    // 4. Seed Allocations
    const assetThinkpad = createdAssets.find(a => a.assetCode === 'AST-1007');
    const assetCamera = createdAssets.find(a => a.assetCode === 'AST-1009');
    const assetDesktop = createdAssets.find(a => a.assetCode === 'AST-1001');

    await AssetAllocation.create([
      {
        asset: assetThinkpad._id,
        assetCode: assetThinkpad.assetCode,
        assetName: assetThinkpad.assetName,
        assignedTo: s1?._id,
        staffName: s1Name,
        department: s1?.department || 'Leadership',
        role: 'Principal',
        issueDate: new Date('2024-03-05'),
        expectedReturnDate: new Date('2025-03-31'),
        status: 'Issued',
        conditionOnIssue: 'Good',
        remarks: 'Executive laptop assignment for official institution administration.'
      },
      {
        asset: assetCamera._id,
        assetCode: assetCamera.assetCode,
        assetName: assetCamera.assetName,
        assignedTo: s2?._id,
        staffName: s2Name,
        department: s2?.department || 'Media Lab',
        role: 'Coordinator',
        issueDate: new Date('2024-05-01'),
        expectedReturnDate: new Date('2025-04-30'),
        status: 'Issued',
        conditionOnIssue: 'Good',
        remarks: 'DSLR camera allocated for event coverage, sports tournaments and prospectus photography.'
      },
      {
        asset: assetDesktop._id,
        assetCode: assetDesktop.assetCode,
        assetName: assetDesktop.assetName,
        assignedTo: s1?._id,
        staffName: s1Name,
        department: 'Computer Department',
        role: 'Lab Instructor',
        issueDate: new Date('2024-01-10'),
        returnDate: new Date('2024-04-05'),
        status: 'Returned',
        conditionOnIssue: 'Good',
        conditionOnReturn: 'Good',
        remarks: 'Returned after completion of Term 1 computing coursework.'
      }
    ]);
    console.log('Seeded Asset Allocations.');

    // 5. Seed Maintenance
    const assetBiometric = createdAssets.find(a => a.assetCode === 'AST-1013');
    await AssetMaintenance.create([
      {
        asset: assetBiometric._id,
        assetCode: assetBiometric.assetCode,
        assetName: assetBiometric.assetName,
        maintenanceType: 'Repair',
        serviceDate: new Date('2024-10-01'),
        cost: 2500,
        vendor: 'eSSL Service Center North',
        technician: 'Vikas Dubey (+91 98111 22334)',
        issueDescription: 'Optical fingerprint sensor calibration error; firmware reflash required.',
        status: 'In Progress'
      },
      {
        asset: createdAssets[5]._id, // Generator
        assetCode: createdAssets[5].assetCode,
        assetName: createdAssets[5].assetName,
        maintenanceType: 'Routine Service',
        serviceDate: new Date('2024-08-15'),
        completionDate: new Date('2024-08-16'),
        cost: 8500,
        vendor: 'Kirloskar Authorized Service',
        technician: 'Manoj Kumar',
        issueDescription: 'Quarterly general service: mobile oil change, air filter and fuel filter replacement.',
        resolutionNotes: 'Service completed successfully; load test passed at 50 kVA.',
        status: 'Completed'
      }
    ]);
    console.log('Seeded Asset Maintenance logs.');

    // 6. Seed Disposals
    await AssetDisposal.create({
      asset: createdAssets[0]._id,
      assetCode: 'AST-OLD-089',
      assetName: 'HP Compaq dx2480 Desktop PC (Pentium Dual Core)',
      disposalDate: new Date('2024-06-20'),
      disposalMethod: 'Sold',
      originalCost: 28000,
      saleValue: 4500,
      lossOrGain: -23500,
      reason: 'Obsolete 10-year old desktop computers scrapped through authorized e-waste recycler.',
      approvedBy: 'Governing Board & Principal'
    });
    console.log('Seeded Asset Disposals.');

    // 7. Seed Physical Verification Audits
    await AssetAudit.create([
      {
        auditTitle: 'Annual Campus Fixed Asset Audit (FY 2024-25)',
        auditDate: new Date('2024-09-25'),
        auditorName: 'Internal Audit Committee (V. K. Shrivastava & P. Roy)',
        location: 'All Campus Wings & Labs',
        totalAudited: 15,
        verifiedCount: 14,
        missingCount: 0,
        damagedCount: 1,
        remarks: 'Physical tag verification completed for all high-value IT, Lab and AV equipment. eSSL scanner noted in maintenance.',
        status: 'Completed'
      }
    ]);
    console.log('Seeded Asset Physical Audits.');

    console.log('Asset Management module seeded with 100% success!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Asset data:', error);
    process.exit(1);
  }
}

seedAssets();
