# College Attendance Management System

A modern, full-stack web application for managing college attendance with interactive timetables, real-time analytics, and beautiful UI.

## 🚀 Features

### Frontend Features
- **Beautiful Landing Page** - Modern, responsive landing page with smooth animations
- **Secure Authentication** - Login/Register with traditional forms + Google/Apple OAuth integration
- **Interactive Timetable** - Create and manage weekly class schedules with subjects, times, and teachers
- **Quick Attendance Marking** - Mark attendance with intuitive tick (✓) and cross (✗) interactions
- **Real-time Analytics** - View attendance statistics with interactive bar charts and line graphs
- **Subject-wise Tracking** - Monitor attendance percentage for each subject separately
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Settings Panel** - Update profile picture, username, password, and preferences

### Backend Features
- **RESTful API** - Well-structured Express.js backend
- **MongoDB Database** - Scalable NoSQL database for data storage
- **JWT Authentication** - Secure token-based authentication
- **Password Encryption** - Bcrypt for secure password hashing
- **OAuth Integration** - Ready for Google and Apple authentication
- **CORS Enabled** - Cross-origin resource sharing configured
- **Error Handling** - Comprehensive error handling middleware

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Attendence Management Project"
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file and update the following:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (your secret key)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (for OAuth)
# - APPLE credentials (for OAuth)

# Start MongoDB (if running locally)
mongod

# Start the backend server
npm start

# Or use nodemon for development
npm run dev
```

The backend server will run on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173**

## 🏗️ Project Structure

```
Attendence Management Project/
│
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Timetable.js         # Timetable model
│   │   └── Attendance.js        # Attendance model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── timetable.js         # Timetable CRUD routes
│   │   ├── attendance.js        # Attendance routes
│   │   └── user.js              # User profile routes
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── utils/
│   │   └── auth.js              # Auth helper functions
│   ├── .env                     # Environment variables
│   ├── index.js                 # Server entry point
│   └── package.json
│
└── Frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── index.js         # API client & endpoints
    │   ├── components/
    │   │   ├── Navbar.jsx       # Navigation bar
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── Button.jsx       # Reusable button
    │   │   ├── Card.jsx         # Card component
    │   │   └── Input.jsx        # Input component
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Authentication state
    │   │   ├── ThemeContext.jsx # Theme management
    │   │   └── DataContext.jsx  # Data management
    │   ├── pages/
    │   │   ├── Landing.jsx      # Landing page
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Register.jsx     # Registration page
    │   │   ├── Dashboard.jsx    # Main dashboard
    │   │   ├── Timetable.jsx    # Timetable creator
    │   │   ├── Attendance.jsx   # Attendance marking
    │   │   ├── Analytics.jsx    # Analytics & charts
    │   │   └── Settings.jsx     # User settings
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔐 Environment Variables

Create a `.env` file in the `Backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# OAuth Credentials (Optional - Add when implementing OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id

# Frontend URL
CLIENT_URL=http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Timetable
- `GET /api/timetable` - Get user's timetable
- `POST /api/timetable` - Create timetable
- `PUT /api/timetable/:id` - Update timetable
- `DELETE /api/timetable/:id` - Delete timetable

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:date` - Get attendance by date
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/stats/summary` - Get statistics
- `DELETE /api/attendance/:id` - Delete attendance record

### User
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password

## 🎨 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Recharts** - Charts & graphs
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **date-fns** - Date manipulation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables
- **Passport** - Authentication middleware

## 🚦 Usage Guide

### 1. Register an Account
- Visit the landing page and click "Get Started"
- Fill in your username, email, and password
- Or use Google/Apple OAuth (when configured)

### 2. Create Your Timetable
- Navigate to the "Timetable" page
- Add your subjects with names, codes, and colors
- Create your weekly schedule by adding periods for each day
- Specify time slots, teachers, and room numbers
- Save your timetable

### 3. Mark Attendance
- Go to the "Attendance" page
- Select the date
- For each class, click the ✓ (tick) for Present or ✗ (cross) for Absent
- Click "Save Attendance"

### 4. View Analytics
- Visit the "Analytics" page to see:
  - Overall attendance percentage
  - Subject-wise breakdown with charts
  - Attendance trends over time
  - Detailed statistics table

### 5. Customize Settings
- Access the "Settings" page to:
  - Update profile picture
  - Change username
  - Modify password
  - Switch between light/dark themes

## 🔧 Development Scripts

### Backend
```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🌟 Key Features Explained

### Responsive Design
The application is fully responsive and works on all devices from mobile phones to large desktop screens.

### Dark Mode
Toggle between light and dark themes with smooth transitions. Theme preference is saved in localStorage.

### Real-time Calculations
Attendance percentages are calculated in real-time as you mark attendance, showing instant feedback.

### Visual Feedback
Color-coded indicators show attendance status:
- **Green** - Good attendance (≥75%)
- **Yellow** - Average attendance (60-74%)
- **Red** - Poor attendance (<60%)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies for token storage
- Protected API routes
- CORS configuration
- Input validation
- XSS protection

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for students

## 🐛 Known Issues & Future Enhancements

### Planned Features
- [ ] PDF export of attendance reports
- [ ] Email notifications for low attendance
- [ ] Mobile app (React Native)
- [ ] Bulk attendance marking
- [ ] Calendar view for attendance
- [ ] Import/Export timetable
- [ ] Multiple timetable support
- [ ] Attendance goals and reminders

### Notes
- OAuth buttons are UI-only. Configure credentials in `.env` to enable
- Ensure MongoDB is running before starting the backend
- First user registration creates an account in the database

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Happy Coding! 🎓📚**
