const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection - placeholder for connection string
// Replace '<your_mongodb_connection_string>' with actual MongoDB URI
const MONGODB_URI = '<your_mongodb_connection_string>'; // Do not insert the key yet as per instructions

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Post Schema and Model
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  published: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.model('Post', postSchema);

// API Routes

// Get all published posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all posts (including drafts) - for admin use
app.get('/api/posts/admin/all', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, published } = req.body;
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (!author || author.trim() === '') {
      return res.status(400).json({ message: 'Author is required' });
    }
    
    const post = new Post({
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      published: published !== undefined ? !!published : false
    });
    
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, author, published } = req.body;
    
    // Validation
    if (title !== undefined && (title === null || title.trim() === '')) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }
    if (content !== undefined && (content === null || content.trim() === '')) {
      return res.status(400).json({ message: 'Content cannot be empty' });
    }
    if (author !== undefined && (author === null || author.trim() === '')) {
      return res.status(400).json({ message: 'Author cannot be empty' });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (author !== undefined) updateData.author = author.trim();
    if (published !== undefined) updateData.published = !!published;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
