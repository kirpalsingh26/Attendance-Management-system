# System Architecture Overview

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Frontend (Vite + Tailwind)            │  │
│  │  ┌────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐  │  │
│  │  │Landing │  │ Login  │  │Register │  │Dashboard │  │  │
│  │  └────────┘  └────────┘  └─────────┘  └──────────┘  │  │
│  │  ┌────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐  │  │
│  │  │Timetable│ │Attendance│  │Analytics│  │Settings│  │  │
│  │  └────────┘  └──────────┘  └─────────┘  └────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕ HTTP/REST API                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Express.js Backend Server                  │  │
│  │  ┌─────────────┐    ┌──────────────┐                 │  │
│  │  │ Middleware  │    │    Routes    │                 │  │
│  │  │  - CORS     │    │  - Auth      │                 │  │
│  │  │  - JWT Auth │    │  - Timetable │                 │  │
│  │  │  - Parser   │    │  - Attendance│                 │  │
│  │  └─────────────┘    │  - User      │                 │  │
│  │                     └──────────────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕ Mongoose ODM                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  MongoDB Database                     │  │
│  │  ┌────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │ Users  │  │Timetables│  │Attendance│             │  │
│  │  └────────┘  └──────────┘  └──────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Breakdown

### Frontend Architecture

```
Frontend/
├── Context Providers (State Management)
│   ├── AuthContext → User authentication state
│   ├── ThemeContext → Light/Dark mode
│   └── DataContext → Timetable & Attendance data
│
├── Routing (React Router)
│   ├── Public Routes → Landing, Login, Register
│   └── Protected Routes → Dashboard, Timetable, etc.
│
├── Components
│   ├── Shared → Navbar, Button, Input, Card
│   └── Protected → ProtectedRoute wrapper
│
└── Pages
    ├── Landing → Marketing & info
    ├── Auth → Login & Register
    ├── Dashboard → Overview & stats
    ├── Timetable → Create/Edit schedule
    ├── Attendance → Mark daily attendance
    ├── Analytics → Charts & insights
    └── Settings → User preferences
```

### Backend Architecture

```
Backend/
├── Entry Point (index.js)
│   ├── Express app initialization
│   ├── Database connection
│   ├── Middleware setup
│   └── Route mounting
│
├── Models (Mongoose Schemas)
│   ├── User → Authentication & profile
│   ├── Timetable → Schedule & subjects
│   └── Attendance → Daily records
│
├── Routes (API Endpoints)
│   ├── /api/auth → Authentication
│   ├── /api/timetable → CRUD operations
│   ├── /api/attendance → Mark & retrieve
│   └── /api/user → Profile management
│
├── Middleware
│   └── auth.js → JWT verification
│
└── Utils
    └── auth.js → Token generation
```

## 🔄 Data Flow

### Authentication Flow
```
1. User submits credentials
   ↓
2. Frontend sends POST to /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Token included in subsequent requests
```

### Attendance Marking Flow
```
1. User selects date & marks classes
   ↓
2. Frontend sends POST to /api/attendance
   ↓
3. Backend validates user session (JWT)
   ↓
4. Backend saves to MongoDB
   ↓
5. Backend recalculates statistics
   ↓
6. Frontend updates UI with new data
```

### Analytics Display Flow
```
1. User visits Analytics page
   ↓
2. Frontend calls /api/attendance/stats/summary
   ↓
3. Backend aggregates data from MongoDB
   ↓
4. Backend calculates percentages
   ↓
5. Frontend receives JSON data
   ↓
6. Recharts renders visualizations
```

## 🔐 Security Architecture

### Authentication Security
- **Password Hashing:** Bcrypt with salt rounds
- **JWT Tokens:** Signed with secret key
- **HTTP-Only Cookies:** XSS protection
- **Token Expiry:** 7-day default
- **Protected Routes:** Middleware verification

### API Security
- **CORS:** Configured for specific origin
- **Input Validation:** Express-validator
- **Authorization:** User-specific data access
- **Error Handling:** Sanitized error messages

## 🎨 UI/UX Architecture

### Design System
```
Color Palette:
├── Primary → Blue (#3B82F6)
├── Success → Green (#10B981)
├── Warning → Yellow (#F59E0B)
├── Danger → Red (#EF4444)
└── Neutral → Gray scale

Components:
├── Atomic → Button, Input, Card
├── Molecules → Navbar, Forms
└── Organisms → Pages, Layouts

Themes:
├── Light Mode → Clean, professional
└── Dark Mode → Easy on eyes, modern
```

### Responsive Breakpoints
```
Mobile:  < 768px
Tablet:  768px - 1024px
Desktop: > 1024px
```

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  profilePicture: String (URL),
  authProvider: String (local/google/apple),
  theme: String (light/dark),
  createdAt: Date,
  updatedAt: Date
}
```

### Timetable Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  name: String,
  semester: String,
  academicYear: String,
  subjects: [{
    name: String,
    code: String,
    color: String (hex)
  }],
  schedule: [{
    day: String,
    periods: [{
      subject: String,
      startTime: String,
      endTime: String,
      teacher: String,
      room: String
    }]
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  date: Date,
  day: String,
  records: [{
    subject: String,
    status: String (present/absent),
    period: String,
    notes: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting:** React lazy loading
- **Bundling:** Vite's optimized build
- **Caching:** API response caching
- **Lazy Loading:** Images & components

### Backend
- **Database Indexing:** User & date fields
- **Query Optimization:** Lean queries
- **Connection Pooling:** MongoDB driver
- **Error Caching:** Response memoization

## 🔧 Development Tools

### Frontend Stack
```
React 18.x        → UI Library
Vite 6.x         → Build Tool
Tailwind CSS 4.x → Styling
React Router 7.x → Routing
Recharts 2.x     → Charting
Axios 1.x        → HTTP Client
```

### Backend Stack
```
Node.js 16+      → Runtime
Express 5.x      → Framework
MongoDB 8.x      → Database
Mongoose 9.x     → ODM
JWT              → Auth Tokens
Bcrypt           → Encryption
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless API design
- JWT token authentication
- Load balancer ready
- Microservices potential

### Vertical Scaling
- MongoDB sharding support
- Connection pooling
- Caching strategies
- CDN integration ready

## 🎯 Future Enhancements

### Technical
- [ ] Redis caching layer
- [ ] GraphQL API option
- [ ] WebSocket for real-time updates
- [ ] Service worker for offline support

### Features
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Multiple timetable support

---

**Architecture designed for scalability, security, and maintainability** 🚀
