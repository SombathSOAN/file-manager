# Railway Image File Manager

A complete image file management system built with Next.js and deployed on Railway.

## Features

- ✅ Upload multiple images (drag & drop or file picker)
- ✅ Grid and list view modes
- ✅ Image preview with metadata
- ✅ Search and filter images
- ✅ Delete images
- ✅ PostgreSQL database storage
- ✅ Railway file system storage
- ✅ Responsive design

## Railway Deployment

### 1. Environment Variables
Set these in your Railway dashboard:

\`\`\`
DATABASE_PUBLIC_URL=your_railway_postgres_url
UPLOAD_DIR=/app/uploads
NODE_ENV=production
\`\`\`

### 2. Database Setup
After deployment, visit your app and click "Setup Database" to create the required table.

### 3. Supported Image Formats
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG
- BMP

## Local Development

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your database URL
\`\`\`

3. Run development server:
\`\`\`bash
npm run dev
\`\`\`

## Database Schema

The app creates an `images` table with:
- `id` (UUID, primary key)
- `name` (generated filename)
- `original_name` (original filename)
- `file_path` (storage path)
- `file_size` (bytes)
- `mime_type` (image type)
- `uploaded_at` (timestamp)

## API Endpoints

- `POST /api/upload` - Upload image
- `GET /api/images` - List all images
- `DELETE /api/images/[id]` - Delete image
- `GET /api/files/[filename]` - Serve image file
- `POST /api/setup-db` - Setup database table
