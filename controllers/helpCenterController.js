const { KbCategory, KbArticle, AiConversation } = require('../models/HelpCenter');

// ==========================================
// 1. HELP CENTER STATS & OVERVIEW
// ==========================================
exports.getHelpCenterStats = async (req, res, next) => {
  try {
    const [categories, articles, topArticles] = await Promise.all([
      KbCategory.find({ status: 'Active' }),
      KbArticle.find({ status: 'Published' }),
      KbArticle.find({ status: 'Published' }).sort({ views: -1 }).limit(5)
    ]);

    const totalCategories = categories.length;
    const totalArticles = articles.length;
    
    let totalViews = 0;
    let totalHelpfulVotes = 0;

    const categoryMap = {};
    articles.forEach(art => {
      totalViews += (art.views || 0);
      totalHelpfulVotes += (art.helpfulVotes || 0);
      categoryMap[art.category] = (categoryMap[art.category] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      name: cat,
      count: categoryMap[cat]
    }));

    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        totalArticles,
        totalViews,
        totalHelpfulVotes,
        popularArticles: topArticles,
        recentArticles: articles.slice(-5).reverse(),
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. KNOWLEDGE BASE CATEGORIES CRUD
// ==========================================
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await KbCategory.find().sort({ sortOrder: 1, name: 1 });
    const articles = await KbArticle.find();

    const data = categories.map(cat => {
      const count = articles.filter(a => a.category === cat.name || (a.categoryId && a.categoryId.toString() === cat._id.toString())).length;
      return {
        ...cat.toObject(),
        articlesCount: count
      };
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, parentCategory, description, visibility, sortOrder, status } = req.body;
    
    const existing = await KbCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await KbCategory.create({
      name,
      icon: icon || 'Book',
      parentCategory: parentCategory || '— None (Root) —',
      description: description || '',
      visibility: visibility || 'Public',
      sortOrder: Number(sortOrder) || 0,
      status: status || 'Active'
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await KbCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await KbCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check if any articles exist in this category
    const articleCount = await KbArticle.countDocuments({
      $or: [{ category: category.name }, { categoryId: category._id }]
    });

    if (articleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${articleCount} article(s) are currently attached to it.`
      });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. KNOWLEDGE BASE ARTICLES CRUD
// ==========================================
exports.getArticles = async (req, res, next) => {
  try {
    const { category, status, visibility, q } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (visibility && visibility !== 'All') query.visibility = visibility;

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    const articles = await KbArticle.find(query).sort({ featured: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    next(error);
  }
};

exports.getArticleByIdOrSlug = async (req, res, next) => {
  try {
    const { id } = req.params;
    let article = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      article = await KbArticle.findById(id);
    }
    if (!article) {
      article = await KbArticle.findOne({ slug: id });
    }

    if (!article) {
      return res.status(404).json({ success: false, message: 'Help article not found' });
    }

    // Increment views counter
    article.views = (article.views || 0) + 1;
    await article.save();

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

exports.createArticle = async (req, res, next) => {
  try {
    const { title, category, summary, content, author, status, visibility, tags, featured } = req.body;

    const article = await KbArticle.create({
      title,
      category,
      summary: summary || '',
      content,
      author: author || 'ACS Knowledge Team',
      status: status || 'Published',
      visibility: visibility || 'Public',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      featured: Boolean(featured),
      views: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

exports.updateArticle = async (req, res, next) => {
  try {
    let updateData = { ...req.body };
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    const article = await KbArticle.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await KbArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    await article.deleteOne();
    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.voteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'helpful' or 'unhelpful'

    const article = await KbArticle.findById(id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    if (vote === 'helpful') {
      article.helpfulVotes = (article.helpfulVotes || 0) + 1;
    } else if (vote === 'unhelpful') {
      article.unhelpfulVotes = (article.unhelpfulVotes || 0) + 1;
    }
    await article.save();

    res.status(200).json({
      success: true,
      message: 'Feedback recorded',
      data: {
        helpfulVotes: article.helpfulVotes,
        unhelpfulVotes: article.unhelpfulVotes
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. AI CHATBOT & KNOWLEDGE ASSISTANT
// ==========================================
exports.chatWithAi = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const convId = conversationId || `conv-${Date.now()}`;
    const query = message.toLowerCase();

    // 1. Search knowledge base articles for context
    const matchingArticles = await KbArticle.find({
      status: 'Published',
      $or: [
        { title: { $regex: query.substring(0, 20), $options: 'i' } },
        { tags: { $in: [new RegExp(query.substring(0, 15), 'i')] } }
      ]
    }).limit(2);

    // 2. Intelligent ERP workflow knowledge matcher
    let reply = "";
    let actionLink = "/help-center/articles";
    let actionLabel = "Browse Knowledge Base";

    // A. Credentials & Login Information
    if (
      query.includes('credential') || 
      query.includes('login') || 
      query.includes('password') || 
      query.includes('passcode') || 
      query.includes('id pass') || 
      query.includes('user id') || 
      query.includes('email id') || 
      query.includes('admin login') || 
      query.includes('superadmin login') || 
      query.includes('लॉगिन') || 
      query.includes('पासवर्ड')
    ) {
      reply = `**Official Login Portals & Security Notice (All Core Solutions):**\n\n🔒 **Confidentiality Notice**: Institutional login emails and passwords are strictly confidential and are never shared publicly or inside chat interfaces.\n\nPlease log in using your authorized institutional account provided by the All Core Solutions IT Administration.\n\n**Official Login Portals:**\n1. **School Admin Core ERP (:5176)**: \`http://localhost:5176/login\`\n2. **SuperAdmin SaaS Console (:5179)**: \`http://localhost:5179/login\`\n3. **Accountant Finance Counter (:5178)**: \`http://localhost:5178/login\`\n4. **Teacher & Faculty Panel (:5177)**: \`http://localhost:5177/login\`\n5. **Branch Network Portal (:5174)**: \`http://localhost:5174/login\`\n\n*Parent & Student Portal (:5175) is accessible directly at \`http://localhost:5175\` for sample student Aarav Sharma (#YIS-2024-101).*`;
      actionLink = "/login";
      actionLabel = "Open Admin Login";
    }
    // B. 7 Portals Ecosystem & Port Numbers
    else if (
      query.includes('portal') || 
      query.includes('portals') || 
      query.includes('port number') || 
      query.includes('ports') || 
      query.includes('5173') || 
      query.includes('5174') || 
      query.includes('5175') || 
      query.includes('5176') || 
      query.includes('5177') || 
      query.includes('5178') || 
      query.includes('5179') || 
      query.includes('kitne portal') || 
      query.includes('panels') || 
      query.includes('all portal') || 
      query.includes('पोर्टल')
    ) {
      reply = `**7 Specialized Portals Ecosystem & Ports Directory:**\n\n1. **Multi_School_Erp (Port \`5173\`)**: Showcase Landing Hub & Module Tour (\`http://localhost:5173\`).\n2. **Branch-Admin (Port \`5174\`)**: Multi-branch network oversight & student transfer controls (\`http://localhost:5174\`).\n3. **Student_Parents (Port \`5175\`)**: Mobile-first parent app with fee payment, attendance, and 24/7 AI Assistant (\`http://localhost:5175\`).\n4. **School_ERP (Port \`5176\`)**: Core School Administration Workstation with 38+ modules (\`http://localhost:5176\`).\n5. **Teache_Panel (Port \`5177\`)**: Teacher Workstation for attendance, marks, and lesson planning (\`http://localhost:5177\`).\n6. **Accountant (Port \`5178\`)**: Bursar Desk for fee collections, challans, and cashbook (\`http://localhost:5178\`).\n7. **SuperAdmin (Port \`5179\`)**: Multi-tenant SaaS Master Console (\`http://localhost:5179\`).\n\n**Backend Server**: Port \`5050\` (\`http://localhost:5050\`) with MongoDB database.`;
      actionLink = "/help-center/articles";
      actionLabel = "View Architecture Guide";
    }
    // C. Project Overview & Architecture
    else if (
      query.includes('project') || 
      query.includes('school erp kya') || 
      query.includes('ecosystem') || 
      query.includes('architecture') || 
      query.includes('ye kya h') || 
      query.includes('ye kya hai') || 
      query.includes('about project') || 
      query.includes('overview') || 
      query.includes('all information') || 
      query.includes('poori jaankari') || 
      query.includes('puri jankari') || 
      query.includes('प्रोजेक्ट') || 
      query.includes('परियोजना')
    ) {
      reply = `**Multi-School ERP Ecosystem (All Core Solutions - ACS):**\n\nAn enterprise-grade, cloud-native **School Management SaaS Platform** engineered by **All Core Solutions** for independent K-12 schools and multi-branch school networks.\n\n• **Micro-Frontend Architecture**: 7 specialized web portals (Ports 5173 – 5179) delivering role-tailored dashboards for SuperAdmin, School Admin, Teachers, Accountants, Branch Directors, and Parents.\n• **High-Performance REST Backend**: Node.js & Express API running on Port \`5050\` with MongoDB (\`mongodb://127.0.0.1:27017/school_erp\`).\n• **38+ Institutional Modules**: Admissions, Fee Collections, Biometric Machine Sync (ZKTeco/eSSL), CBSE Marksheets, HR & Payroll, Transport GPS, Hostel, and QR-authenticated Certificates.\n• **Role-Based Access**: Dedicated portals secured with JWT authentication and authorized credentials.`;
      actionLink = "/help-center/articles";
      actionLabel = "Browse Documentation";
    }
    // D. Modules Catalog & 38+ Features
    else if (
      query.includes('module') || 
      query.includes('modules') || 
      query.includes('kya kya h') || 
      query.includes('kya kya hai') || 
      query.includes('suvidha') || 
      query.includes('suvidhaye') || 
      query.includes('feature') || 
      query.includes('features') || 
      query.includes('38') || 
      query.includes('catalog') || 
      query.includes('all module') || 
      query.includes('list of module') || 
      query.includes('मॉड्यूल') || 
      query.includes('सुविधा')
    ) {
      reply = `**School ERP Complete 38+ Modules Catalog:**\n\n1. **Student SIS**: 3-step online admission, student directory, sibling linkage.\n2. **Fees & Finance**: Fee groups, collection counter, search due fees, bank challan generation, expense vouchers.\n3. **Academics**: Class/teacher timetable, syllabus planner, homework assignments.\n4. **Exams & Marksheets**: Offline datesheets, marks entry, CBSE 9-point scale report cards, online CBT exams.\n5. **Biometric Attendance**: ZKTeco/eSSL real-time hardware sync, daily attendance, bulk Excel upload.\n6. **HR & Payroll**: Staff directory, leave approval, salary slips, allowances.\n7. **Transport**: Fleet routes, live vehicle GPS tracking, driver credentials.\n8. **Hostel**: Capacity dashboard, room allocation, bed management.\n9. **Certificates & ID Cards**: QR verified Transfer Certificate (TC), Bonafide, custom ID card designer.\n10. **Comms & AI**: Bulk WhatsApp/SMS broadcast, notice board, and 24/7 AI Assistant.`;
      actionLink = "/apps-center";
      actionLabel = "Open All Modules Center";
    }
    // E. Technical Setup & Developer Guide
    else if (
      query.includes('setup') || 
      query.includes('how to run') || 
      query.includes('run kaise') || 
      query.includes('start kaise') || 
      query.includes('chalaye') || 
      query.includes('npm run dev') || 
      query.includes('port 5050') || 
      query.includes('mongodb') || 
      query.includes('backend') || 
      query.includes('installation') || 
      query.includes('database') || 
      query.includes('सेटअप') || 
      query.includes('चालू कैसे')
    ) {
      reply = `**Developer Quickstart & System Setup (All Core Solutions):**\n\n1. **Backend API (Port \`5050\`):**\n   \`cd "School_ERP_Api's" && npm install && npm run dev\`\n   Connects to MongoDB: \`mongodb://127.0.0.1:27017/school_erp\`\n\n2. **Database Seeds:**\n   Run \`node seed_admin.js\` and \`node seed_superadmin.js\` to initialize database administrative collections.\n\n3. **Frontend Portals:**\n   Run \`npm run dev\` in respective portal folders to launch Ports \`5173\` through \`5179\`.\n\n4. **Tech Stack:** React 18, Vite, Tailwind CSS, Node.js, Express, MongoDB (Mongoose), JWT.`;
      actionLink = "/help-center/articles";
      actionLabel = "View Setup Docs";
    }
    // F. Existing Institutional Workflows
    else if (query.includes('fee') || query.includes('challan') || query.includes('payment') || query.includes('receipt') || query.includes('dues') || query.includes('फीस') || query.includes('शुल्क')) {
      reply = `**Fee Collection & Financial Management:**\n\n1. **Collect Fees**: Navigate to **Finance & Accounts** > **Collect Fees** to record cash, card, Cheque, or online payments for any student.\n2. **Check Pending Dues**: Go to **Search Due Fees** to filter by class, section, or fee group.\n3. **Fee Challans**: Generate single or batch printable bank challans from **Fee Challans**.\n4. **Audit & Slips**: Historical due slips and receipts are tracked under **Due Slip History**.`;
      actionLink = "/collect-fees";
      actionLabel = "Open Collect Fees";
    } else if (query.includes('attend') || query.includes('absent') || query.includes('present') || query.includes('punch') || query.includes('biometric')) {
      reply = `**Student & Staff Attendance Tracking:**\n\n1. **Daily Attendance**: Head to **Students** > **Student Attendance** to mark present, absent, late, or half-day with instant WhatsApp/SMS alerts.\n2. **Bulk Upload**: Import attendance from biometric spreadsheets or machine logs via **Bulk Attendance Upload**.\n3. **Hardware Integration**: Real-time biometric machine sync (eSSL, ZKTeco) is managed under **Biometric Settings**.`;
      actionLink = "/students/attendance";
      actionLabel = "Open Student Attendance";
    } else if (query.includes('exam') || query.includes('mark') || query.includes('grade') || query.includes('result') || query.includes('datesheet') || query.includes('cbt')) {
      reply = `**Examinations & Marksheets:**\n\n1. **Offline Exams**: Schedule datesheets, enter marks by class/subject, and record teacher remarks under **Offline Exams**.\n2. **Online Exams (CBT)**: Create computer-based tests with question banks under **Online Examinations**.\n3. **CBC Assessments**: Grade rubrics and competencies from **CBC Academics**.\n4. **Print Marksheets**: Generate comprehensive CBSE report cards from **Offline Exams** > **Generate Marksheet**.`;
      actionLink = "/offline-exams/dashboard";
      actionLabel = "Open Exams Dashboard";
    } else if (query.includes('hostel') || query.includes('room') || query.includes('bed') || query.includes('warden')) {
      reply = `**Hostel & Residential Accommodation:**\n\n1. **Hostel Dashboard**: Monitor live capacity, occupied beds, and available slots across boys and girls wings.\n2. **Student Allocation**: Check-in resident students to specific rooms and beds under **Hostel** > **Student Allocation**.\n3. **Rooms & Tariffs**: Configure AC/Non-AC room types and bed costs under **Manage Rooms**.`;
      actionLink = "/hostel/dashboard";
      actionLabel = "Open Hostel Dashboard";
    } else if (query.includes('transport') || query.includes('bus') || query.includes('driver') || query.includes('route') || query.includes('gps')) {
      reply = `**Transport & Vehicle Management:**\n\n1. **Live GPS Tracking**: Monitor active bus locations and speed in real-time under **Transport** > **Live Vehicle Tracking**.\n2. **Routes & Stops**: Configure pickup/drop routes, timing, and fares in **Manage Routes**.\n3. **Vehicles & Drivers**: Maintain vehicle fitness certificates, insurance renewals, and driver licenses in **Manage Vehicles**.`;
      actionLink = "/transport/dashboard";
      actionLabel = "Open Transport Dashboard";
    } else if (query.includes('admission') || query.includes('enroll') || query.includes('admit') || query.includes('student')) {
      reply = `**Student Admission & Enrollment:**\n\n1. **New Admission**: Go to **Students** > **Student Admission** to complete the 3-step registration form.\n2. **Custom Fields**: Enable optional fields (Aadhaar, blood group, transport flag) under **Settings** > **Admission Form Fields**.\n3. **Student Directory**: Search by photo, class, roll number, or family sibling link from **Student List**.`;
      actionLink = "/students/admission";
      actionLabel = "Admit New Student";
    } else if (query.includes('staff') || query.includes('teacher') || query.includes('payroll') || query.includes('salary') || query.includes('leave') || query.includes('hr')) {
      reply = `**Human Resource & Payroll:**\n\n1. **Staff Directory**: Browse employee profiles, designations, and departments under **Human Resource** > **Staff Directory**.\n2. **Leave Management**: Approve or reject casual and medical leave requests in **Approve Leave**.\n3. **Payroll Generation**: Compute monthly salaries, allowances, and deductions in **Payroll**.`;
      actionLink = "/hr/dashboard";
      actionLabel = "Open HR Dashboard";
    } else if (query.includes('id card') || query.includes('card') || query.includes('badge')) {
      reply = `**ID Cards Designer & Printing:**\n\n1. **Student ID Cards**: Generate individual or bulk ID cards by class/section with live photo and QR code.\n2. **Staff ID Cards**: Print professional employee badges.\n3. **Card Designer**: Customize card dimensions, school logos, and color palettes under **ID Cards** > **Card Designs**.`;
      actionLink = "/id-cards/student";
      actionLabel = "Open Student ID Cards";
    } else if (query.includes('certificate') || query.includes('tc') || query.includes('bonafide') || query.includes('transfer')) {
      reply = `**Certificates & Documentation:**\n\n1. **Transfer Certificate (TC)**: Generate official student exit certificates with serial numbers.\n2. **Bonafide / Character**: Issue study and conduct certificates with verified QR stamps.\n3. **Templates**: Design custom certificate layouts in **Certificates** > **Templates**.`;
      actionLink = "/certificates/documents";
      actionLabel = "Open Certificates";
    } else if (query.includes('notice') || query.includes('broadcast') || query.includes('sms') || query.includes('circular') || query.includes('message')) {
      reply = `**Communication & Broadcasting:**\n\n1. **Notice Board**: Post official circulars visible to parents, teachers, and students.\n2. **Broadcast SMS/WhatsApp**: Send bulk announcements to classes or selected groups from **Compose Broadcast**.\n3. **Image Gallery**: Share event and sports day photos under **Image Gallery**.`;
      actionLink = "/communicate/notice-board";
      actionLabel = "Open Notice Board";
    } else if (matchingArticles.length > 0) {
      const art = matchingArticles[0];
      reply = `Here is a relevant guide from our knowledge base:\n\n### **${art.title}**\n\n${art.summary || art.content.substring(0, 300)}...\n\n*Click the button below to view the full illustrated article.*`;
      actionLink = `/help-center/articles?id=${art._id}`;
      actionLabel = "Read Full Guide";
    } else {
      reply = `I understand! Regarding "${message}":\n\nYou can browse our comprehensive institutional guides in the **Knowledge Base**, search categories, or if you are facing a technical issue, submit a direct **Support Ticket** to our engineering desk for immediate resolution.`;
      actionLink = "/help-center/categories";
      actionLabel = "View Help Categories";
    }

    // Save to conversation history in DB
    let conversation = await AiConversation.findOne({ conversationId: convId });
    if (!conversation) {
      conversation = await AiConversation.create({
        conversationId: convId,
        title: message.length > 30 ? message.substring(0, 30) + '...' : message,
        messages: []
      });
    }

    conversation.messages.push(
      { sender: 'user', text: message, timestamp: new Date() },
      { sender: 'bot', text: reply, actionLink, actionLabel, timestamp: new Date() }
    );
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        reply,
        actionLink,
        actionLabel,
        conversationId: convId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAiConversations = async (req, res, next) => {
  try {
    const conversations = await AiConversation.find().sort({ updatedAt: -1 }).limit(10);
    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    next(error);
  }
};

exports.clearAiConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AiConversation.findOneAndDelete({ conversationId: id });
    res.status(200).json({ success: true, message: 'Conversation cleared' });
  } catch (error) {
    next(error);
  }
};
