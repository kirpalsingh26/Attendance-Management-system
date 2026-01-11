# Quick Start Guide 🚀

Get your College Attendance Management System up and running in minutes!

## Prerequisites Check ✅

Before starting, ensure you have:
- [x] Node.js installed (v16+) - Check with: `node --version`
- [x] MongoDB installed or MongoDB Atlas account
- [x] Terminal/Command prompt access

## Step-by-Step Setup

### Step 1: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**Option B - MongoDB Atlas:**
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `Backend/.env` with your connection string

### Step 2: Start Backend Server

Open Terminal/Command Prompt and run:

```bash
# Navigate to Backend directory
cd Backend

# Start the server
npm start

# You should see:
# 🚀 Server is running on http://localhost:5000
# MongoDB Connected: <your-connection>
```

### Step 3: Start Frontend Application

Open a **NEW** Terminal/Command Prompt window and run:

```bash
# Navigate to Frontend directory
cd Frontend

# Start the dev server
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

### Step 4: Access the Application

Open your browser and visit: **http://localhost:5173**

## First Time Setup 🎯

1. **Landing Page** - You'll see the welcome screen
2. **Register** - Click "Get Started" to create an account
3. **Create Timetable** - Add your subjects and weekly schedule
4. **Mark Attendance** - Start tracking your classes!

## Default Ports

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Troubleshooting 🔧

### Backend won't start?
- ✅ Check if MongoDB is running
- ✅ Verify `.env` file exists in Backend folder
- ✅ Run `npm install` in Backend directory

### Frontend shows errors?
- ✅ Check if Backend is running
- ✅ Run `npm install` in Frontend directory
- ✅ Clear browser cache

### Can't connect to database?
- ✅ Verify MONGODB_URI in `.env`
- ✅ Check MongoDB service is running
- ✅ Verify network connection (for Atlas)

## Quick Commands Reference

```bash
# Backend
cd Backend
npm start              # Start server
npm run dev           # Start with auto-reload

# Frontend  
cd Frontend
npm run dev           # Start dev server
npm run build         # Build for production

# MongoDB
mongod                # Start MongoDB locally
mongo                 # Open MongoDB shell
```

## Environment Variables

Make sure `Backend/.env` contains:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-management
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

## Test the Setup

1. **Backend Health Check:**
   - Visit: http://localhost:5000/api/health
   - Should see: `{"message": "College Attendance Management API is running", ...}`

2. **Frontend Loading:**
   - Visit: http://localhost:5173
   - Should see the landing page with "Attendance Pro"

## Next Steps 📚

1. ✅ Register your account
2. ✅ Create your timetable
3. ✅ Add subjects
4. ✅ Mark daily attendance
5. ✅ View analytics

## Need Help?

- Check the main README.md for detailed documentation
- Ensure all dependencies are installed
- Verify both servers are running
- Check console for error messages

---

**You're all set! Happy tracking! 🎓**
