# Custom Timetable Creator - User Guide

## Overview

The Custom Timetable Creator allows you to upload your personalized timetable in JSON format. The system will automatically:

- Validate your timetable structure
- Parse subjects, days, time slots, and class metadata
- Generate a dynamic, personalized timetable UI
- Create attendance records for each subject and time slot
- Integrate seamlessly with existing attendance tracking

## Features

### 🎯 Core Capabilities

1. **JSON Upload**: Upload timetables in standardized JSON format
2. **Automatic Validation**: Real-time validation with detailed error messages
3. **Dynamic UI Generation**: Automatically creates visual timetable from your data
4. **Attendance Auto-Generation**: Creates attendance records for all subjects
5. **Seamless Updates**: Re-upload timetables without losing existing attendance data
6. **Template Download**: Get started quickly with a sample template

### 🔒 Security & Data Protection

- User-specific timetable storage
- Secure MongoDB integration
- Protected API endpoints with JWT authentication
- Version tracking for timetable updates
- No data loss on re-uploads

## How to Use

### Method 1: Manual Editor

1. Navigate to the **Timetable** page
2. Click **Manual Editor** button
3. Add subjects one by one with colors and details
4. Build your weekly schedule by adding periods
5. Click **Save Timetable**

### Method 2: JSON Upload (Recommended for Complex Timetables)

1. Navigate to the **Timetable** page
2. Click **Upload JSON** button
3. Download the template by clicking **Download Template**
4. Fill in your timetable data in the JSON file
5. Upload the completed JSON file
6. Enable **Auto-generate Attendance Records** (recommended)
7. Click **Upload Timetable**

## JSON Format Specification

### Complete Structure

```json
{
  "name": "My Timetable",
  "semester": "Fall 2026",
  "academicYear": "2026-2027",
  "subjects": [
    {
      "name": "Mathematics",
      "code": "MATH101",
      "type": "Lecture",
      "color": "#3B82F6",
      "classTime": "09:30-10:30",
      "teacher": "Dr. Smith",
      "room": "Room 201"
    }
  ],
  "schedule": [
    {
      "day": "Monday",
      "periods": [
        {
          "subject": "Mathematics",
          "startTime": "09:30",
          "endTime": "10:30",
          "teacher": "Dr. Smith",
          "room": "Room 201"
        }
      ]
    }
  ]
}
```

### Field Descriptions

#### Root Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Optional | Name of your timetable (default: "My Timetable") |
| `semester` | String | Optional | Current semester (e.g., "Fall 2026") |
| `academicYear` | String | Optional | Academic year (e.g., "2026-2027") |
| `subjects` | Array | **Required** | Array of subject objects |
| `schedule` | Array | **Required** | Array of day schedule objects |

#### Subject Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | **Required** | Subject name (must be unique) |
| `code` | String | Optional | Subject code (e.g., "MATH101") |
| `type` | String | Optional | "Lecture", "Practical", "Tutorial", or "Both" (default: "Lecture") |
| `color` | String | Optional | Hex color code (e.g., "#3B82F6") for visual identification |
| `classTime` | String | Optional | General class time (e.g., "09:30-10:30") |
| `teacher` | String | Optional | Teacher/instructor name |
| `room` | String | Optional | Classroom/lab location |

#### Schedule Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day` | String | **Required** | Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday |
| `periods` | Array | **Required** | Array of period objects (can be empty for days with no classes) |

#### Period Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | String | **Required** | Must match a subject name from subjects array |
| `startTime` | String | **Required** | Start time in HH:MM format (24-hour, e.g., "09:30") |
| `endTime` | String | **Required** | End time in HH:MM format (must be after startTime) |
| `teacher` | String | Optional | Teacher for this specific period |
| `room` | String | Optional | Room for this specific period |

### Available Subject Types

- **Lecture**: Standard 1-hour theory classes
- **Practical**: 2-hour lab/practical sessions
- **Tutorial**: Tutorial/discussion sessions
- **Both**: Combination of lecture and practical

### Available Color Codes

Use these hex codes for subject colors (or choose your own):

- Blue: `#3B82F6`
- Green: `#10B981`
- Amber: `#F59E0B`
- Red: `#EF4444`
- Purple: `#8B5CF6`
- Pink: `#EC4899`
- Teal: `#14B8A6`
- Orange: `#F97316`

## Validation Rules

### ✅ What Gets Validated

