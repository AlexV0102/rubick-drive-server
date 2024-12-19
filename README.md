# Rubick drive server

### Overview

The backend is built using **NestJS** and serves as the API for the application. It includes file upload, retrieval, permissions, and other file management features.

### Features

- File upload with storage on disk.
- Retrieve files by their original name or ID.
- Manage file permissions and visibility.
- Serve files with original filenames.

### Prerequisites

- Node.js (v20 or later)
- yarn
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   git clone <backend-repo-url>
   cd backend
   ```

2. Install dependencies:

   ```bash
   yarn
   ```

3. Create a `.env` file in the root directory with the following:

   ```env
   MONGO_URI=mongodb://localhost:27017/your-database
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-jwt
   GOOGLE_CLIENT_ID=
   PORT=3000
   GOOGLE_CLIENT_SECRET=
   ```

4. Start the application:
   ```bash
   yarn start:dev
   ```

### API Endpoints

Go to http://localhost:3000/api for api documentation when starting application ( Swagger )

### In progress

- Using cloud storage
- Image/videos compression
- Hosting

### Folder Structure

```
backend/
├── src/
│   ├── feature_name/
│   │   ├── feature_name.controller.ts
│   │   ├── feature_name.service.ts
│   │   ├── schemas/
│   │   │   └── feature_name.schema.ts
│   ├── auth/
│   ├── decorators/
│   ├── main.ts
├── uploads/
├── .env
```

---
