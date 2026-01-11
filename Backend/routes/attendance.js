const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// @route   GET /api/attendance
// @desc    Get all attendance records for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, subject } = req.query;
    
    let query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Filter by subject if provided
    let filteredAttendance = attendance;
    if (subject) {
      filteredAttendance = attendance.filter(record => 
        record.records.some(r => r.subject === subject)
      );
    }

    res.status(200).json({
      success: true,
      count: filteredAttendance.length,
      attendance: filteredAttendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/:date
// @desc    Get attendance for a specific date
// @access  Private
router.get('/:date', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: new Date(req.params.date)
    });

    res.status(200).json({
      success: true,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/attendance
// @desc    Create or update attendance for a date
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { date, day, records } = req.body;

    // Check if attendance already exists for this date
    let attendance = await Attendance.findOne({
      user: req.user.id,
      date: new Date(date)
    });

    if (attendance) {
      // Update existing attendance
      attendance.records = records;
      attendance.day = day;
      await attendance.save();
    } else {
      // Create new attendance
      attendance = await Attendance.create({
        user: req.user.id,
        date: new Date(date),
        day,
        records
      });
    }

    res.status(200).json({
      success: true,
      attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/stats/summary
// @desc    Get attendance statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id });

    // Calculate overall and subject-wise statistics
    const stats = {};
    let totalPresent = 0;
    let totalAbsent = 0;

    attendance.forEach(record => {
      record.records.forEach(({ subject, status }) => {
        if (!stats[subject]) {
          stats[subject] = { present: 0, absent: 0, total: 0 };
        }
        
        stats[subject].total++;
        if (status === 'present') {
          stats[subject].present++;
          totalPresent++;
        } else {
          stats[subject].absent++;
          totalAbsent++;
        }
      });
    });

    // Calculate percentages
    const subjectStats = Object.entries(stats).map(([subject, data]) => ({
      subject,
      present: data.present,
      absent: data.absent,
      total: data.total,
      percentage: ((data.present / data.total) * 100).toFixed(2)
    }));

    const totalClasses = totalPresent + totalAbsent;
    const overallPercentage = totalClasses > 0 
      ? ((totalPresent / totalClasses) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        overall: {
          present: totalPresent,
          absent: totalAbsent,
          total: totalClasses,
          percentage: overallPercentage
        },
        subjects: subjectStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/stats/detailed/:subject
// @desc    Get detailed analytics for a specific subject/class
// @access  Private
router.get('/stats/detailed/:subject', protect, async (req, res) => {
  try {
    const { subject } = req.params;
    const attendance = await Attendance.find({ user: req.user.id }).sort({ date: 1 });

    // Filter records for the specific subject
    const subjectRecords = [];
    let totalPresent = 0;
    let totalAbsent = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    const monthlyData = {};
    const weeklyPattern = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    const weeklyTotal = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };

    attendance.forEach(record => {
      const matchingRecords = record.records.filter(r => r.subject === subject);
      
      matchingRecords.forEach(classRecord => {
        totalPresent += classRecord.status === 'present' ? 1 : 0;
        totalAbsent += classRecord.status === 'absent' ? 1 : 0;

        // Track streak
        if (classRecord.status === 'present') {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }

        // Monthly aggregation
        const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { present: 0, absent: 0, total: 0 };
        }
        monthlyData[month].total++;
        monthlyData[month][classRecord.status]++;

        // Weekly pattern
        weeklyTotal[record.day]++;
        if (classRecord.status === 'present') {
          weeklyPattern[record.day]++;
        }

        subjectRecords.push({
          date: record.date,
          day: record.day,
          status: classRecord.status,
          period: classRecord.period,
          notes: classRecord.notes
        });
      });
    });

    const total = totalPresent + totalAbsent;
    const percentage = total > 0 ? ((totalPresent / total) * 100).toFixed(2) : 0;

    // Calculate classes needed for target percentage
    const calculateClassesNeeded = (targetPercentage) => {
      if (percentage >= targetPercentage) return 0;
      return Math.ceil((targetPercentage * total - 100 * totalPresent) / (100 - targetPercentage));
    };

    // Monthly trend
    const monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      present: data.present,
      absent: data.absent,
      total: data.total,
      percentage: ((data.present / data.total) * 100).toFixed(2)
    }));

    // Weekly pattern percentage
    const weeklyPatternPercentage = Object.entries(weeklyPattern).map(([day, present]) => ({
      day,
      present,
      total: weeklyTotal[day],
      percentage: weeklyTotal[day] > 0 ? ((present / weeklyTotal[day]) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        subject,
        overview: {
          present: totalPresent,
          absent: totalAbsent,
          total,
          percentage,
          longestStreak,
          currentStreak
        },
        targets: {
          for75: calculateClassesNeeded(75),
          for80: calculateClassesNeeded(80),
          for85: calculateClassesNeeded(85),
          for90: calculateClassesNeeded(90)
        },
        monthlyTrend,
        weeklyPattern: weeklyPatternPercentage,
        recentRecords: subjectRecords.slice(-10).reverse()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (attendance.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