1. **JSON Structure**: Must be valid JSON format
2. **Required Fields**: All required fields must be present
3. **Time Format**: Times must be in HH:MM format (24-hour)
4. **Time Logic**: End time must be after start time
5. **Day Names**: Must match exactly (case-sensitive)
6. **Subject References**: All period subjects must exist in subjects array
7. **File Size**: Maximum 5MB
8. **Data Types**: Correct types for all fields

### ❌ Common Validation Errors

1. **"Subject not found in subjects list"**
   - Fix: Ensure every period's subject name matches a subject in your subjects array

2. **"endTime must be after startTime"**
   - Fix: Check your time values; end time should be later than start time

3. **"Time must be in HH:MM format"**
   - Fix: Use 24-hour format with leading zeros (e.g., "09:30", not "9:30")

4. **"Day must be one of Monday, Tuesday..."**
   - Fix: Use exact day names with proper capitalization

5. **"Invalid JSON format"**
   - Fix: Use a JSON validator to check for syntax errors

## Attendance Auto-Generation

When you enable **Auto-generate Attendance Records**:

### For New Timetables
- Creates attendance records for the current week
- All records are marked as "absent" by default
- You can then mark attendance as present/absent as needed

### For Timetable Updates
- Adds new subjects to existing attendance records
- Keeps your previous attendance data intact
- Only adds records for newly added subjects
- Notes indicate "Auto-added after timetable update"

### How It Works

1. System analyzes your schedule
2. Identifies all unique subjects and time slots
3. Creates attendance records for each subject per day
4. Links records to your user account
5. Integrates with existing attendance tracking

## Example Timetables

### Example 1: Simple Schedule

```json
{
  "name": "Engineering Semester 5",
  "semester": "Spring 2026",
  "academicYear": "2025-2026",
  "subjects": [
    {
      "name": "Data Structures",
      "code": "CS301",
      "type": "Lecture",
      "color": "#3B82F6",
      "teacher": "Dr. Johnson"
    },
    {
      "name": "Database Lab",
      "code": "CS302L",
      "type": "Practical",
      "color": "#10B981",
      "teacher": "Prof. Williams"
    }
  ],
  "schedule": [
    {
      "day": "Monday",
      "periods": [
        {
          "subject": "Data Structures",
          "startTime": "09:00",
          "endTime": "10:00",
          "teacher": "Dr. Johnson",
          "room": "LH-101"
        }
      ]
    },
    {
      "day": "Tuesday",
      "periods": [
        {
          "subject": "Database Lab",
          "startTime": "14:00",
          "endTime": "16:00",
          "teacher": "Prof. Williams",
          "room": "Lab-3"
        }
      ]
    },
    {
      "day": "Wednesday",
      "periods": []
    },
    {
      "day": "Thursday",
      "periods": [
        {
          "subject": "Data Structures",
          "startTime": "11:00",
          "endTime": "12:00",
          "teacher": "Dr. Johnson",
          "room": "LH-101"
        }
      ]
    },
    {
      "day": "Friday",
      "periods": []
    },
    {
      "day": "Saturday",
      "periods": []
    }
  ]
}
```

### Example 2: Complex Schedule with Multiple Classes

