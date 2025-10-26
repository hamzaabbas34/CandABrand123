# Product Dashboard Backend

Multi-website product management backend built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_atlas_uri
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
PORT=5000
FRONTEND_URL=http://localhost:5173
```

3. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Upload
- `POST /api/upload/validate` - Validate Excel + images before upload
- `POST /api/upload/bulk` - Bulk upload products

### Products
- `GET /api/products` - Get products with filters (brand, year, version, division, style, pagination)
- `GET /api/products/:id` - Get single product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Versions
- `GET /api/versions` - Get all versions
- `DELETE /api/versions/:brand/:year/:versionName` - Delete version
- `DELETE /api/versions/year/:brand/:year` - Delete year

### Publish
- `POST /api/publish` - Publish a version
- `GET /api/publish/:brand` - Get published version

## Directory Structure

```
backend/
├── controllers/      # Request handlers
├── models/          # Mongoose schemas
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
└── server.js        # Main server file
```

## File Upload Structure

Images are stored in:
```
uploads/{brand}/{year}/{versionName}/{division}/{style}/
```

## Features

- Excel parsing with dynamic color columns
- Image matching with style variations (STYLE, STYLE (1), STYLE_1, STYLE-1)
- Bulk product insertion
- Version publishing with MongoDB transactions
- Structured file storage
- Comprehensive validation

