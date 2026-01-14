# Quick Start Guide - Custom Timetable Upload

## 🚀 Two Ways to Create Your Timetable

### Method 1: Upload JSON File (Recommended for Beginners)

#### Step 1: Download the Template
1. Navigate to **Timetable** page in your application
2. Click the **"Upload JSON"** button  
3. Select **"Upload File"** tab
4. Click **"Download Template"** button
5. Save the `timetable-template.json` file

#### Step 2: Fill in Your Timetable
Open the template file in any text editor and customize it with your schedule.

#### Step 3: Upload Your File
1. Go back to the **Timetable** page
2. Either:
   - **Drag and drop** your JSON file into the upload area, OR
   - **Click** the upload area to browse and select your file
3. Review the preview showing your subjects and periods
4. Ensure **"Auto-generate Attendance Records"** is checked
5. Click **"Upload Timetable"**
6. ✅ Done!

---

### Method 2: Paste/Edit JSON Directly (For Advanced Users)

#### Step 1: Switch to Text Editor
1. Navigate to **Timetable** page
2. Click **"Upload JSON"** button
3. Select **"Paste/Edit JSON"** tab

#### Step 2: Get a Template
Choose one option:
- **Option A**: Click **"Load Template to Editor"** to load a sample
- **Option B**: Paste your own JSON code

#### Step 3: Edit in Real-Time
1. Type or paste your JSON timetable
2. Watch for **real-time validation** indicators:
   - ✅ **Green "Valid JSON"** badge when syntax is correct
   - ❌ **Red "Invalid JSON"** badge with error details
3. Use the **"Format"** button to auto-indent your JSON
4. Use the **"Clear"** button to start over

#### Step 4: Preview and Upload
1. Check the **detailed preview** panel below the editor
2. Click **"Show Details"** to see subjects and schedule breakdown
3. Ensure no validation errors appear
4. Click **"Upload Timetable"**
5. ✅ Done!

---

## 🎨 Real-Time Validation Features

When using the **Text Editor** method, you get:

### ✅ Instant Feedback
- **JSON syntax validation** as you type (500ms delay)
- **Structure validation** checking required fields
- **Cross-reference validation** ensuring subjects match
- **Color-coded status** (green = valid, red = invalid)

### 🔍 Detailed Error Messages
- Line-by-line error explanations
- Specific field validation issues
- Subject reference mismatches
- Time format problems

### 👁️ Live Preview
- **Subject count** and list with colors
- **Weekly schedule** overview
- **Class distribution** by day
- **Total periods** calculation

---

## 📝 JSON Template Structure

```json
{
  "name": "Your Timetable Name",           // Optional: Name your timetable
  "semester": "Fall 2026",                 // Optional: Current semester
  "academicYear": "2026-2027",            // Optional: Academic year
  
  "subjects": [
    {
      "name": "Mathematics",               // Required: Subject name
      "code": "MATH101",                   // Optional: Course code
      "type": "Lecture",                   // Optional: Lecture/Practical/Tutorial/Both
      "color": "#3B82F6",                  // Optional: Hex color for visual ID
      "teacher": "Dr. Smith",              // Optional: Teacher name
      "room": "Room 201"                   // Optional: Classroom
    }
    // Add more subjects...
  ],
  
  "schedule": [
    {
      "day": "Monday",                     // Required: Monday-Sunday
      "periods": [
        {
          "subject": "Mathematics",        // Required: Must match subject name
          "startTime": "09:30",           // Required: HH:MM format (24-hour)
          "endTime": "10:30",             // Required: Must be after startTime
          "teacher": "Dr. Smith",         // Optional: Can override subject teacher
          "room": "Room 201"              // Optional: Can override subject room
        }
        // Add more periods for this day...
      ]
    }
    // Add schedules for other days...
  ]
}
```

### Step 3: Upload Your Timetable

1. Go back to the **Timetable** page
2. Make sure **"Upload JSON"** mode is selected
3. Either:
   - **Drag and drop** your JSON file into the upload area, OR
   - **Click** the upload area to browse and select your file
4. Review the preview showing your subjects and periods
5. Ensure **"Auto-generate Attendance Records"** is checked (recommended)
6. Click **"Upload Timetable"**
7. ✅ Done! Your timetable is ready and attendance records are created!

