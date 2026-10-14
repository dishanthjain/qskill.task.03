# Blog Management Website

A full-stack blog management website built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- View published blog posts on the home page
- View individual post details
- Create new blog posts (with author, title, content)
- Edit existing blog posts
- Delete blog posts
- Publish/unpublish posts
- Responsive design
- Form validation
- MongoDB for data persistence

## Technology Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: MongoDB

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure MongoDB connection**:
   - Open `server.js`
   - Replace `<your_mongodb_connection_string>` with your actual MongoDB URI
   - Note: As per instructions, do not insert the key yet in this version

3. **Start the application**:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

## API Endpoints

- `GET /api/posts` - Get all published posts
- `GET /api/posts/admin/all` - Get all posts (including drafts) for admin
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `GET /health` - Health check endpoint

## Project Structure

```
qskill task 3/
├── public/                 # Frontend static files
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Stylesheet
│   └── script.js           # Frontend JavaScript
├── server.js               # Backend server
├── package.json            # Project metadata and dependencies
└── README.md               # This file
```

## Notes

- The MongoDB connection string is intentionally left as a placeholder (`<your_mongodb_connection_string>`) as per instructions
- To use the application, you'll need to:
  1. Have MongoDB installed and running (or use MongoDB Atlas)
  2. Replace the placeholder in `server.js` with your actual MongoDB connection URI
  3. Start the server

## Future Enhancements

- User authentication and authorization
- Commenting system
- Categories and tags
- Search functionality
- Rich text editor
- Image upload capability
- Pagination for post listings
- Unit and integration tests
