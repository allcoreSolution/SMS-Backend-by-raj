const mongoose = require('mongoose');

// 1. Knowledge Base Category Schema
const kbCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'], 
    trim: true, 
    unique: true 
  },
  slug: { 
    type: String, 
    trim: true 
  },
  icon: { 
    type: String, 
    default: 'Book' 
  },
  parentCategory: { 
    type: String, 
    default: '— None (Root) —' 
  },
  description: { 
    type: String, 
    default: '' 
  },
  visibility: { 
    type: String, 
    enum: ['Public', 'Internal', 'Private'], 
    default: 'Public' 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  }
}, { timestamps: true });

// 2. Knowledge Base Article Schema
const kbArticleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Article title is required'], 
    trim: true 
  },
  slug: { 
    type: String, 
    trim: true 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'] 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'KbCategory' 
  },
  summary: { 
    type: String, 
    default: '' 
  },
  content: { 
    type: String, 
    required: [true, 'Article content is required'] 
  },
  author: { 
    type: String, 
    default: 'ACS Support Team' 
  },
  status: { 
    type: String, 
    enum: ['Published', 'Draft', 'Archived'], 
    default: 'Published' 
  },
  visibility: { 
    type: String, 
    enum: ['Public', 'Internal'], 
    default: 'Public' 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  helpfulVotes: { 
    type: Number, 
    default: 0 
  },
  unhelpfulVotes: { 
    type: Number, 
    default: 0 
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  featured: { 
    type: Boolean, 
    default: false 
  },
  attachments: [{
    name: { type: String },
    url: { type: String },
    size: { type: String }
  }]
}, { timestamps: true });

// 3. AI Chatbot Conversation History Schema
const aiConversationSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  title: { 
    type: String, 
    default: 'New Help Session' 
  },
  messages: [{
    sender: { 
      type: String, 
      enum: ['user', 'bot'], 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    actionLink: { 
      type: String 
    },
    actionLabel: { 
      type: String 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

const KbCategory = mongoose.models.KbCategory || mongoose.model('KbCategory', kbCategorySchema);
const KbArticle = mongoose.models.KbArticle || mongoose.model('KbArticle', kbArticleSchema);
const AiConversation = mongoose.models.AiConversation || mongoose.model('AiConversation', aiConversationSchema);

module.exports = {
  KbCategory,
  KbArticle,
  AiConversation
};
