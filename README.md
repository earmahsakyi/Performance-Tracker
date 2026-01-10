## Trackademy – Learning & Progress Tracking Platform
Trackademy is a modern learning management and progress-tracking platform built to help students learn Full-Stack Web Development (MERN) through structured courses, real projects, and active collaboration.
It is designed both as:
-A student learning portal
-A teaching & course management system for instructors

---
## Landing Page

<img width="1920" height="972" alt="landing page" src="https://github.com/user-attachments/assets/0d2806c6-e097-4ef2-9fba-f8cb5e25ca4c" />

<img width="1920" height="975" alt="l2" src="https://github.com/user-attachments/assets/bc10f2b8-1360-4516-a442-b39b3ee8f84f" />

## Student Dashboard

<img width="1920" height="1080" alt="Track Das" src="https://github.com/user-attachments/assets/73b2e363-8426-45ce-acc0-c611adbef09e" />

<img width="1920" height="1080" alt="course lib" src="https://github.com/user-attachments/assets/9b6fc653-9239-44a6-8cbc-4dcf1e92f5ed" />

## student Groups

<img width="1920" height="1080" alt="study groups" src="https://github.com/user-attachments/assets/cf1574c8-5802-4138-8958-c5935a01654e" />

## Admin Dashboard
<img width="1920" height="966" alt="admin" src="https://github.com/user-attachments/assets/77fefc2b-df96-4d87-9d9e-d1fd9c4fc94f" />







---
## 🌐 Project Overview

Trackademy’s core mission is to:
-Teach HTML, CSS, JavaScript, MERN, and UI/UX using real projects
-Help students track learning progress
-Encourage collaboration through study groups and discussions
-Prepare students for real-world development and careers

## The platform consists of:
-A student-facing learning dashboard
-A secure admin/instructor panel
-A real-time collaboration & messaging system

---
## 🧱 Tech Stack
## Frontend
-React (Vite)
-Tailwind CSS
-Framer Motion
-TypeAnimation
-Socket.io Client

## Backend
-Node.js
-Express
-MongoDB + Mongoose
-JWT Authentication
-bcrypt (password hashing)
-Real-Time
-Socket.io – group chat, typing indicators, online presence

## Security
-Helmet – secure HTTP headers
-express-rate-limit – API abuse protection
-JWT-based auth
-Role-based access control (Admin / Student)

## Cloud & Deployment
-Railway – backend & full-stack deployment
-AWS S3 – file uploads (admin/student assets)
-Environment-based configuration

---
🗂️ Core Features
## Student Features

-Course enrollment
-Structured learning modules
-Progress tracking
-Study groups
-Group chat & discussions
-Real-time typing indicators
-Announcements & deadlines
-Certificates (planned / implemented)

## Admin / Instructor Features

-Create & manage courses
-Publish lessons and modules
-Manage students
-Post announcements & deadlines
-Moderate forums & discussions
-Track engagement and activity

---
##  Real-Time Group Chat
-Trackademy includes advanced group chat features:
-Secure Socket.io authentication
-Group-based chat rooms
-Typing indicators
-Message reactions
-Mentions (@user)
-Read receipts
-Online/offline presence tracking

## Authentication & Security
-JWT authentication (HTTP & Socket.io)
-Password hashing with bcrypt
-Rate-limiting on API routes
-IP tracking behind proxies
-Helmet CSP configuration
-Secure environment variables
-Account protection against brute-force attacks

---
## 📁 Environment Variables

Create a .env file in the backend root:
```env
PORT=5000
DATABASE_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your resend api key
EMAIL_FROM=noreply@domain
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name
```

---
## Running the Project Locally
## At the root folder directory  in your terminal 
npm run dev 

## Deployment
```
-Deployed using Railway
-Frontend served via Express static build
-Environment variables managed via Railway dashboard
-MongoDB Atlas for database hosting
```

## Future Enhancements
```
-Video lesson integration
-Assignment submissions
-Automated grading
-Instructor analytics dashboard
-Payment & subscription system
```

## 📄 License

This project is proprietary and built for educational and commercial use under Trackademy.
Unauthorized copying or redistribution is not permitted.
