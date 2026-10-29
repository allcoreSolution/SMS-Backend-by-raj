const { ChatMessage, ChatThread } = require('../models/Chat');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const User = require('../models/User');
const CallRecord = require('../models/CallRecord');
const Contact = require('../models/Contact');
const Role = require('../models/Role');
const GlobalSetting = require('../models/GlobalSetting');
const WhatsAppMessageLog = require('../models/WhatsAppMessageLog');
const whatsappCloudApiService = require('../services/whatsappCloudApiService');
const smsService = require('../services/smsService');

// Helper functions for authorization & chat access
const getAuthId = (req) =>
  req.user?._id ? String(req.user._id) : null;

const getRoleName = (req) => {
  const role = req.user?.role;

  return String(
    req.userRole ||
    (typeof role === 'string' ? role : role?.name) ||
    ''
  ).toLowerCase();
};

const isChatAdmin = (req) => {
  const role = getRoleName(req);
  const permissions = Array.isArray(req.user?.role?.permissions)
    ? req.user.role.permissions
    : [];

  return ['admin', 'superadmin', 'staff', 'teacher'].includes(role) ||
    permissions.includes('all') ||
    permissions.includes('manage_chat');
};

const canAccessThread = (thread, req) => {
  if (!thread || !req.user) return false;
  if (isChatAdmin(req)) return true;

  const userId = getAuthId(req);
  if (!userId) return false;

  return (thread.participants || []).some(
    (participant) =>
      participant.userId &&
      String(participant.userId) === userId
  ) || (thread.createdBy && String(thread.createdBy) === userId);
};

const getAccessibleThread = async (threadId, req) => {
  const thread = await ChatThread.findOne({ threadId });

  return canAccessThread(thread, req) ? thread : null;
};

