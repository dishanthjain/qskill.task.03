// Blog Management Frontend JavaScript

class BlogManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.currentView = 'home'; // home, detail, create, edit
        this.currentPostId = null;
        this.editingPostId = null;
        this.posts = [];
        
        // Bind methods
        this.fetchPosts = this.fetchPosts.bind(this);
        this.fetchPostById = this.fetchPostById.bind(this);
        this.createPost = this.createPost.bind(this);
        this.updatePost = this.updatePost.bind(this);
        this.deletePost = this.deletePost.bind(this);
        this.showView = this.showView.bind(this);
        this.renderHomeView = this.renderHomeView.bind(this);
        this.renderDetailView = this.renderDetailView.bind(this);
        this.renderFormView = this.renderFormView.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up navigation event listeners
        document.addEventListener('click', (e) => {
            if (e.target.id === 'homeLink') {
                e.preventDefault();
                this.showView('home');
            }
            if (e.target.id === 'createPostLink') {
                e.preventDefault();
                this.showView('create');
            }
        });
        
        // Initial load
        this.fetchPosts();
        this.showView('home');
    }
    
    // API Methods
    async fetchPosts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            this.posts = await response.json();
            this.renderHomeView();
        } catch (error) {
            console.error('Error fetching posts:', error);
            this.renderHomeView();
        }
    }
    
    async fetchPostById(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts/${id}`);
            if (!response.ok) throw new Error('Failed to fetch post');
            return await response.json();
        } catch (error) {
            console.error('Error fetching post by ID:', error);
            throw error;
        }
    }
    
    async createPost(postData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            
            if (!response.ok) throw new Error('Failed to create post');
            const newPost = await response.json();
            this.posts.push(newPost);
            return newPost;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }
    
    async updatePost(id, postData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            
            if (!response.ok) throw new Error('Failed to update post');
            const updatedPost = await response.json();
            
            // Update in local state
            const index = this.posts.findIndex(post => post._id === id);
            if (index !== -1) {
                this.posts[index] = updatedPost;
            }
            
            return updatedPost;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }
    
    async deletePost(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/posts/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete post');
            
            // Remove from local state
            this.posts = this.posts.filter(post => post._id !== id);
            
            // If we were viewing the deleted post, go home
            if (this.currentPostId === id) {
                this.showView('home');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
    
    // View Management
    showView(view) {
        // Hide all views
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        
        // Show the requested view
        const viewElement = document.getElementById(`${view}View`);
        if (viewElement) {
            viewElement.classList.add('active');
        } else {
            // If view element doesn't exist yet, render it
            this.renderView(view);
        }
        
        this.currentView = view;
        
        // Update active nav link
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        if (view === 'home') {
            document.getElementById('homeLink').classList.add('active');
        } else if (view === 'create' || view === 'edit') {
            document.getElementById('createPostLink').classList.add('active');
        }
    }
    
    renderView(view) {
        const app = document.getElementById('app');
        
        if (view === 'home') {
            app.innerHTML = '<div id="homeView" class="view active"></div>';
            this.renderHomeView();
        } else if (view === 'detail') {
            app.innerHTML = '<div id="detailView" class="view active"></div>';
            this.renderDetailView();
        } else if (view === 'create' || view === 'edit') {
            app.innerHTML = '<div id="formView" class="view active"></div>';
            this.renderFormView();
        }
    }
    
    // Render Methods
    renderHomeView() {
        const container = document.getElementById('homeView');
        if (!container) return;
        
        const publishedPosts = this.posts.filter(post => post.published);
        
        if (publishedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">No published posts yet. Create a new post to get started!</div>
            `;
            return;
        }
        
        container.innerHTML = `
            <h2>Latest Posts</h2>
            <div class="posts-grid">
                ${publishedPosts.map(post => `
                    <div class="post-card ${post.published ? '' : 'draft'} ${this.editingPostId === post._id ? 'editing' : ''}" data-id="${post._id}">
                        <div class="post-image">
                            ${post.published ? 'Published' : 'Draft'}
                        </div>
                        <div class="post-content">
                            <h2>${post.title}</h2>
                            <p>${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                        </div>
                        <div class="post-meta">
                            <span>By ${post.author}</span>
                            <span class="post-status ${post.published ? 'published' : 'draft'}">
                                ${post.published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add click listeners to post cards
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons (we'll add those later)
                if (e.target.closest('.post-actions')) return;
                
                const postId = card.dataset.id;
                this.currentPostId = postId;
                this.fetchPostById(postId).then(post => {
                    this.showView('detail');
                }).catch(error => {
                    alert('Failed to load post: ' + error.message);
                });
            });
        });
    }
    
    renderDetailView() {
        const container = document.getElementById('detailView');
        if (!container) return;
        
        const post = this.posts.find(p => p._id === this.currentPostId);
        if (!post) {
            container.innerHTML = '<div class="error">Post not found</div>';
            return;
        }
        
        const formattedDate = new Post(post.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        container.innerHTML = `
            <div class="post-detail">
                <div class="post-detail-header">
                    <h1>${post.title}</h1>
                </div>
                <div class="post-detail-meta">
                    <span>By ${post.author}</span>
                    <span>${formattedDate}</span>
                    <span class="post-status ${post.published ? 'published' : 'draft'}">
                        ${post.published ? 'Published' : 'Draft'}
                    </span>
                </div>
                <div class="post-detail-content">
                    ${post.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
                </div>
                <div class="post-detail-footer">
                    <div class="post-detail-actions">
                        <button class="btn-secondary" onclick="blogManager.showView('home')">Back to Posts</button>
                        ${!post.published ? `<button class="btn-primary" onclick="blogManager.publishPost('${post._id}')">Publish</button>` : ''}
                        <button class="btn-secondary" onclick="blogManager.editPost('${post._id}')">Edit Post</button>
                        <button class="btn-danger" onclick="blogManager.deletePostConfirm('${post._id}')">Delete Post</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFormView() {
        const container = document.getElementById('formView');
        if (!container) return;
        
        const isEditing = this.editingPostId !== null;
        const post = isEditing ? this.posts.find(p => p._id === this.editingPostId) : null;
        
        container.innerHTML = `
            <div class="post-form">
                <h2>${isEditing ? 'Edit Post' : 'Create New Post'}</h2>
                <form id="postForm">
                    <div class="form-group">
                        <label for="postTitle">Title</label>
                        <input type="text" id="postTitle" placeholder="Enter post title" 
                               value="${post ? post.title : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="postAuthor">Author</label>
                        <input type="text" id="postAuthor" placeholder="Enter author name" 
                               value="${post ? post.author : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="postContent">Content</label>
                        <textarea id="postContent" placeholder="Write your post content here..." 
                                  required>${post ? post.content : ''}</textarea>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="postPublished" ${post && post.published ? 'checked' : ''}>
                        <label for="postPublished">Publish this post</label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="blogManager.showView('home')">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            ${isEditing ? 'Update Post' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Add form submit listener
        const form = document.getElementById('postForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit);
        }
    }
    
    // Form Handling
    handleFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('postTitle').value.trim();
        const author = document.getElementById('postAuthor').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const published = document.getElementById('postPublished').checked;
        
        // Validation
        if (!title) {
            alert('Please enter a title');
            return;
        }
        if (!author) {
            alert('Please enter an author');
            return;
        }
        if (!content) {
            alert('Please enter content');
            return;
        }
        
        const postData = { title, author, content, published };
        
        if (this.editingPostId) {
            // Update existing post
            this.updatePost(this.editingPostId, postData)
                .then(() => {
                    this.editingPostId = null;
                    this.showView('home');
                })
                .catch(error => {
                    alert('Failed to update post: ' + error.message);
                });
        } else {
            // Create new post
            this.createPost(postData)
                .then(() => {
                    this.showView('home');
                })
                .catch(error => {
                    alert('Failed to create post: ' + error.message);
                });
        }
    }
    
    // Post Actions
    editPost(id) {
        this.editingPostId = id;
        this.showView('edit');
    }
    
    async publishPost(id) {
        try {
            const post = this.posts.find(p => p._id === id);
            if (!post) throw new Error('Post not found');
            
            const updatedPost = await this.updatePost(id, {
                ...post,
                published: true
            });
            
            this.showView('detail');
        } catch (error) {
            alert('Failed to publish post: ' + error.message);
        }
    }
    
    async deletePostConfirm(id) {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                await this.deletePost(id);
                this.showView('home');
            } catch (error) {
                alert('Failed to delete post: ' + error.message);
            }
        }
    }
}

// Initialize the blog manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});
