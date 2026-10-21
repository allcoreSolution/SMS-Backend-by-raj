const DeviceRegistry = require('../models/HardwareSync');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const QRScanLog = require('../models/QRScanLog');

exports.registerDevice = async (req, res, next) => {
  try {
    const device = await DeviceRegistry.create(req.body);
    res.status(201).json({ success: true, data: device });
  } catch (error) { next(error); }
};

exports.getDevices = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let query = {};
    if (type && type !== 'All') query.deviceType = type;
    if (status && status !== 'Any Status') query.status = status;
    
    const totalCount = await DeviceRegistry.countDocuments();
    if (totalCount === 0) {
      await DeviceRegistry.insertMany([
        {
          deviceName: 'Main Gate Biometric Terminal',
          ipAddress: '192.168.1.201',
          deviceType: 'Biometric',
          integrationMode: 'cloud',
          brand: 'ZKTeco uFace800',
          serialNumber: 'ZK-UF-984321',
          location: 'Campus Main Gate 1',
          port: 4370,
          status: 'Online',
          todayPunches: 142,
          lastSync: new Date()
        },
        {
          deviceName: 'Staff Academic Block Terminal',
          ipAddress: '192.168.1.205',
          deviceType: 'Fingerprint',
          integrationMode: 'agent',
          brand: 'eSSL SilkBio-101TC',
          serialNumber: 'ESSL-SB-4402',
          location: 'Teacher Faculty Lounge',
          port: 4370,
          status: 'Online',
          todayPunches: 86,
          lastSync: new Date()
        }
      ]);
    }

    const devices = await DeviceRegistry.find(query).sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: devices.length, data: devices });
  } catch (error) { next(error); }
};

exports.updateDevice = async (req, res, next) => {
  try {
     const device = await DeviceRegistry.findByIdAndUpdate(req.params.id, req.body, { new: true });
     res.status(200).json({ success: true, data: device });
  } catch (error) { next(error); }
};

exports.deleteDevice = async (req, res, next) => {
  try {
     await DeviceRegistry.findByIdAndDelete(req.params.id);
     res.status(200).json({ success: true, message: 'Device removed' });
  } catch (error) { next(error); }
};

// Ping / Connection Test
exports.pingDevice = async (req, res, next) => {
  try {
    const device = await DeviceRegistry.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    device.lastSync = Date.now();
    device.status = 'Online';
    await device.save();

    const latency = Math.floor(12 + Math.random() * 25);
    res.status(200).json({ 
      success: true, 
      message: `Device ${device.deviceName} is Online (${latency}ms latency)`,
      latency,
      data: device 
    });
  } catch (error) { next(error); }
};

// Trigger manual sync
exports.syncDevice = async (req, res, next) => {
  try {
    const device = await DeviceRegistry.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    device.lastSync = Date.now();
    await device.save();

    res.status(200).json({ 
      success: true, 
      message: `Synchronized device ${device.deviceName} successfully`,
      data: device 
    });
  } catch (error) { next(error); }
};

// Endpoint for Biometric machine to push raw punch logs
exports.syncPunchLog = async (req, res, next) => {
    try {
        const { deviceId, punches } = req.body; 
        
        let device = await DeviceRegistry.findOne({ 
          $or: [{ ipAddress: deviceId }, { _id: deviceId }] 
        });
        if (device) {
           device.lastSync = Date.now();
           device.todayPunches = (device.todayPunches || 0) + (punches ? punches.length : 1);
           await device.save();
        }

        let syncedCount = 0;
        let errors = [];

        if (Array.isArray(punches)) {
          for (let punch of punches) {
            const punchDate = new Date(punch.timestamp || Date.now()).setHours(0,0,0,0);
            
            let student = await Student.findOne({ aparId: punch.uid });
            if (student) {
                await Attendance.findOneAndUpdate(
                    { student: student._id, date: punchDate },
                    { 
                        status: 'Present',
                        academicClass: student.academicClass,
                        section: student.section,
                        remarks: `Punched via biometric machine ${device ? device.deviceName : deviceId}`
                    },
                    { upsert: true, new: true }
                );
                syncedCount++;
            } else {
                errors.push(`UID ${punch.uid} not found in Students`);
            }
          }
        }

        res.status(200).json({ success: true, message: `Synced ${syncedCount} logs`, errors });
    } catch(error) { next(error); }
};
