const SupportTicket = require('../models/SupportTicket');

// Sample real data seeds
const sampleTickets = [
  {
    ticketCode: 'TKT-1008',
    title: 'Biometric eSSL device punch logs not syncing automatically for Secondary Wing',
    description: 'The eSSL MB20 biometric device in the Secondary Wing (IP 192.168.1.145) stopped pushing punches to the attendance table since yesterday morning. Teachers are having to record manual attendance.',
    category: 'Hardware & Biometrics',
    priority: 'High',
    status: 'In Progress',
    schoolName: 'Apex International Academy',
    contactName: 'Rahul Verma (IT Head)',
    contactEmail: 'it.admin@apexinstitute.edu.in',
    contactPhone: '+91 98765 43210',
    assignedAgent: {
      name: 'Priya Sharma',
      role: 'Hardware & IoT Integration Lead',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    replies: [
      {
        sender: 'Rahul Verma (IT Head)',
        senderRole: 'Client',
        message: 'The eSSL MB20 device in the Secondary Wing (IP 192.168.1.145) stopped pushing punches to the attendance table since yesterday morning. Teachers are having to record manual attendance.',
        timestamp: new Date(Date.now() - 28 * 3600 * 1000)
      },
      {
        sender: 'Priya Sharma (Platform Support)',
        senderRole: 'Support Agent',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        message: 'Hello Rahul, we checked your cloud biometric bridge service. The heartbeat packets from your local agent stopped reporting around 08:15 AM yesterday. Please check if the local Windows service "ERP-Biometric-Sync" is running on your server, and verify if outbound port 5050 is open.',
        timestamp: new Date(Date.now() - 22 * 3600 * 1000)
      },
      {
        sender: 'Rahul Verma (IT Head)',
        senderRole: 'Client',
        message: 'Thank you Priya. The service had stopped due to a server restart. We restarted the service and 142 buffered punches synced. However, device port 4370 is timing out intermittently. Can you check live logs?',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000)
      },
      {
        sender: 'Priya Sharma (Platform Support)',
        senderRole: 'Support Agent',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        message: 'We are actively monitoring the live socket connection now. Keeping this ticket In-Progress until today\'s afternoon punch cycle completes smoothly.',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000)
      }
    ]
  },
  {
    ticketCode: 'TKT-1005',
    title: 'Need custom CBSE Term-2 Report Card template with 8-point grading scale & QR verification',
    description: 'We require our official CBSE Term-2 report card to include scholastic and co-scholastic 8-point grade tables along with student attendance percentage and Principal signature image watermark.',
    category: 'Academics & CBC',
    priority: 'Normal',
    status: 'Resolved',
    schoolName: 'Apex International Academy',
    contactName: 'Mrs. Sunita Rao (Examination Head)',
    contactEmail: 'exams@apexinstitute.edu.in',
    contactPhone: '+91 98111 22334',
    assignedAgent: {
      name: 'Amitabh Sengupta',
      role: 'Curriculum & Report Card Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    replies: [
      {
        sender: 'Mrs. Sunita Rao (Examination Head)',
        senderRole: 'Client',
        message: 'We require our official CBSE Term-2 report card to include scholastic and co-scholastic 8-point grade tables along with student attendance percentage and Principal signature image watermark.',
        timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000)
      },
      {
        sender: 'Amitabh Sengupta (Platform Support)',
        senderRole: 'Support Agent',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        message: 'Hello Sunita Ma\'am. We have configured the "CBSE-Comprehensive-Term2-v3" template under your institution\'s Assessment Settings. You can preview it directly from Assessment -> Offline Exams -> Generate Marksheets.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000)
      },
      {
        sender: 'Mrs. Sunita Rao (Examination Head)',
        senderRole: 'Client',
        message: 'Checked the preview for Grade 9A. The layout and QR verification code look excellent! Thank you for the quick resolution.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      }
    ]
  },
  {
    ticketCode: 'TKT-1003',
    title: 'Payment Gateway Razorpay webhook callback timeout on high-volume fee collection day',
    description: 'During quarterly fee collection yesterday, 6 parents reported that money was deducted from their bank UPI accounts but the ERP fee receipt status showed "Pending Verification" instead of "Paid".',
    category: 'Billing & Subscription',
    priority: 'Urgent',
    status: 'Resolved',
    schoolName: 'Apex International Academy',
    contactName: 'Vikram Joshi (Senior Accountant)',
    contactEmail: 'accounts@apexinstitute.edu.in',
    contactPhone: '+91 98222 33445',
    assignedAgent: {
      name: 'Rohan Mehta',
      role: 'FinTech & Gateway Lead',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    replies: [
      {
        sender: 'Vikram Joshi (Senior Accountant)',
        senderRole: 'Client',
        message: 'During quarterly fee collection yesterday, 6 parents reported that money was deducted from their bank UPI accounts but the ERP fee receipt status showed "Pending Verification" instead of "Paid".',
        timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000)
      },
      {
        sender: 'Rohan Mehta (Platform Support)',
        senderRole: 'Support Agent',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        message: 'We investigated the Razorpay webhook logs for your merchant account. The bank server response experienced a 12-second latency spike. We re-polled the order status for all 6 transactions and automatically reconciled them to "Paid". Receipts were issued and SMS receipts triggered to parents.',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000)
      }
    ]
  },
  {
    ticketCode: 'TKT-1009',
    title: 'Unable to promote Grade 10 students with pending fee dues clearance waiver',
    description: 'When running the annual academic session promotion wizard from 2025-26 to 2026-27, the system blocks 8 students marked with approved fee concession waivers. Need exception bypass flag.',
    category: 'Academics & CBC',
    priority: 'High',
    status: 'Open',
    schoolName: 'Apex International Academy',
    contactName: 'Shalini Saxena (Academic Coordinator)',
    contactEmail: 'academic.coord@apexinstitute.edu.in',
    contactPhone: '+91 98333 44556',
    assignedAgent: {
      name: 'Amitabh Sengupta',
      role: 'Curriculum & Student Records Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    replies: [
      {
        sender: 'Shalini Saxena (Academic Coordinator)',
        senderRole: 'Client',
        message: 'When running the annual academic session promotion wizard from 2025-26 to 2026-27, the system blocks 8 students marked with approved fee concession waivers. Need exception bypass flag.',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000)
      }
    ]
  },
  {
    ticketCode: 'TKT-1002',
    title: 'Requesting additional 5,000 WhatsApp broadcast quota for Annual Sports Day announcement',
    description: 'We need to send event invites, program schedules, and parking instructions to 1,200 parents for the upcoming Sports Day meet. Current quota is at 140 messages.',
    category: 'Billing & Subscription',
    priority: 'Normal',
    status: 'Closed',
    schoolName: 'Apex International Academy',
    contactName: 'School Administrator',
    contactEmail: 'admin@apexinstitute.edu.in',
    contactPhone: '+91 98765 43210',
    assignedAgent: {
      name: 'Kavita Iyer',
      role: 'Accounts & Subscription Desk',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    replies: [
      {
        sender: 'School Administrator',
        senderRole: 'Client',
        message: 'We need to send event invites, program schedules, and parking instructions to 1,200 parents for the upcoming Sports Day meet. Current quota is at 140 messages.',
        timestamp: new Date(Date.now() - 12 * 24 * 3600 * 1000)
      },
      {
        sender: 'Kavita Iyer (Platform Support)',
        senderRole: 'Support Agent',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        message: 'Greetings! 5,000 WhatsApp broadcast credits have been added to your institution\'s Comms Wallet. Transaction invoice #INV-W8842 has been emailed to your finance department.',
        timestamp: new Date(Date.now() - 11 * 24 * 3600 * 1000)
      }
    ]
  }
];

