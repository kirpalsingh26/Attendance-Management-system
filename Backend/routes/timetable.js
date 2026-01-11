const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Timetable = require('../models/Timetable');

// @route   GET /api/timetable
// @desc    Get user's timetable
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ user: req.user.id, isActive: true });

    res.status(200).json({
      success: true,
      timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/timetable
// @desc    Create or update timetable
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, semester, academicYear, schedule, subjects } = req.body;

    console.log('Received timetable data:');
    console.log('Subjects:', JSON.stringify(subjects, null, 2));
    console.log('Schedule:', JSON.stringify(schedule, null, 2));

    // Find existing active timetable
    let timetable = await Timetable.findOne({ user: req.user.id, isActive: true });

    if (timetable) {
      // Update existing timetable
      console.log('Updating existing timetable:', timetable._id);
      timetable = await Timetable.findByIdAndUpdate(
        timetable._id,
        {
          name,
          semester,
          academicYear,
          schedule,
          subjects,
          isActive: true
        },
        { new: true, runValidators: true }
      );
      console.log('Updated timetable:', JSON.stringify(timetable, null, 2));
    } else {
      // Create new timetable if none exists
      console.log('Creating new timetable');
      timetable = await Timetable.create({
        user: req.user.id,
        name,
        semester,
        academicYear,
        schedule,
        subjects,
        isActive: true
      });
      console.log('Created timetable:', JSON.stringify(timetable, null, 2));
    }

    res.status(201).json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error('Error creating/updating timetable:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/timetable/:id
// @desc    Update timetable
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Make sure user owns timetable
    if (timetable.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this timetable'
      });
    }

    timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    if (timetable.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this timetable'
      });
    }

    await timetable.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/timetable/cleanup/inactive
// @desc    Delete all inactive timetables for user
// @access  Private
router.delete('/cleanup/inactive', protect, async (req, res) => {
  try {
    const result = await Timetable.deleteMany({ 
      user: req.user.id, 
      isActive: false 
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} inactive timetable(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
