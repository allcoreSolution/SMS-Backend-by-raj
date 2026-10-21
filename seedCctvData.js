const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Camera, CctvAccessLog, CctvPolicy } = require('./models/CCTV');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seedCctv() {
  try {
    console.log('Connecting to MongoDB for CCTV Seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Clear existing CCTV collections
    await Promise.all([
      Camera.deleteMany({}),
      CctvAccessLog.deleteMany({}),
      CctvPolicy.deleteMany({})
    ]);
    console.log('Cleared previous CCTV records.');

    // 2. Seed Cameras
    const cameraRecords = [
      {
        name: 'Gate 1 - Main Security Entrance',
        code: 'CAM-001',
        covers: 'Gate 1 Entrance',
        zone: 'Security Gate',
        parents: 'CLOSED',
        hours: '—',
        eyeVisible: false,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 30,
        bitrate: '4096 kbps',
        ipAddress: '192.168.1.101',
        isRecording: true,
        notes: 'Primary visitor entry monitoring'
      },
      {
        name: 'Nursery A - Playroom & Activity',
        code: 'CAM-002',
        covers: 'Nursery - A',
        zone: 'Class Nursery A',
        parents: 'CAN VIEW',
        hours: '08:30 – 14:00',
        eyeVisible: true,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 25,
        bitrate: '2048 kbps',
        ipAddress: '192.168.1.102',
        isRecording: true,
        notes: 'Pre-primary classroom live stream'
      },
      {
        name: 'Class I - A Smart Classroom',
        code: 'CAM-003',
        covers: 'Class I - A',
        zone: 'Primary Wing A',
        parents: 'CAN VIEW',
        hours: '08:00 – 15:30',
        eyeVisible: true,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 30,
        bitrate: '2048 kbps',
        ipAddress: '192.168.1.103',
        isRecording: true,
        notes: 'Front angle facing student desks'
      },
      {
        name: 'Office Lobby & Reception',
        code: 'CAM-004',
        covers: 'Office Lobby',
        zone: 'Admin Block',
        parents: 'CAN VIEW',
        hours: '08:00 – 18:00',
        eyeVisible: true,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 30,
        bitrate: '3072 kbps',
        ipAddress: '192.168.1.104',
        isRecording: true,
        notes: 'Visitor waiting lounge and helpdesk'
      },
      {
        name: 'Central Sports Playground',
        code: 'CAM-005',
        covers: 'Playground',
        zone: 'Playground Area',
        parents: 'CAN VIEW',
        hours: '08:00 – 16:30',
        eyeVisible: true,
        status: 'Online',
        resolution: '4K Ultra',
        fps: 30,
        bitrate: '6144 kbps',
        ipAddress: '192.168.1.105',
        isRecording: true,
        notes: 'Wide-angle PTZ view of athletic field'
      },
      {
        name: 'Floor 1 Academic Corridor',
        code: 'CAM-006',
        covers: 'Common area',
        zone: 'Floor 1 Lobby',
        parents: 'CLOSED',
        hours: '—',
        eyeVisible: false,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 25,
        bitrate: '2048 kbps',
        ipAddress: '192.168.1.106',
        isRecording: true,
        notes: 'Passageway monitoring between grades 1-4'
      },
      {
        name: 'Junior STEM / Science Lab',
        code: 'CAM-007',
        covers: 'Science Lab',
        zone: 'STEM Block',
        parents: 'CLOSED',
        hours: '—',
        eyeVisible: false,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 30,
        bitrate: '2048 kbps',
        ipAddress: '192.168.1.107',
        isRecording: true,
        notes: 'Equipment safety and experiment monitoring'
      },
      {
        name: 'Central Library & Reading Hall',
        code: 'CAM-008',
        covers: 'Library',
        zone: 'Library Hall',
        parents: 'CAN VIEW',
        hours: '09:00 – 16:00',
        eyeVisible: true,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 25,
        bitrate: '2048 kbps',
        ipAddress: '192.168.1.108',
        isRecording: true,
        notes: 'Quiet study area view'
      },
      {
        name: 'Rear Bus Bay & Parking Hub',
        code: 'CAM-009',
        covers: 'Common area',
        zone: 'Transport Hub',
        parents: 'CLOSED',
        hours: '—',
        eyeVisible: false,
        status: 'Offline',
        resolution: '720p HD',
        fps: 20,
        bitrate: '1536 kbps',
        ipAddress: '192.168.1.109',
        isRecording: false,
        notes: 'Network switch undergoing maintenance'
      },
      {
        name: 'Primary Dining Hall & Mess',
        code: 'CAM-010',
        covers: 'Common area',
        zone: 'Cafeteria Wing',
        parents: 'CAN VIEW',
        hours: '11:30 – 14:30',
        eyeVisible: true,
        status: 'Online',
        resolution: '1080p FHD',
        fps: 30,
        bitrate: '2048 kbps',
        ipAddress: '192.168.1.110',
        isRecording: true,
        notes: 'Lunch break parent reassurance feed'
      }
    ];

    const insertedCameras = await Camera.insertMany(cameraRecords);
    console.log(`Seeded ${insertedCameras.length} CCTV Cameras.`);

    // 3. Seed Access Audit Logs
    const cam3 = insertedCameras.find(c => c.covers === 'Class I - A');
    const cam2 = insertedCameras.find(c => c.covers === 'Nursery - A');
    const cam4 = insertedCameras.find(c => c.covers === 'Office Lobby');
    const cam5 = insertedCameras.find(c => c.covers === 'Playground');

    const accessLogsData = [
      {
        camera: 'Class I - A Smart Classroom',
        cameraId: cam3?._id,
        viewer: 'Ramesh Patel (Parent)',
        userType: 'Parent',
        child: 'Diya Patel',
        duration: '14 mins',
        durationSeconds: 840,
        ip: '192.168.1.45',
        isParent: true,
        started: '2026-10-15 10:15'
      },
      {
        camera: 'Nursery A - Playroom & Activity',
        cameraId: cam2?._id,
        viewer: 'Pooja Sharma (Parent)',
        userType: 'Parent',
        child: 'Aarav Sharma',
        duration: '22 mins',
        durationSeconds: 1320,
        ip: '192.168.1.88',
        isParent: true,
        started: '2026-10-15 09:30'
      },
      {
        camera: 'Office Lobby & Reception',
        cameraId: cam4?._id,
        viewer: 'Admin Staff (Superintendent)',
        userType: 'Staff',
        child: '-',
        duration: '45 mins',
        durationSeconds: 2700,
        ip: '192.168.1.10',
        isParent: false,
        started: '2026-10-15 09:00'
      },
      {
        camera: 'Central Sports Playground',
        cameraId: cam5?._id,
        viewer: 'Sunita Verma (Parent)',
        userType: 'Parent',
        child: 'Rohan Verma',
        duration: '18 mins',
        durationSeconds: 1080,
        ip: '192.168.1.62',
        isParent: true,
        started: '2026-10-14 15:40'
      },
      {
        camera: 'Class I - A Smart Classroom',
        cameraId: cam3?._id,
        viewer: 'Vikram Mehta (Parent)',
        userType: 'Parent',
        child: 'Ananya Mehta',
        duration: '08 mins',
        durationSeconds: 480,
        ip: '192.168.1.114',
        isParent: true,
        started: '2026-10-14 11:20'
      },
      {
        camera: 'Gate 1 - Main Security Entrance',
        cameraId: insertedCameras[0]?._id,
        viewer: 'Security Officer In-Charge',
        userType: 'Security',
        child: '-',
        duration: '2 hrs 15 mins',
        durationSeconds: 8100,
        ip: '192.168.1.14',
        isParent: false,
        started: '2026-10-14 08:00'
      },
      {
        camera: 'Central Library & Reading Hall',
        cameraId: insertedCameras[7]?._id,
        viewer: 'Librarian Desk',
        userType: 'Staff',
        child: '-',
        duration: '1 hr 10 mins',
        durationSeconds: 4200,
        ip: '192.168.1.25',
        isParent: false,
        started: '2026-10-13 14:10'
      },
      {
        camera: 'Nursery A - Playroom & Activity',
        cameraId: cam2?._id,
        viewer: 'Kavita Singh (Parent)',
        userType: 'Parent',
        child: 'Reyansh Singh',
        duration: '16 mins',
        durationSeconds: 960,
        ip: '192.168.1.77',
        isParent: true,
        started: '2026-10-13 10:45'
      }
    ];

    const insertedLogs = await CctvAccessLog.insertMany(accessLogsData);
    console.log(`Seeded ${insertedLogs.length} CCTV Access Logs.`);

    // 4. Seed CCTV Policy
    await CctvPolicy.create({
      allowViewLive: true,
      requirePolicyAccept: true,
      maxDailyMinutesPerParent: 60,
      watermarkViewerName: true,
      recordingRetentionDays: 30,
      defaultHours: '08:00 – 17:00',
      policyText: 'Parent CCTV viewing is provided strictly for reassuring parents regarding classroom safety. Recording, screen-capturing, or sharing footage is strictly prohibited under school data safety guidelines.'
    });
    console.log('Seeded CCTV Policy Configuration.');

    console.log('=== CCTV DATABASE SEEDING COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('CCTV Seeding Failed:', error);
    process.exit(1);
  }
}

seedCctv();