// 1. Get All Tickets with Stats
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } }
      ];
    }

    let tickets = await SupportTicket.find(filter).sort({ updatedAt: -1 });



    // Compute stats
    const allTickets = await SupportTicket.find();
    const stats = {
      total: allTickets.length,
      open: allTickets.filter(t => t.status === 'Open').length,
      inProgress: allTickets.filter(t => t.status === 'In Progress').length,
      resolved: allTickets.filter(t => t.status === 'Resolved').length,
      closed: allTickets.filter(t => t.status === 'Closed').length
    };

    res.status(200).json({
      success: true,
      count: tickets.length,
      stats,
      data: tickets
    });
  } catch (error) {
    console.error('Error in getTickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Single Ticket by ID or TicketCode
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    let ticket = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(id);
    }
    if (!ticket) {
      ticket = await SupportTicket.findOne({ ticketCode: id });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error in getTicketById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create a New Ticket
exports.createTicket = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category = 'Technical Issue', 
      priority = 'Normal', 
      contactName = 'School Administrator',
      contactEmail = 'admin@apexinstitute.edu.in',
      contactPhone = '+91 98765 43210',
      schoolName = 'Apex International Academy',
      attachmentUrl,
      attachments = []
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `TKT-${randomNum}`;

    const newTicket = new SupportTicket({
      ticketCode,
      title,
      description,
      category,
      priority,
      status: 'Open',
      contactName,
      contactEmail,
      contactPhone,
      schoolName,
      attachmentUrl,
      attachments,
      replies: [
        {
          sender: contactName,
          senderRole: 'Client',
          message: description,
          attachmentUrl,
          timestamp: new Date()
        }
      ]
    });

    await newTicket.save();

    res.status(201).json({ 
      success: true, 
      message: 'Support ticket submitted successfully.', 
      data: newTicket 
    });
  } catch (error) {
    console.error('Error in createTicket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Add Reply to Ticket Thread
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { sender = 'School Administrator', senderRole = 'Client', message, attachmentUrl } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }

    let ticket = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(id);
    }
    if (!ticket) {
      ticket = await SupportTicket.findOne({ ticketCode: id });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.replies.push({
      sender,
      senderRole,
      senderAvatar: senderRole === 'Support Agent' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' : '',
      message: message.trim(),
      attachmentUrl,
      timestamp: new Date()
    });

    // If ticket was resolved/closed and client replies, reopen it
    if (senderRole === 'Client' && (ticket.status === 'Resolved' || ticket.status === 'Closed')) {
      ticket.status = 'Open';
    }

    await ticket.save();

    res.status(200).json({ 
      success: true, 
      message: 'Reply posted successfully.', 
      data: ticket 
    });
  } catch (error) {
    console.error('Error in addReply:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Ticket Status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    let ticket = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findById(id);
    }
    if (!ticket) {
      ticket = await SupportTicket.findOne({ ticketCode: id });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;

    if (note) {
      ticket.replies.push({
        sender: 'Platform Support Lead',
        senderRole: 'Support Agent',
        message: note,
        timestamp: new Date()
      });
    }

    await ticket.save();

    res.status(200).json({ 
      success: true, 
      message: `Ticket marked as ${status}.`, 
      data: ticket 
    });
  } catch (error) {
    console.error('Error in updateTicketStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Force Seed Sample Tickets
exports.seedSupportTickets = async (req, res) => {
  try {
    await SupportTicket.deleteMany({});
    const inserted = await SupportTicket.insertMany(sampleTickets);
    res.status(200).json({ 
      success: true, 
      message: `Successfully seeded ${inserted.length} realistic support tickets.`, 
      data: inserted 
    });
  } catch (error) {
    console.error('Error in seedSupportTickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Delete Ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    let ticket = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await SupportTicket.findByIdAndDelete(id);
    }
    if (!ticket) {
      ticket = await SupportTicket.findOneAndDelete({ ticketCode: id });
    }
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.status(200).json({ success: true, message: 'Ticket deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteTicket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

