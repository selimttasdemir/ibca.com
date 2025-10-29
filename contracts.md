# API Contracts & Integration Plan

## Backend API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password, returns JWT token
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)

### Announcements
- `GET /api/announcements` - Get all announcements (public)
- `GET /api/announcements/{id}` - Get single announcement (public)
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/{id}` - Update announcement (admin only)
- `DELETE /api/announcements/{id}` - Delete announcement (admin only)
- `POST /api/announcements/upload-image` - Upload announcement image (admin only)

### Courses
- `GET /api/courses` - Get all courses (public)
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/{id}` - Update course (admin only)
- `DELETE /api/courses/{id}` - Delete course (admin only)

### Publications
- `GET /api/publications` - Get all publications (public)
- `POST /api/publications` - Create publication (admin only)
- `PUT /api/publications/{id}` - Update publication (admin only)
- `DELETE /api/publications/{id}` - Delete publication (admin only)
- `POST /api/publications/upload-pdf` - Upload PDF (admin only)

### Gallery
- `GET /api/gallery` - Get all gallery items (public)
- `POST /api/gallery` - Create gallery item (admin only)
- `DELETE /api/gallery/{id}` - Delete gallery item (admin only)
- `POST /api/gallery/upload-photo` - Upload photo (admin only)

### CV
- `GET /api/cv` - Get CV information (public)
- `PUT /api/cv` - Update CV (admin only)
- `POST /api/cv/upload-pdf` - Upload CV PDF (admin only)
- `POST /api/cv/upload-photo` - Upload CV photo (admin only)

### Analytics
- `GET /api/analytics` - Get site analytics (admin only)

## Frontend Integration Tasks

### 1. Replace Mock Data with API Calls

**mockData.js locations to update:**
- `/app/frontend/src/data/mockData.js` - Remove this file or keep for fallback
- Create new `/app/frontend/src/services/api.js` for API calls

### 2. API Service Layer
Create centralized API service with:
- Axios instance with base URL
- Auth token management
- Error handling
- Request/response interceptors

### 3. Components to Update

**HomePage:**
- Fetch announcements from API
- Fetch gallery items for slider

**CVPage:**
- Fetch CV data from API

**CoursesPage:**
- Fetch courses from API

**PublicationsPage:**
- Fetch publications from API

**GalleryPage:**
- Fetch gallery items from API

**AdminDashboard:**
- Connect all CRUD operations to API
- File upload integration
- Form submissions

### 4. Authentication Flow
- Login page sends credentials to `/api/auth/login`
- Store JWT token in localStorage
- Add token to all authenticated requests
- Redirect on 401 errors

### 5. File Upload Implementation
- Use FormData for file uploads
- Show upload progress
- Handle errors
- Update UI after successful upload

## Database Models (Already Created)
- User (admin authentication)
- Announcement (with images)
- Course
- Publication (with PDF)
- GalleryItem (photos + YouTube videos)
- CV (with PDF)
- Analytics

## Current Status
✅ Backend API fully implemented
✅ Database models created (SQLite)
✅ Authentication system working
✅ File upload system with image optimization
✅ Admin user created (username: admin, password: admin123)
🔄 Frontend needs to be connected to backend
