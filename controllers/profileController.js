const User = require('../models/User');

// Helper to get client IP and device info
const getClientMeta = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Web Browser';
  let device = 'Desktop (Web)';
  if (/mobile/i.test(userAgent)) device = 'Mobile Browser';
  else if (/tablet/i.test(userAgent)) device = 'Tablet';
  return { ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1', device };
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .populate('tenant');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If initial seed fields are missing, populate sensible defaults
    let modified = false;
    if (!user.firstName && !user.lastName) {
      const parts = (user.username || 'Admin User').replace(/[._-]/g, ' ').split(' ');
      user.firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Admin';
      user.lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : (user.role?.name || 'Administrator');
      modified = true;
    }

    if (!user.activityLog || user.activityLog.length === 0) {
      user.activityLog = [
        {
          action: 'Account Authenticated',
          details: 'Successfully logged in to the ERP Management Console',
          ip: getClientMeta(req).ip,
          device: getClientMeta(req).device,
          createdAt: new Date()
        },
        {
          action: 'Profile Initialized',
          details: 'Profile account settings initialized with role permissions',
          ip: '127.0.0.1',
          device: 'System Engine',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];
      modified = true;
    }

    if (modified) {
      await user.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '+91 9876543210',
        avatar: user.avatar || '',
        bio: user.bio || '',
        designation: user.designation || 'System Administrator',
        department: user.department || 'Management / IT',
        address: user.address || 'Block C, Tech Park, Vasant Kunj',
        city: user.city || 'New Delhi',
        state: user.state || 'Delhi',
        postalCode: user.postalCode || '110070',
        country: user.country || 'India',
        role: user.role?.name || 'Admin',
        roleDetails: user.role,
        tenant: user.tenant,
        twoFactorEnabled: user.twoFactorEnabled || false,
        preferences: user.preferences || {
          systemAlerts: true,
          securityAlerts: true,
          dailySummaries: false,
          whatsappAlerts: true,
          supportTickets: true,
          newAdmissions: false,
          language: 'en',
          theme: 'light'
        },
        activityLog: user.activityLog ? user.activityLog.slice(-15).reverse() : [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role').populate('tenant');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      designation,
      department,
      bio,
      address,
      city,
      state,
      postalCode,
      country
    } = req.body;

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already in use by another account' });
      }
      user.email = email.toLowerCase();
    }

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (designation !== undefined) user.designation = designation.trim();
    if (department !== undefined) user.department = department.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (state !== undefined) user.state = state.trim();
    if (postalCode !== undefined) user.postalCode = postalCode.trim();
    if (country !== undefined) user.country = country.trim();

    // Log this activity
    const meta = getClientMeta(req);
    user.activityLog.push({
      action: 'Profile Updated',
      details: 'Personal contact, address, or designation information was updated.',
      ip: meta.ip,
      device: meta.device,
      createdAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        designation: user.designation,
        department: user.department,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        role: user.role?.name || 'Admin',
        roleDetails: user.role,
        tenant: user.tenant,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        activityLog: user.activityLog.slice(-15).reverse(),
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Upload or update avatar
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ success: false, message: 'Avatar image data is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = avatar;

    const meta = getClientMeta(req);
    user.activityLog.push({
      action: 'Avatar Changed',
      details: 'Profile photo was updated.',
      ip: meta.ip,
      device: meta.device,
      createdAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile avatar updated successfully!',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Remove avatar
// @route   DELETE /api/profile/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = '';

    const meta = getClientMeta(req);
    user.activityLog.push({
      action: 'Avatar Removed',
      details: 'Custom profile photo was removed and reverted to default avatar.',
      ip: meta.ip,
      device: meta.device,
      createdAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile avatar removed successfully.',
      avatar: ''
    });
  } catch (error) {
    console.error('Error removing avatar:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Change account password
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;

    const meta = getClientMeta(req);
    user.activityLog.push({
      action: 'Password Changed',
      details: 'Account password was successfully changed from security panel.',
      ip: meta.ip,
      device: meta.device,
      createdAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully! Please keep your new credentials secure.'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update notification and security preferences
// @route   PUT /api/profile/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences, twoFactorEnabled } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (preferences !== undefined) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = Boolean(twoFactorEnabled);
    }

    const meta = getClientMeta(req);
    user.activityLog.push({
      action: 'Preferences Updated',
      details: `Updated notifications or 2FA security (${user.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}).`,
      ip: meta.ip,
      device: meta.device,
      createdAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully!',
      data: {
        preferences: user.preferences,
        twoFactorEnabled: user.twoFactorEnabled,
        activityLog: user.activityLog.slice(-15).reverse()
      }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Clear activity log
// @route   DELETE /api/profile/activity
// @access  Private
exports.clearActivityLog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const meta = getClientMeta(req);
    user.activityLog = [
      {
        action: 'Activity Log Cleared',
        details: 'Audit history was cleared by the user.',
        ip: meta.ip,
        device: meta.device,
        createdAt: new Date()
      }
    ];

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Activity log cleared successfully',
      data: user.activityLog
    });
  } catch (error) {
    console.error('Error clearing activity log:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
