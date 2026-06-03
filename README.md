# TaskFlow

TaskFlow is a Kanban work management system built with the MERN stack. The project includes board collaboration, card/task management, checklist, activity log, board dashboard, admin console, authentication, email verification, file upload, and real-time socket integration.

## Project Structure

```text
TaskFlow_Final_Project/
+-- final-full-stack-mern-advanced-api/   # Node.js, Express, MongoDB API
+-- final-full-stack-mern-advanced-web/   # React, Vite, Material UI client
```

## Requirements

- Node.js 18 or newer
- Yarn
- MongoDB Atlas or local MongoDB
- Optional services:
  - Brevo account for email verification
  - Cloudinary account for avatar/card cover upload

## 1. Clone Project

```bash
git clone https://github.com/DdowDev/TaskFlow_Final_Project.git
cd TaskFlow_Final_Project
```

## 2. Backend Setup

```bash
cd final-full-stack-mern-advanced-api
yarn install
```

Create the backend environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Update `.env`:

```env
MONGODB_URI='your_mongodb_connection_string'
DATABASE_NAME='taskflow'

LOCAL_DEV_APP_HOST='localhost'
LOCAL_DEV_APP_PORT=8017

AUTHOR='TaskFlow'

WEBSITE_DOMAIN_DEVELOPMENT='http://localhost:5173'
WEBSITE_DOMAIN_PRODUCTION='http://localhost:5173'

BREVO_API_KEY=''
ADMIN_EMAIL_ADDRESS=''
ADMIN_EMAIL_NAME='TaskFlow Team'

ACCESS_TOKEN_SECRET_SIGNATURE='your_access_token_secret'
ACCESS_TOKEN_LIFE='1h'

REFRESH_TOKEN_SECRET_SIGNATURE='your_refresh_token_secret'
REFRESH_TOKEN_LIFE='14d'

CLOUDINARY_CLOUD_NAME=''
CLOUDINARY_API_KEY=''
CLOUDINARY_API_SECRET=''
```

Notes:

- `MONGODB_URI`, `ACCESS_TOKEN_SECRET_SIGNATURE`, and `REFRESH_TOKEN_SECRET_SIGNATURE` are required.
- Brevo variables are required if email verification is used.
- Cloudinary variables are required if avatar or cover image upload is used.

Run backend:

```bash
yarn dev
```

Backend URL:

```text
http://localhost:8017
```

## 3. Frontend Setup

Open a second terminal:

```bash
cd final-full-stack-mern-advanced-web
yarn install
yarn dev
```

Frontend URL:

```text
http://localhost:5173
```

The frontend in development mode calls the backend at:

```text
http://localhost:8017
```

## 4. Create A System Admin Account

Register a normal user from the web app first. Then update that user in MongoDB:

```javascript
db.users.updateOne(
  { email: 'admin@example.com' },
  {
    $set: {
      role: 'system_admin',
      isActive: true,
      isBlocked: false,
      updatedAt: Date.now()
    }
  }
)
```

After logging in with this account, the app will redirect to:

```text
/admin/dashboard
```

## 5. Main Features

- Authentication and email verification
- Board owner/member permission
- Kanban board, column, and card management
- Card task fields: status, priority, start date, due date, completed time
- Checklist inside cards
- Comment and system activity log
- Board dashboard with task statistics
- Board filter and search
- System admin dashboard, user management, and board overview
- Socket integration for board invitation events

## 6. Useful Commands

Backend:

```bash
cd final-full-stack-mern-advanced-api
yarn dev
yarn lint
yarn build
```

Frontend:

```bash
cd final-full-stack-mern-advanced-web
yarn dev
yarn lint
yarn build
```

## 7. MongoDB Indexes For Better Dashboard/Filter Performance

Run these indexes in MongoDB if the dataset grows:

```javascript
db.cards.createIndex({ boardId: 1, _destroy: 1, isArchived: 1 })
db.cards.createIndex({ boardId: 1, status: 1 })
db.cards.createIndex({ boardId: 1, priority: 1 })
db.cards.createIndex({ boardId: 1, dueDate: 1 })
db.cards.createIndex({ boardId: 1, memberIds: 1 })
```

## 8. Troubleshooting

If the frontend cannot call the backend:

- Make sure backend is running on `http://localhost:8017`.
- Make sure frontend is running on `http://localhost:5173`.
- Check `WEBSITE_DOMAIN_DEVELOPMENT` in backend `.env`.
- Check MongoDB connection string and network access.

If email verification does not work:

- Check `BREVO_API_KEY`.
- Check `ADMIN_EMAIL_ADDRESS`.
- Check spam inbox.

If image upload does not work:

- Check Cloudinary credentials in backend `.env`.

## 9. Production Build

Backend:

```bash
cd final-full-stack-mern-advanced-api
yarn build
```

Frontend:

```bash
cd final-full-stack-mern-advanced-web
yarn build
```

The frontend production API URL is configured in:

```text
final-full-stack-mern-advanced-web/src/utils/constants.js
```

Update it to match the deployed backend URL before deploying production.
