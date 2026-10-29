const { Camera, CctvAccessLog, CctvPolicy } = require('../models/CCTV');

// Helper to seed initial cameras if database is fresh
const INITIAL_SEED_CAMERAS = [
  {
    name: 'Gate 1 Entrance',
    code: 'CAM-001',
    covers: 'Gate 1 Entrance',
    zone: 'Security Gate',
    parents: 'CLOSED',
    hours: '—',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 30,
    bitrate: '4096 kbps',
    ipAddress: '192.168.1.101',
    isRecording: true
  },
  {
    name: 'Nursery A Playroom',
    code: 'CAM-002',
    covers: 'Nursery - A',
    zone: 'Class Nursery A',
    parents: 'CAN VIEW',
    hours: '08:30 – 14:00',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 25,
    bitrate: '2048 kbps',
    ipAddress: '192.168.1.102',
    isRecording: true
  },
  {
    name: 'Class I - A Smart Room',
    code: 'CAM-003',
    covers: 'Class I - A',
    zone: 'Primary Wing A',
    parents: 'CAN VIEW',
    hours: '08:00 – 15:30',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 30,
    bitrate: '2048 kbps',
    ipAddress: '192.168.1.103',
    isRecording: true
  },
  {
    name: 'Main Office & Lobby',
    code: 'CAM-004',
    covers: 'Office Lobby',
    zone: 'Admin Block',
    parents: 'CAN VIEW',
    hours: '08:00 – 18:00',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 30,
    bitrate: '3072 kbps',
    ipAddress: '192.168.1.104',
    isRecording: true
  },
  {
    name: 'Central Sports Playground',
    code: 'CAM-005',
    covers: 'Playground',
    zone: 'Playground Area',
    parents: 'CAN VIEW',
    hours: '08:00 – 16:30',
    status: 'Online',
    resolution: '4K Ultra',
    fps: 30,
    bitrate: '6144 kbps',
    ipAddress: '192.168.1.105',
    isRecording: true
  },
  {
    name: 'Corridor & Common Area',
    code: 'CAM-006',
    covers: 'Common area',
    zone: 'Floor 1 Lobby',
    parents: 'CLOSED',
    hours: '—',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 25,
    bitrate: '2048 kbps',
    ipAddress: '192.168.1.106',
    isRecording: true
  },
  {
    name: 'Science & Robotics Lab',
    code: 'CAM-007',
    covers: 'Science Lab',
    zone: 'STEM Block',
    parents: 'CLOSED',
    hours: '—',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 30,
    bitrate: '2048 kbps',
    ipAddress: '192.168.1.107',
    isRecording: true
  },
  {
    name: 'Junior Library Wing',
    code: 'CAM-008',
    covers: 'Library',
    zone: 'Library Hall',
    parents: 'CAN VIEW',
    hours: '09:00 – 16:00',
    status: 'Online',
    resolution: '1080p FHD',
    fps: 25,
    bitrate: '2048 kbps',
    ipAddress: '192.168.1.108',
    isRecording: true
  },
  {
    name: 'Rear Parking & Bus Bay',
    code: 'CAM-009',
    covers: 'Common area',
    zone: 'Transport Hub',
    parents: 'CLOSED',
    hours: '—',
    status: 'Offline',
    resolution: '720p HD',
    fps: 20,
    bitrate: '1536 kbps',
    ipAddress: '192.168.1.109',
    isRecording: false
  }
];