```json
{
  "name": "Computer Science Full Schedule",
  "semester": "Fall 2026",
  "academicYear": "2026-2027",
  "subjects": [
    {
      "name": "Algorithms",
      "code": "CS401",
      "type": "Lecture",
      "color": "#3B82F6",
      "teacher": "Dr. Smith",
      "room": "LH-201"
    },
    {
      "name": "Machine Learning",
      "code": "CS402",
      "type": "Lecture",
      "color": "#8B5CF6",
      "teacher": "Dr. Brown",
      "room": "LH-202"
    },
    {
      "name": "ML Lab",
      "code": "CS402L",
      "type": "Practical",
      "color": "#EC4899",
      "teacher": "Prof. Davis",
      "room": "AI-Lab"
    },
    {
      "name": "Web Development",
      "code": "CS403",
      "type": "Both",
      "color": "#10B981",
      "teacher": "Prof. Wilson",
      "room": "LH-203"
    }
  ],
  "schedule": [
    {
      "day": "Monday",
      "periods": [
        {
          "subject": "Algorithms",
          "startTime": "09:00",
          "endTime": "10:00",
          "teacher": "Dr. Smith",
          "room": "LH-201"
        },
        {
          "subject": "Machine Learning",
          "startTime": "11:00",
          "endTime": "12:00",
          "teacher": "Dr. Brown",
          "room": "LH-202"
        },
        {
          "subject": "ML Lab",
          "startTime": "14:00",
          "endTime": "16:00",
          "teacher": "Prof. Davis",
          "room": "AI-Lab"
        }
      ]
    },
    {
      "day": "Tuesday",
      "periods": [
        {
          "subject": "Web Development",
          "startTime": "10:00",
          "endTime": "11:00",
          "teacher": "Prof. Wilson",
          "room": "LH-203"
        }
      ]
    },
    {
      "day": "Wednesday",
      "periods": [
        {
          "subject": "Algorithms",
          "startTime": "09:00",
          "endTime": "10:00",
          "teacher": "Dr. Smith",
          "room": "LH-201"
        },
        {
          "subject": "Web Development",
          "startTime": "13:00",
          "endTime": "15:00",
          "teacher": "Prof. Wilson",
          "room": "Web-Lab"
        }
      ]
    },
    {
      "day": "Thursday",
      "periods": [
        {
          "subject": "Machine Learning",
          "startTime": "11:00",
          "endTime": "12:00",
          "teacher": "Dr. Brown",
          "room": "LH-202"
        }
      ]
    },
    {
      "day": "Friday",
      "periods": [
        {
          "subject": "Algorithms",
          "startTime": "09:00",
          "endTime": "10:00",
          "teacher": "Dr. Smith",
          "room": "LH-201"
        }
      ]
    },
    {
      "day": "Saturday",
      "periods": []
    }
  ]
}
```

## Tips & Best Practices

### 📝 Creating Your Timetable

1. **Start with the Template**: Download and modify the template rather than starting from scratch
2. **Use a JSON Editor**: Tools like VS Code provide syntax highlighting and validation
3. **Validate JSON**: Use online JSON validators before uploading
4. **Consistent Naming**: Keep subject names consistent between subjects array and schedule
5. **Color Coding**: Use different colors for different subject types for better visualization
6. **Include Details**: Add teacher and room information for better organization

### 🔄 Updating Timetables

1. **Download Current**: Download your current timetable as JSON before making changes
2. **Backup**: Keep a backup copy of your working timetable
3. **Test Changes**: Make small changes and test before major restructuring
4. **Enable Auto-Generate**: Keep attendance auto-generation enabled to maintain records

### ⚠️ Troubleshooting

1. **Upload Fails**: Check JSON syntax and validation errors in the response
2. **Subjects Missing**: Ensure all period subjects are defined in subjects array
3. **Times Not Valid**: Use 24-hour format with leading zeros
4. **Data Not Showing**: Refresh the page after successful upload
5. **Attendance Issues**: Verify auto-generate option was enabled during upload

## API Endpoints

For advanced users and developers:

### Upload Timetable
```
POST /api/timetable/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "timetableData": { /* your timetable JSON */ },
  "autoGenerateAttendance": true,
  "fileName": "my-timetable.json"
}
```

### Get Template
```
GET /api/timetable/template
Authorization: Bearer <token>
```

### Get Current Timetable
```
GET /api/timetable
Authorization: Bearer <token>
```

## Technical Architecture

### Backend
- **Validation**: `utils/timetableValidator.js` - Comprehensive JSON validation
- **Attendance Generation**: `utils/attendanceGenerator.js` - Auto-creates attendance records
- **Model**: Enhanced Timetable schema with metadata tracking
- **Routes**: RESTful API endpoints with proper error handling

### Frontend
- **Component**: Reusable `TimetableUpload` component
- **Integration**: Seamless integration with existing timetable page
- **UI/UX**: Drag-and-drop upload, real-time preview, validation feedback
- **State Management**: Integrated with DataContext for global state

### Database
- **MongoDB**: Scalable schema design
- **User Linking**: Timetables linked to authenticated users
- **Version Tracking**: Tracks upload history and versions
- **No Data Loss**: Updates preserve existing attendance records

## Support & Feedback

For issues, questions, or suggestions:
1. Check this guide first
2. Review validation error messages
3. Try the template and examples
4. Check console logs for detailed errors

## Future Enhancements

Planned features:
- Export timetable as PDF
- Share timetable with others
- Import from Excel/CSV
- Recurring events support
- Conflict detection
- Mobile app support

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Compatibility**: All modern browsers, Mobile-responsive