## 💡 Quick Tips

### ✅ Do's
- ✅ Use the template as your starting point
- ✅ Keep subject names consistent between subjects array and schedule
- ✅ Use 24-hour time format (e.g., "14:30" not "2:30 PM")
- ✅ Make sure end time is after start time
- ✅ Enable auto-generate attendance for automatic tracking
- ✅ Use different colors for easy visual identification

### ❌ Don'ts
- ❌ Don't use subject names in schedule that aren't in subjects array
- ❌ Don't use 12-hour time format (e.g., "2:30 PM")
- ❌ Don't make end time before or equal to start time
- ❌ Don't upload files larger than 5MB
- ❌ Don't use invalid JSON syntax (use a validator)

## 🎨 Choose Colors

Use these color codes or choose your own:

| Color | Hex Code |
|-------|----------|
| Blue | `#3B82F6` |
| Green | `#10B981` |
| Purple | `#8B5CF6` |
| Pink | `#EC4899` |
| Orange | `#F97316` |
| Teal | `#14B8A6` |
| Amber | `#F59E0B` |
| Red | `#EF4444` |

## ⏰ Time Format Examples

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| `"09:30"` | `"9:30"` |
| `"14:00"` | `"2:00 PM"` |
| `"08:00"` | `"8:00"` |
| `"16:30"` | `"4:30 PM"` |

## 📅 Example: Simple 2-Subject Schedule

```json
{
  "name": "My Simple Schedule",
  "subjects": [
    {
      "name": "Math",
      "type": "Lecture",
      "color": "#3B82F6"
    },
    {
      "name": "Physics",
      "type": "Lecture",
      "color": "#10B981"
    }
  ],
  "schedule": [
    {
      "day": "Monday",
      "periods": [
        {
          "subject": "Math",
          "startTime": "09:00",
          "endTime": "10:00"
        },
        {
          "subject": "Physics",
          "startTime": "11:00",
          "endTime": "12:00"
        }
      ]
    },
    {
      "day": "Tuesday",
      "periods": []
    },
    {
      "day": "Wednesday",
      "periods": [
        {
          "subject": "Math",
          "startTime": "10:00",
          "endTime": "11:00"
        }
      ]
    },
    {
      "day": "Thursday",
      "periods": []
    },
    {
      "day": "Friday",
      "periods": [
        {
          "subject": "Physics",
          "startTime": "14:00",
          "endTime": "15:00"
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

## 🔧 Common Issues & Solutions

### Issue: "Subject not found in subjects list"
**Solution**: Make sure every subject name in your schedule periods exactly matches a subject name in your subjects array (case-sensitive).

### Issue: "Invalid time format"
**Solution**: Use 24-hour format with leading zeros: `"09:30"` not `"9:30"` or `"9:30 AM"`

### Issue: "End time must be after start time"
**Solution**: Check your time values. For example, `"10:30"` should come before `"11:30"`, not after.

### Issue: "Invalid JSON format"
**Solution**: 
1. Check for missing commas between items
2. Make sure all quotes are closed
3. Use a JSON validator online to check syntax
4. Don't have trailing commas after the last item in arrays/objects

### Issue: File upload fails
**Solution**:
1. Check file size (must be under 5MB)
2. Ensure file extension is .json
3. Validate JSON syntax

## 📱 What Happens After Upload?

1. ✅ Your timetable is saved to your account
2. ✅ Attendance records are automatically created for the current week
3. ✅ All subjects appear in your timetable view with their colors
4. ✅ You can start marking attendance immediately
5. ✅ Your schedule is accessible from the dashboard

## 🔄 Updating Your Timetable

Want to change your schedule? Just:

1. Edit your JSON file with new subjects or times
2. Upload it again using the same process
3. The system will:
   - ✅ Update your timetable
   - ✅ Keep your existing attendance data
   - ✅ Add attendance records for new subjects only
   - ✅ Track the update version

## 📞 Need More Help?

- 📖 **Detailed Guide**: See `TIMETABLE_UPLOAD_GUIDE.md` for comprehensive documentation
- 📄 **Sample File**: Check `sample-timetable.json` for a complete working example
- 🎓 **Manual Editor**: Switch to manual mode if you prefer clicking instead of JSON

---

**Ready to start?** Download the template and create your personalized timetable in minutes! 🚀