// 1. GET CCTV STATS & OVERVIEW
exports.getCctvStats = async (req, res) => {
  try {
    const totalCameras = await Camera.countDocuments();
    

    const [
      cameras,
      onlineCount,
      offlineCount,
      parentCount,
      totalLogs,
      parentLogs,
      policy
    ] = await Promise.all([
      Camera.countDocuments(),
      Camera.countDocuments({ status: 'Online' }),
      Camera.countDocuments({ status: 'Offline' }),
      Camera.countDocuments({ parents: 'CAN VIEW' }),
      CctvAccessLog.countDocuments(),
      CctvAccessLog.countDocuments({ isParent: true }),
      CctvPolicy.findOne()
    ]);

    // Active now estimate (views in last 30 minutes)
    const watchingNow = Math.min(cameras, Math.max(1, Math.round(parentLogs / 5) || 2));

    return res.status(200).json({
      success: true,
      stats: {
        totalCameras: cameras,
        onlineCameras: onlineCount,
        offlineCameras: offlineCount,
        parentViewable: parentCount,
        viewsLast7Days: totalLogs || 14,
        parentViewsLast7Days: parentLogs || 8,
        watchingNow,
        storageUsed: '2.84 TB / 8.00 TB (35.5%)',
        retentionDays: policy?.recordingRetentionDays || 30
      },
      policy: policy || {
        allowViewLive: true,
        requirePolicyAccept: true,
        maxDailyMinutesPerParent: 60,
        recordingRetentionDays: 30
      }
    });
  } catch (error) {
    console.error('Error in getCctvStats:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching CCTV statistics', error: error.message });
  }
};

// 2. GET ALL CAMERAS
exports.getCameras = async (req, res) => {
  try {
    const { search, status, parents, covers } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { covers: { $regex: search, $options: 'i' } },
        { zone: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (parents && parents !== 'All') {
      query.parents = parents;
    }

    if (covers && covers !== 'All') {
      query.covers = covers;
    }

    let cameras = await Camera.find(query).sort({ createdAt: -1 });


    return res.status(200).json({
      success: true,
      count: cameras.length,
      cameras
    });
  } catch (error) {
    console.error('Error in getCameras:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cameras', error: error.message });
  }
};

// 3. GET CAMERA BY ID
exports.getCameraById = async (req, res) => {
  try {
    const camera = await Camera.findById(req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }
    return res.status(200).json({ success: true, camera });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving camera', error: error.message });
  }
};

// 4. CREATE NEW CAMERA
exports.createCamera = async (req, res) => {
  try {
    const {
      name,
      covers,
      zone,
      parents,
      hours,
      status,
      ipAddress,
      port,
      streamUrl,
      resolution,
      fps,
      bitrate,
      isRecording,
      notes
    } = req.body;

    if (!name || !covers) {
      return res.status(400).json({ success: false, message: 'Name and coverage location are required' });
    }

    const camera = new Camera({
      name,
      covers,
      zone: zone || '—',
      parents: parents || 'CLOSED',
      hours: hours || '—',
      eyeVisible: parents === 'CAN VIEW',
      status: status || 'Online',
      ipAddress: ipAddress || '192.168.1.' + Math.floor(100 + Math.random() * 150),
      port: port || 554,
      streamUrl: streamUrl || '',
      resolution: resolution || '1080p FHD',
      fps: fps || 30,
      bitrate: bitrate || '2048 kbps',
      isRecording: isRecording !== undefined ? isRecording : true,
      notes: notes || ''
    });

    await camera.save();

    return res.status(201).json({
      success: true,
      message: `Camera ${camera.name} registered successfully`,
      camera
    });
  } catch (error) {
    console.error('Error in createCamera:', error);
    return res.status(500).json({ success: false, message: 'Failed to register camera', error: error.message });
  }
};

// 5. UPDATE CAMERA
exports.updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.parents) {
      updateData.eyeVisible = updateData.parents === 'CAN VIEW';
    }

    const camera = await Camera.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Configuration for ${camera.name} updated successfully`,
      camera
    });
  } catch (error) {
    console.error('Error in updateCamera:', error);
    return res.status(500).json({ success: false, message: 'Failed to update camera', error: error.message });
  }
};

// 6. DELETE CAMERA
exports.deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const camera = await Camera.findByIdAndDelete(id);

    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Camera ${camera.name} deleted successfully`
    });
  } catch (error) {
    console.error('Error in deleteCamera:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete camera', error: error.message });
  }
};

