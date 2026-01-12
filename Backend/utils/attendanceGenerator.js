/**
 * Attendance Generator Service
 * Automatically generates attendance records based on timetable
 */

const Attendance = require('../models/Attendance');

/**
 * Extracts all unique subjects from a timetable
 * @param {object} timetable - Timetable document
 * @returns {Set} - Set of unique subject names
 */
const extractSubjectsFromTimetable = (timetable) => {
  const subjects = new Set();
  
  if (timetable.schedule && Array.isArray(timetable.schedule)) {
    timetable.schedule.forEach(daySchedule => {
      if (daySchedule.periods && Array.isArray(daySchedule.periods)) {
        daySchedule.periods.forEach(period => {
          if (period.subject) {
            subjects.add(period.subject);
          }
        });
      }
    });
  }
  
  return subjects;
};

/**
 * Gets the schedule for a specific day
 * @param {object} timetable - Timetable document
 * @param {string} day - Day name (e.g., 'Monday')
 * @returns {array} - Array of periods for that day
 */
const getScheduleForDay = (timetable, day) => {
  if (!timetable.schedule || !Array.isArray(timetable.schedule)) {
    return [];
  }
  
  const daySchedule = timetable.schedule.find(schedule => schedule.day === day);
  return daySchedule && daySchedule.periods ? daySchedule.periods : [];
};

/**
 * Generates attendance records for a specific date based on timetable
 * @param {string} userId - User ID
 * @param {object} timetable - Timetable document
 * @param {Date} date - Date for attendance
 * @param {string} day - Day of week
 * @param {string} defaultStatus - Default status ('present' or 'absent')
 * @returns {Promise<object>} - Created/updated attendance record
 */
const generateAttendanceForDate = async (userId, timetable, date, day, defaultStatus = 'absent') => {
  try {
    // Get schedule for the specific day
    const periods = getScheduleForDay(timetable, day);
    
    if (periods.length === 0) {
      return null; // No classes on this day
    }

    // Create attendance records for each period
    const records = periods.map(period => ({
      subject: period.subject,
      status: defaultStatus,
      period: `${period.startTime} - ${period.endTime}`,
      notes: ''
    }));

    // Check if attendance already exists for this date
    let attendance = await Attendance.findOne({
      user: userId,
      date: new Date(date)
    });

    if (attendance) {
      // Update existing attendance
      // Keep existing records and add new ones if subjects changed
      const existingSubjects = new Set(attendance.records.map(r => r.subject));
      const newRecords = records.filter(r => !existingSubjects.has(r.subject));
      
      if (newRecords.length > 0) {
        attendance.records = [...attendance.records, ...newRecords];
        attendance.day = day;
        await attendance.save();
      }
    } else {
      // Create new attendance
      attendance = await Attendance.create({
        user: userId,
        date: new Date(date),
        day,
        records
      });
    }

    return attendance;
  } catch (error) {
    console.error('Error generating attendance:', error);
    throw error;
  }
};

/**
 * Generates attendance records for a date range based on timetable
 * @param {string} userId - User ID
 * @param {object} timetable - Timetable document
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} defaultStatus - Default status ('present' or 'absent')
 * @returns {Promise<array>} - Array of created/updated attendance records
 */
const generateAttendanceForRange = async (userId, timetable, startDate, endDate, defaultStatus = 'absent') => {
  const attendanceRecords = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    
    try {
      const attendance = await generateAttendanceForDate(
        userId,
        timetable,
        currentDate,
        dayOfWeek,
        defaultStatus
      );
      
      if (attendance) {
        attendanceRecords.push(attendance);
      }
    } catch (error) {
      console.error(`Error generating attendance for ${currentDate}:`, error);
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return attendanceRecords;
};

/**
 * Updates existing attendance records when timetable changes
 * Adds new subjects, keeps existing attendance data
 * @param {string} userId - User ID
 * @param {object} oldTimetable - Previous timetable
 * @param {object} newTimetable - New timetable
 * @returns {Promise<object>} - Update statistics
 */
const updateAttendanceAfterTimetableChange = async (userId, oldTimetable, newTimetable) => {
  try {
    const oldSubjects = extractSubjectsFromTimetable(oldTimetable || { schedule: [] });
    const newSubjects = extractSubjectsFromTimetable(newTimetable);
    
    // Find new subjects that were added
    const addedSubjects = [...newSubjects].filter(subject => !oldSubjects.has(subject));
    
    if (addedSubjects.length === 0) {
      return {
        success: true,
        message: 'No new subjects to add to attendance records',
        updatedCount: 0
      };
    }

    // Get all existing attendance records
    const attendanceRecords = await Attendance.find({ user: userId });
    
    let updatedCount = 0;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Update each attendance record with new subjects
    for (const attendance of attendanceRecords) {
      const dayOfWeek = daysOfWeek[new Date(attendance.date).getDay()];
      const periods = getScheduleForDay(newTimetable, dayOfWeek);
      
      // Find periods for new subjects
      const newPeriods = periods.filter(period => addedSubjects.includes(period.subject));
      
      if (newPeriods.length > 0) {
        const newRecords = newPeriods.map(period => ({
          subject: period.subject,
          status: 'absent',
          period: `${period.startTime} - ${period.endTime}`,
          notes: 'Auto-added after timetable update'
        }));
        
        attendance.records = [...attendance.records, ...newRecords];
        await attendance.save();
        updatedCount++;
      }
    }

    return {
      success: true,
      message: `Updated ${updatedCount} attendance records with new subjects`,
      updatedCount,
      addedSubjects: Array.from(addedSubjects)
    };
  } catch (error) {
    console.error('Error updating attendance after timetable change:', error);
    throw error;
  }
};

/**
 * Initializes attendance for current week based on new timetable
 * @param {string} userId - User ID
 * @param {object} timetable - Timetable document
 * @returns {Promise<object>} - Initialization result
 */
const initializeWeeklyAttendance = async (userId, timetable) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get start of current week (Monday)
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diffToMonday);
  
  // Get end of current week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const records = await generateAttendanceForRange(
    userId,
    timetable,
    startOfWeek,
    endOfWeek,
    'absent'
  );
  
  return {
    success: true,
    message: `Initialized attendance for current week`,
    recordsCreated: records.length,
    dateRange: {
      start: startOfWeek,
      end: endOfWeek
    }
  };
};

module.exports = {
  generateAttendanceForDate,
  generateAttendanceForRange,
  updateAttendanceAfterTimetableChange,
  initializeWeeklyAttendance,
  extractSubjectsFromTimetable,
  getScheduleForDay
};