// ==============================================================
// 1. GET ALL CHAT THREADS
// ==============================================================
exports.getThreads = async (req, res, next) => {
  try {
    const { search, tab } = req.query; // tab: 'all' | 'groups' | 'direct'
    const query = {};

    if (!isChatAdmin(req)) {
      const userId = getAuthId(req);
      if (userId) {
        query.$or = [
          { 'participants.userId': userId },
          { createdBy: userId }
        ];
      }
    }

    if (tab === 'groups') query.isGroup = true;
    if (tab === 'direct') query.isGroup = false;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { name: searchRegex },
        { role: searchRegex },
        { lastMsg: searchRegex }
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const threads = await ChatThread.find(query).sort({ isPinned: -1, lastMsgAt: -1 });

    res.status(200).json({
      success: true,
      count: threads.length,
      data: threads
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 1B. DELETE THREAD & MESSAGES
// ==============================================================
exports.deleteThread = async (req, res, next) => {
  try {
    const thread = await getAccessibleThread(req.params.threadId, req);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    await ChatThread.deleteOne({ threadId: thread.threadId });
    await ChatMessage.deleteMany({ threadId: thread.threadId });
    res.status(200).json({
      success: true,
      message: 'Conversation thread deleted successfully'
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 1C. CLEAR ALL MESSAGES IN THREAD
// ==============================================================
exports.clearThreadHistory = async (req, res, next) => {
  try {
    const thread = await getAccessibleThread(req.params.threadId, req);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    await ChatMessage.deleteMany({ threadId: thread.threadId });
    await ChatThread.findOneAndUpdate(
      { threadId: thread.threadId },
      { lastMsg: 'Chat history cleared', lastMsgAt: new Date(), unreadCount: 0 }
    );
    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 1D. DELETE A SINGLE MESSAGE
// ==============================================================
exports.deleteThreadMessage = async (req, res, next) => {
  try {
    const { threadId, messageId } = req.params;
    const thread = await getAccessibleThread(threadId, req);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    await ChatMessage.deleteOne({ _id: messageId, threadId });
    const lastMsg = await ChatMessage.findOne({ threadId }).sort({ createdAt: -1 });
    await ChatThread.findOneAndUpdate(
      { threadId },
      { 
        lastMsg: lastMsg ? lastMsg.content : '', 
        lastMsgAt: lastMsg ? lastMsg.createdAt : new Date() 
      }
    );
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 1E. CLEAR ALL CHATS (Admin Only)
// ==============================================================
exports.clearAllChats = async (req, res, next) => {
  try {
    if (!isChatAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin access required'
      });
    }
    await ChatMessage.deleteMany({});
    await ChatThread.deleteMany({});
    res.status(200).json({
      success: true,
      message: 'All messages and conversations have been cleared'
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 2. GET THREAD MESSAGES & MARK READ
// ==============================================================
exports.getThreadMessages = async (req, res, next) => {
  try {
    const thread = await getAccessibleThread(req.params.threadId, req);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    const messages = await ChatMessage.find({ threadId: thread.threadId }).sort({ createdAt: 1 });

    // Mark thread unread count to 0
    await ChatThread.findOneAndUpdate(
      { threadId: thread.threadId },
      { $set: { unreadCount: 0 } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 3. POST MESSAGE TO THREAD
// ==============================================================
exports.postThreadMessage = async (req, res, next) => {
  try {
    const thread = await getAccessibleThread(req.params.threadId, req);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    const messageContent = String(req.body.content || '').trim();
    const { attachmentUrl, attachmentName, attachmentType } = req.body;

    if (!messageContent && !attachmentUrl) {
      return res.status(400).json({ success: false, message: 'Message content or attachment is required' });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = await ChatMessage.create({
      threadId: thread.threadId,
      senderId: req.user?._id,
      senderModel: req.authModel || 'User',
      sender: req.user?.name || req.user?.fullName || req.user?.email || 'User',
      senderRole: req.userRole || 'Member',
      senderAvatar: req.user?.avatar || '',
      content: messageContent || (attachmentName ? `Shared ${attachmentName}` : 'Shared an attachment'),
      channel: 'Chat',
      isSelf: true,
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || '',
      attachmentType: attachmentType || '',
      time: timeStr
    });

    // Update parent thread with latest activity
    await ChatThread.findOneAndUpdate(
      { threadId: thread.threadId },
      {
        $set: {
          lastMsg: newMsg.content,
          lastMsgAt: new Date()
        }
      }
    );

    // Socket.IO event for real-time delivery
    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', { threadId: thread.threadId, message: newMsg });
      io.to(thread.threadId).emit('new_message', { threadId: thread.threadId, message: newMsg });
    }

    res.status(201).json({
      success: true,
      message: 'Message delivered',
      data: newMsg
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 4. CREATE NEW THREAD (Direct or Group)
// ==============================================================
exports.createThread = async (req, res, next) => {
  try {
    const { name, role, isGroup, avatar, participants, initialMessage } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Thread name is required' });
    }

    const threadId = `TH-${Date.now().toString(36).toUpperCase()}`;

    const threadParticipants = Array.isArray(participants) ? [...participants] : [];
    if (req.user && !threadParticipants.some(p => p.userId && String(p.userId) === String(req.user._id))) {
      threadParticipants.push({
        userId: req.user._id,
        name: req.user.name || req.user.fullName || req.user.email || 'You',
        role: req.userRole || 'Member',
        email: req.user.email || ''
      });
    }

    const newThread = await ChatThread.create({
      threadId,
      name,
      role: role || (isGroup ? 'Class Group' : 'Direct'),
      isGroup: Boolean(isGroup),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      lastMsg: initialMessage || 'Conversation started',
      lastMsgAt: new Date(),
      unreadCount: 0,
      participants: threadParticipants,
      createdBy: req.user?._id
    });

    if (initialMessage) {
      await ChatMessage.create({
        threadId,
        senderId: req.user?._id,
        senderModel: req.authModel || 'User',
        sender: req.user?.name || req.user?.fullName || req.user?.email || 'You',
        senderRole: req.userRole || 'Staff Admin',
        content: initialMessage,
        isSelf: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    res.status(201).json({
      success: true,
      message: 'Chat thread created',
      data: newThread
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 5. TOGGLE PIN THREAD
// ==============================================================
exports.togglePinThread = async (req, res, next) => {
  try {
    const thread = await getAccessibleThread(req.params.threadId, req);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or access denied'
      });
    }

    thread.isPinned = !thread.isPinned;
    await thread.save();

    res.status(200).json({
      success: true,
      message: `Thread ${thread.isPinned ? 'Pinned to top' : 'Unpinned'}`,
      data: thread
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 8. GET AVAILABLE CONTACTS (Real School Staff, Students & Parents)
// ==============================================================
exports.getContacts = async (req, res, next) => {
  try {
    const [customContacts, staffList, studentList, parentList] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }),
      Staff.find({}, 'firstName lastName email department designation role phone').limit(30),
      Student.find({}, 'firstName lastName admissionNo rollNo class section').limit(30),
      Parent.find({}, 'fatherName motherName guardianName phone email').limit(30).catch(() => [])
    ]);

    const formattedContacts = [
      ...customContacts.map(c => ({
        id: c._id,
        name: c.name,
        role: c.role || `${c.category} Contact`,
        category: c.category || 'Other',
        email: c.email || '',
        phone: c.phone,
        avatar: c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        notes: c.notes || '',
        isCustom: true
      })),
      ...staffList.map((s, idx) => ({
        id: s._id,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Staff Member',
        role: s.designation || s.department || 'Faculty Staff',
        category: 'Staff',
        email: s.email || 'staff@greenwood.edu',
        phone: s.phone || `+91 98765 ${43210 + idx}`,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
      })),
      ...studentList.map((st, idx) => ({
        id: st._id,
        name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        role: `${st.class || 'Class 10'} • Roll: ${st.rollNo || (idx + 1)}`,
        category: 'Student',
        admissionNo: st.admissionNo,
        phone: st.phone || st.mobileNumber || `+91 98111 ${12340 + idx}`,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
      })),
      ...parentList.map((p, idx) => ({
        id: p._id,
        name: p.fatherName || p.motherName || p.guardianName || `Parent (${idx + 1})`,
        role: 'Parent / Guardian',
        category: 'Parent',
        email: p.email || 'parent@greenwood.edu',
        phone: p.phone || `+91 98222 ${56780 + idx}`,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
      }))
    ];

    res.status(200).json({
      success: true,
      count: formattedContacts.length,
      data: formattedContacts
    });
  } catch (error) { next(error); }
};

exports.addContact = async (req, res, next) => {
  try {
    const { name, phone, category, role, email, notes, avatar } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
    }

    const contact = await Contact.create({
      name: name.trim(),
      phone: phone.trim(),
      category: category || 'Parent',
      role: role ? role.trim() : `${category || 'School'} Contact`,
      email: email ? email.trim() : '',
      notes: notes ? notes.trim() : '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
    });

    res.status(201).json({
      success: true,
      message: 'New phone number saved to school directory',
      data: contact
    });
  } catch (error) { next(error); }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Contact removed from directory' });
  } catch (error) { next(error); }
};

// ==============================================================
// 9. CALL INITIATION & CDR LOGGING
// ==============================================================
exports.startCall = async (req, res, next) => {
  try {
    const { callerName, callerRole, receiverName, receiverRole, receiverPhone, channelName, callType } = req.body;
    const callId = `CALL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const call = await CallRecord.create({
      callId,
      callerName: callerName || 'Super Admin',
      callerRole: callerRole || 'Staff Admin',
      receiverName: receiverName || 'Contact',
      receiverRole: receiverRole || 'Member',
      receiverPhone: receiverPhone || '+91 98765 43210',
      channelName: channelName || 'Direct',
      callType: callType || 'audio',
      status: 'connected',
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Call session initiated',
      data: call
    });
  } catch (error) { next(error); }
};

exports.endCall = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { durationSeconds, status, notes } = req.body;

    const call = await CallRecord.findOneAndUpdate(
      { callId },
      {
        $set: {
          endedAt: new Date(),
          durationSeconds: Number(durationSeconds) || 0,
          status: status || 'completed',
          notes: notes || ''
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Call session ended and CDR recorded',
      data: call
    });
  } catch (error) { next(error); }
};

exports.getCallHistory = async (req, res, next) => {
  try {
    const calls = await CallRecord.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      count: calls.length,
      data: calls
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 10. WHATSAPP CLOUD API UTILITY & ACCOUNT CREATION
// ==============================================================

// Helper: Normalize WhatsApp phone number
const normalizeWhatsAppPhone = (rawPhone) => {
  try {
    return whatsappCloudApiService.normalizePhoneNumber(rawPhone);
  } catch (e) {
    let cleaned = String(rawPhone || '').replace(/[^0-9]/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return cleaned;
  }
};

// CREATE REAL USER ACCOUNT & PREPARE INVITATION (SECURE - NO PLAINTEXT PASSWORD EXPOSURE)
exports.createAccountAndInvite = async (req, res, next) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      username, 
      roleName = 'Student', 
      studentClass = 'Class 10',
      threadId
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
    }

    // Resolve Role
    let role = await Role.findOne({ name: new RegExp(`^${roleName}$`, 'i') });
    if (!role) {
      role = await Role.findOne({ name: 'Student' }) || await Role.findOne();
    }

    const cleanPhone = normalizeWhatsAppPhone(phone);
    const finalUsername = username ? username.trim() : (cleanPhone ? `std_${cleanPhone.slice(-6)}` : `user_${Date.now().toString(36)}`);
    const finalEmail = email ? email.trim() : `${finalUsername}@student.school.edu`;

    // Secure initial temporary credential generation
    const initialTemporaryPassword = `School@${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { username: finalUsername },
        { email: finalEmail }
      ]
    });

    let isNewAccount = false;
    if (user) {
      // Preserve existing account without resetting password unexpectedly
      user.isActive = true;
      await user.save();
    } else {
      user = await User.create({
        username: finalUsername,
        email: finalEmail,
        password: initialTemporaryPassword,
        role: role?._id,
        isActive: true
      });
      isNewAccount = true;
    }

    // Secure Contact Directory entry: Do NOT store plaintext password in notes
    await Contact.findOneAndUpdate(
      { phone: phone.trim() },
      { 
        name: name.trim(), 
        phone: phone.trim(), 
        category: roleName === 'Student' ? 'Student' : (roleName === 'Parent' ? 'Parent' : 'Other'),
        role: `${studentClass || ''} Student Account`.trim(),
        email: finalEmail,
        notes: `Portal Account: ${finalUsername} (${roleName}) - Account Active`
      },
      { upsert: true, new: true }
    );

    const portalUrl = 'http://localhost:5173/login';

    // Invitation Notification text
    const invitationMessage = `🏫 *GREENWOOD INTERNATIONAL SCHOOL*
Namaste *${name.trim()}*,

Aapka School ERP Portal account activate kar diya gaya hai! 🚀

📱 *Portal Access Details:*
🔗 *Portal URL:* ${portalUrl}
👤 *Username / ID:* ${finalUsername}

Kripya portal URL par jakar apna password set karein aur homework, attendance va school notices access karein.

_Official School Communication Helpline: +91 98765 43210_`;

    // Dispatch via Meta Cloud API if configured
    let metaDispatch = null;
    let cloudApiConfig = await whatsappCloudApiService.getConfig();
    if (cloudApiConfig.isConfigured) {
      try {
        metaDispatch = await whatsappCloudApiService.sendTextMessage(cleanPhone, invitationMessage, {
          recipientName: name,
          senderName: 'School Admin',
          threadId
        });
      } catch (sendErr) {
        console.warn('Meta WhatsApp dispatch warning during account creation:', sendErr.message);
      }
    }

    // Record system notification in thread without exposing password
    if (threadId) {
      await ChatMessage.create({
        threadId,
        sender: 'School Admin',
        senderRole: 'Staff Admin',
        content: `🎉 Student Portal Account created for ${name} (Username: "${finalUsername}"). Login portal link: ${portalUrl}`,
        isSelf: true,
        channel: 'System'
      }).catch(e => console.warn('Thread notice error:', e.message));
    }

    // Return sanitized response: NO PLAINTEXT PASSWORDS EXPOSED
    res.status(201).json({
      success: true,
      message: `Account ready for ${name}. Official invitation processed.`,
      data: {
        userId: user._id,
        username: finalUsername,
        email: finalEmail,
        phone: cleanPhone,
        isNewAccount,
        portalUrl,
        metaDispatched: Boolean(metaDispatch?.success),
        messageId: metaDispatch?.messageId || null
      }
    });

  } catch (error) { next(error); }
};

// ==============================================================
// 11. OFFICIAL META WHATSAPP CLOUD API ENDPOINTS
// ==============================================================

// GET WHATSAPP STATUS (META CLOUD API)
exports.getWhatsAppStatus = async (req, res, next) => {
  try {
    const config = await whatsappCloudApiService.getConfig();
    const host = req.get('host') || 'localhost:5050';
    const protocol = req.protocol || 'http';

    res.status(200).json({
      success: true,
      data: {
        provider: 'Meta WhatsApp Cloud API',
        isConfigured: config.isConfigured,
        apiVersion: config.apiVersion,
        phoneNumberId: config.phoneNumberId || null,
        wabaId: config.wabaId || null,
        displayPhoneNumber: config.displayPhoneNumber || 'Not Verified',
        verifiedName: config.verifiedName || 'Not Verified',
        qualityRating: config.qualityRating || 'UNKNOWN',
        codeVerificationStatus: config.codeVerificationStatus || 'UNKNOWN',
        accountMode: config.accountMode || 'SANDBOX/LIVE',
        lastVerifiedAt: config.lastVerifiedAt,
        maskedToken: config.maskedToken,
        webhookUrl: `${protocol}://${host}/api/chats/whatsapp/webhook`
      }
    });
  } catch (error) { next(error); }
};

// GET WHATSAPP SESSION (COMPATIBLE WITH FRONTEND POLLING / STATUS)
exports.getAdminWhatsAppSession = async (req, res, next) => {
  try {
    const config = await whatsappCloudApiService.getConfig();
    const host = req.get('host') || 'localhost:5050';
    const protocol = req.protocol || 'http';

    res.status(200).json({
      success: true,
      data: {
        provider: 'Meta WhatsApp Cloud API',
        status: config.isConfigured ? 'connected' : 'disconnected',
        isConnected: config.isConfigured,
        phone: config.displayPhoneNumber || config.phoneNumberId || '',
        name: config.verifiedName || 'Meta WhatsApp Cloud API',
        qualityRating: config.qualityRating || 'UNKNOWN',
        accountMode: config.accountMode || 'LIVE',
        phoneNumberId: config.phoneNumberId,
        wabaId: config.wabaId,
        maskedToken: config.maskedToken,
        apiVersion: config.apiVersion,
        lastVerifiedAt: config.lastVerifiedAt,
        webhookUrl: `${protocol}://${host}/api/chats/whatsapp/webhook`
      }
    });
  } catch (error) { next(error); }
};

// CONNECT / CONFIGURE WHATSAPP CLOUD API (REAL META GRAPH API VERIFICATION)
exports.connectAdminWhatsApp = async (req, res, next) => {
  try {
    const { accessToken, phoneNumberId, wabaId, apiVersion, webhookVerifyToken } = req.body;

    if (!phoneNumberId && !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Meta Phone Number ID and Access Token are required to configure WhatsApp Cloud API.'
      });
    }

    const verification = await whatsappCloudApiService.saveConfig({
      accessToken,
      phoneNumberId,
      wabaId,
      apiVersion,
      webhookVerifyToken
    });

    if (!verification.isValid) {
      return res.status(verification.status || 400).json({
        success: false,
        message: `Meta API Verification Rejected: ${verification.error}`,
        metaErrorCode: verification.code,
        details: verification.details
      });
    }

    res.status(200).json({
      success: true,
      message: `Meta WhatsApp Cloud API verified successfully for "${verification.verifiedName || verification.displayPhoneNumber}"`,
      data: {
        isConnected: true,
        verifiedName: verification.verifiedName,
        displayPhoneNumber: verification.displayPhoneNumber,
        qualityRating: verification.qualityRating,
        codeVerificationStatus: verification.codeVerificationStatus,
        accountMode: verification.accountMode,
        phoneNumberId: verification.phoneNumberId,
        maskedToken: verification.maskedToken,
        apiVersion: verification.apiVersion
      }
    });
  } catch (error) { next(error); }
};

// DISCONNECT / REMOVE WHATSAPP CLOUD API CONFIGURATION
exports.disconnectAdminWhatsApp = async (req, res, next) => {
  try {
    await whatsappCloudApiService.clearConfig();
    res.status(200).json({
      success: true,
      message: 'Meta WhatsApp Cloud API configuration has been removed.'
    });
  } catch (error) { next(error); }
};

// DISPATCH OFFICIAL MESSAGE VIA META WHATSAPP CLOUD API
exports.sendWhatsAppNotification = async (req, res, next) => {
  try {
    const { 
      phone, 
      recipientName = 'Recipient', 
      senderName = 'School Admin', 
      content,
      threadId,
      messageType = 'text',
      templateName,
      languageCode = 'en_US',
      components = []
    } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Recipient phone number is required.' });
    }

    let sendResult;
    if (messageType === 'template' || templateName) {
      sendResult = await whatsappCloudApiService.sendTemplateMessage(
        phone,
        templateName || 'hello_world',
        languageCode,
        components,
        { recipientName, senderName, threadId }
      );
    } else {
      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'Message content is required for text messaging.' });
      }
      sendResult = await whatsappCloudApiService.sendTextMessage(
        phone,
        content.trim(),
        { recipientName, senderName, threadId }
      );
    }

    // If threadId provided, log note in ChatMessage
    if (threadId) {
      await ChatMessage.create({
        threadId,
        sender: senderName,
        senderRole: 'Staff Admin',
        content: `[📱 WhatsApp Cloud API Dispatched - wamid: ${sendResult.messageId}]: ${content || `Template: ${templateName}`}`,
        isSelf: true,
        channel: 'WhatsApp'
      }).catch(e => console.warn('ChatMessage save warning:', e.message));
    }

    res.status(200).json({
      success: true,
      message: 'Message accepted by Meta WhatsApp Cloud API for delivery.',
      data: sendResult
    });

  } catch (error) {
    // Return safe, accurate error response without fake success
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'Failed to dispatch via Meta WhatsApp Cloud API',
      metaErrorCode: error.code || null,
      details: error.details || null
    });
  }
};

// META WEBHOOK VERIFICATION (GET)
exports.verifyWhatsAppWebhook = async (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const config = await whatsappCloudApiService.getConfig();
    const expectedToken = config.webhookVerifyToken;

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('✅ Meta Webhook verification succeeded.');
      return res.status(200).send(challenge);
    }

    console.warn('⚠️ Meta Webhook verification token mismatch:', { received: token, expected: expectedToken });
    return res.status(403).json({ success: false, message: 'Verification token mismatch' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// META WEBHOOK EVENT LISTENER (POST)
exports.handleWhatsAppWebhook = async (req, res) => {
  try {
    const result = await whatsappCloudApiService.handleWebhookEvent(req.body);
    return res.status(200).json({ status: 'EVENT_RECEIVED', ...result });
  } catch (err) {
    console.error('Meta webhook processing error:', err);
    return res.status(200).json({ status: 'EVENT_RECEIVED', error: err.message });
  }
};

// GET DELIVERY LOGS
exports.getWhatsAppDeliveryLogs = async (req, res, next) => {
  try {
    const { phone, status, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (phone) filter.phone = new RegExp(phone.replace(/[^0-9]/g, ''));
    if (status) filter.status = status;

    const result = await whatsappCloudApiService.getDeliveryLogs(filter, limit, skip);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) { next(error); }
};

// START DIRECT CHAT BY NUMBER
exports.startDirectChatByNumber = async (req, res, next) => {
  try {
    const { phone, name, role = 'Direct Contact' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const cleanPhone = normalizeWhatsAppPhone(phone);

    let thread = await ChatThread.findOne({
      $or: [
        { 'participants.phone': cleanPhone },
        { name: new RegExp(cleanPhone, 'i') },
        { name: name ? new RegExp(`^${name}$`, 'i') : null }
      ].filter(Boolean)
    });

    if (!thread) {
      const threadId = `TH-WA-${Date.now().toString(36).toUpperCase()}`;
      thread = await ChatThread.create({
        threadId,
        name: name || `+${cleanPhone}`,
        role: role,
        isGroup: false,
        online: true,
        lastMsg: 'Chat initiated via WhatsApp',
        lastMsgAt: new Date(),
        unreadCount: 0,
        participants: [{
          name: name || `+${cleanPhone}`,
          phone: cleanPhone,
          role: role
        }]
      });

      await ChatMessage.create({
        threadId,
        sender: 'You',
        senderRole: 'Staff Admin',
        content: `Hi ${name || 'there'}, starting conversation on WhatsApp.`,
        isSelf: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) { next(error); }
};

// ==============================================================
// 11. TWILIO SMS NOTIFICATION & DISPATCH
// ==============================================================
exports.sendSMS = async (req, res, next) => {
  try {
    const { phone, content, recipientName = 'Recipient', threadId } = req.body;
    if (!phone || !content) {
      return res.status(400).json({ success: false, message: 'Phone number and message content are required' });
    }

    const sendResult = await smsService.sendSMS(phone, content.trim());

    if (threadId) {
      await ChatMessage.create({
        threadId,
        sender: req.user?.name || req.user?.fullName || 'School Admin',
        senderRole: req.userRole || 'Staff Admin',
        content: `[💬 Twilio SMS ${sendResult.success ? 'Delivered' : 'Attempted'}]: ${content.trim()}`,
        isSelf: true,
        channel: 'Chat'
      }).catch(e => console.warn('ChatMessage save warning:', e.message));
    }

    res.status(200).json({
      success: sendResult.success,
      message: sendResult.success ? 'SMS dispatched successfully via Twilio!' : sendResult.message || 'SMS delivery failed',
      data: sendResult
    });
  } catch (error) { next(error); }
};

exports.getSMSStatus = async (req, res, next) => {
  try {
    const config = await smsService.getConfig();
    res.status(200).json({
      success: true,
      data: {
        provider: 'Twilio',
        isConfigured: config.isConfigured,
        phoneNumber: config.phoneNumber || 'Not Set',
        accountSid: config.accountSid ? `${config.accountSid.substring(0, 6)}••••••••` : 'Not Set'
      }
    });
  } catch (error) { next(error); }
};