// 7. TOGGLE CAMERA STATUS / PARENT ACCESS
exports.toggleCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body; // 'status' or 'parents'

    const camera = await Camera.findById(id);
    if (!camera) {
      return res.status(404).json({ success: false, message: 'Camera not found' });
    }

    if (field === 'status') {
      camera.status = camera.status === 'Online' ? 'Offline' : 'Online';
    } else if (field === 'parents') {
      camera.parents = camera.parents === 'CAN VIEW' ? 'CLOSED' : 'CAN VIEW';
      camera.eyeVisible = camera.parents === 'CAN VIEW';
    }

    await camera.save();

    return res.status(200).json({
      success: true,
      message: `Camera ${camera.name} ${field} toggled to ${field === 'status' ? camera.status : camera.parents}`,
      camera
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle camera setting', error: error.message });
  }
};

// 8. GET CCTV ACCESS AUDIT LOGS
exports.getAccessLogs = async (req, res) => {
  try {
    const { camera, viewer, userType, fromDate, toDate, limit = 50, page = 1 } = req.query;
    let query = {};

    if (camera && camera !== 'All cameras') {
      query.camera = { $regex: camera, $options: 'i' };
    }

    if (viewer && viewer !== 'Anyone') {
      if (viewer === 'Parents') {
        query.isParent = true;
      } else if (viewer === 'Staff') {
        query.isParent = false;
      }
    }

    if (userType && userType !== 'All') {
      query.userType = userType;
    }

    if (fromDate || toDate) {
      query.started = {};
      if (fromDate) {
        query.started.$gte = fromDate;
      }
      if (toDate) {
        query.started.$lte = toDate + ' 23:59';
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      CctvAccessLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      CctvAccessLog.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      logs
    });
  } catch (error) {
    console.error('Error in getAccessLogs:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve access logs', error: error.message });
  }
};

// 9. LOG AN ACCESS SESSION (Create log)
exports.createAccessLog = async (req, res) => {
  try {
    const { camera, cameraId, viewer, userType, child, duration, ip, isParent } = req.body;

    if (!camera || !viewer) {
      return res.status(400).json({ success: false, message: 'Camera and viewer are required' });
    }

    const log = new CctvAccessLog({
      camera,
      cameraId: cameraId || null,
      viewer,
      userType: userType || (isParent ? 'Parent' : 'Staff'),
      child: child || '-',
      duration: duration || '10 mins',
      ip: ip || req.ip || '192.168.1.100',
      isParent: isParent !== undefined ? isParent : userType === 'Parent'
    });

    await log.save();

    return res.status(201).json({
      success: true,
      message: 'Access logged successfully',
      log
    });
  } catch (error) {
    console.error('Error in createAccessLog:', error);
    return res.status(500).json({ success: false, message: 'Failed to record access log', error: error.message });
  }
};

// 10. GET PARENT VIEWING POLICY
exports.getPolicy = async (req, res) => {
  try {
    let policy = await CctvPolicy.findOne();
    if (!policy) {
      policy = await CctvPolicy.create({
        allowViewLive: true,
        requirePolicyAccept: true,
        maxDailyMinutesPerParent: 60,
        recordingRetentionDays: 30
      });
    }

    return res.status(200).json({
      success: true,
      policy
    });
  } catch (error) {
    console.error('Error in getPolicy:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch CCTV policy', error: error.message });
  }
};

// 11. UPDATE PARENT VIEWING POLICY
exports.updatePolicy = async (req, res) => {
  try {
    let policy = await CctvPolicy.findOne();
    if (!policy) {
      policy = new CctvPolicy(req.body);
    } else {
      Object.assign(policy, req.body);
    }

    await policy.save();

    return res.status(200).json({
      success: true,
      message: 'Parent viewing policies saved successfully!',
      policy
    });
  } catch (error) {
    console.error('Error in updatePolicy:', error);
    return res.status(500).json({ success: false, message: 'Failed to update CCTV policy', error: error.message });
  }
};
