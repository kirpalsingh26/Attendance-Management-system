const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Timetable = require('../models/Timetable');
const { validateTimetableJSON } = require('../utils/timetableValidator');
const { parseUniversalTimetable } = require('../utils/timetableParser');
const { parseTimetableFromImage, validateImage } = require('../utils/ocrParser');
const { 
  updateAttendanceAfterTimetableChange, 
  initializeWeeklyAttendance 
} = require('../utils/attendanceGenerator');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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

// @route   POST /api/timetable/upload
// @desc    Upload timetable from JSON (supports multiple formats)
// @access  Private
router.post('/upload', protect, async (req, res) => {
  try {
    const { timetableData, autoGenerateAttendance = true, fileName = 'timetable.json' } = req.body;

    console.log('Received timetable upload request');
    console.log('Auto-generate attendance:', autoGenerateAttendance);
    console.log('File name:', fileName);

    // Step 1: Parse and normalize the timetable (supports multiple formats)
    let parsedData;
    try {
      parsedData = parseUniversalTimetable(timetableData);
      console.log('Successfully parsed timetable format');
      console.log('Extracted subjects:', parsedData.subjects.length);
      console.log('Extracted schedule days:', parsedData.schedule.length);
    } catch (parseError) {
      console.error('Parse error:', parseError.message);
      return res.status(400).json({
        success: false,
        message: 'Unable to parse timetable format',
        error: parseError.message
      });
    }

    // Step 2: Validate the parsed/normalized structure
    const validation = validateTimetableJSON(parsedData);
    
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid timetable format',
        errors: validation.errors
      });
    }

    console.log('Timetable validation passed');

    // Get existing timetable for comparison
    const existingTimetable = await Timetable.findOne({ 
      user: req.user.id, 
      isActive: true 
    });

    // Prepare timetable data
    const timetableToSave = {
      ...validation.sanitized,
      user: req.user.id,
      uploadMethod: 'json',
      isActive: true,
      metadata: {
        lastUploadDate: new Date(),
        fileName: fileName,
        version: existingTimetable ? (existingTimetable.metadata?.version || 0) + 1 : 1
      }
    };

    let timetable;
    let attendanceResult = null;

    if (existingTimetable) {
      // Update existing timetable
      console.log('Updating existing timetable:', existingTimetable._id);
      
      timetable = await Timetable.findByIdAndUpdate(
        existingTimetable._id,
        timetableToSave,
        { new: true, runValidators: true }
      );

      // Update attendance records if auto-generate is enabled
      if (autoGenerateAttendance) {
        console.log('Updating attendance records for timetable changes');
        attendanceResult = await updateAttendanceAfterTimetableChange(
          req.user.id,
          existingTimetable,
          timetable
        );
      }
    } else {
      // Create new timetable
      console.log('Creating new timetable');
      timetable = await Timetable.create(timetableToSave);

      // Initialize weekly attendance if auto-generate is enabled
      if (autoGenerateAttendance) {
        console.log('Initializing weekly attendance');
        attendanceResult = await initializeWeeklyAttendance(req.user.id, timetable);
      }
    }

    console.log('Timetable saved successfully');

    res.status(201).json({
      success: true,
      message: 'Timetable uploaded successfully',
      timetable,
      attendance: attendanceResult,
      validationInfo: {
        subjectsCount: timetable.subjects.length,
        daysWithClasses: timetable.schedule.filter(day => day.periods.length > 0).length,
        totalPeriods: timetable.schedule.reduce((sum, day) => sum + day.periods.length, 0)
      }
    });
  } catch (error) {
    console.error('Error uploading timetable:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/timetable/template
// @desc    Get a sample timetable JSON template
// @access  Private
router.get('/template', protect, async (req, res) => {
  const template = {
    name: "My Timetable",
    semester: "Fall 2026",
    academicYear: "2026-2027",
    subjects: [
      {
        name: "Mathematics",
        code: "MATH101",
        type: "Lecture",
        color: "#3B82F6",
        classTime: "09:30-10:30",
        teacher: "Dr. Smith",
        room: "Room 201"
      },
      {
        name: "Physics Lab",
        code: "PHY102L",
        type: "Practical",
        color: "#10B981",
        classTime: "14:30-16:30",
        teacher: "Prof. Johnson",
        room: "Lab 3"
      }
    ],
    schedule: [
      {
        day: "Monday",
        periods: [
          {
            subject: "Mathematics",
            startTime: "09:30",
            endTime: "10:30",
            teacher: "Dr. Smith",
            room: "Room 201"
          },
          {
            subject: "Physics Lab",
            startTime: "14:30",
            endTime: "16:30",
            teacher: "Prof. Johnson",
            room: "Lab 3"
          }
        ]
      },
      {
        day: "Tuesday",
        periods: []
      },
      {
        day: "Wednesday",
        periods: [
          {
            subject: "Mathematics",
            startTime: "09:30",
            endTime: "10:30",
            teacher: "Dr. Smith",
            room: "Room 201"
          }
        ]
      },
      {
        day: "Thursday",
        periods: []
      },
      {
        day: "Friday",
        periods: [
          {
            subject: "Physics Lab",
            startTime: "14:30",
            endTime: "16:30",
            teacher: "Prof. Johnson",
            room: "Lab 3"
          }
        ]
      },
      {
        day: "Saturday",
        periods: []
      }
    ]
  };

  res.status(200).json({
    success: true,
    template,
    instructions: {
      name: "Name of your timetable (optional)",
      semester: "Current semester (optional)",
      academicYear: "Academic year (optional)",
      subjects: "Array of subjects with name (required), code, type (Lecture/Practical/Tutorial/Both), color (hex), classTime, teacher, room",
      schedule: "Array of day schedules. Each day must have 'day' (Monday-Sunday) and 'periods' array",
      periods: "Each period requires: subject (must match a subject name), startTime (HH:MM), endTime (HH:MM), optional teacher and room",
      validation: [
        "All subject names in periods must exist in the subjects array",
        "Time format must be HH:MM (24-hour)",
        "End time must be after start time",
        "Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
      ]
    }
  });
});

// @route   POST /api/timetable/upload-image
// @desc    Upload and parse timetable image using OCR.space API
// @access  Private
router.post('/upload-image', protect, upload.single('image'), async (req, res, next) => {
  console.log('========================================');
  console.log('📸 Image upload endpoint hit!');
  console.log('========================================');
  console.log('Request details:');
  console.log('- Method:', req.method);
  console.log('- URL:', req.url);
  console.log('- User:', req.user?.id);
  console.log('- Has file:', !!req.file);
  console.log('========================================');

  try {
    // Step 1: Check if OCR API key is configured
    if (!process.env.OCR_API_KEY) {
      console.error('❌ OCR_API_KEY not configured in environment');
      return res.status(500).json({
        success: false,
        message: 'OCR service not configured. Please contact administrator.',
        error: 'OCR_API_KEY environment variable is not set'
      });
    }
    console.log('✅ OCR API key is configured');
    
    // Step 2: Validate file upload
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image.'
      });
    }
    
    const { buffer, mimetype, originalname, size } = req.file;
    console.log('✅ File received:', {
      name: originalname,
      type: mimetype,
      size: `${(size / 1024).toFixed(2)} KB`
    });
    
    // Step 3: Validate image type and size
    const validation = validateImage(buffer, mimetype);
    if (!validation.valid) {
      console.error('❌ Image validation failed:', validation.error);
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    console.log('✅ Image validation passed');
    
    // Step 4: Convert buffer to base64
    let base64Image;
    try {
      base64Image = buffer.toString('base64');
      console.log('✅ Image converted to base64');
    } catch (conversionError) {
      console.error('❌ Failed to convert image to base64:', conversionError);
      return res.status(500).json({
        success: false,
        message: 'Failed to process image data',
        error: conversionError.message
      });
    }
    
    // Step 5: Call OCR.space API with comprehensive error handling
    console.log('📝 Calling OCR.space API...');
    let parseResult;
    try {
      parseResult = await parseTimetableFromImage(base64Image, mimetype);
      console.log('✅ OCR API call completed');
    } catch (ocrError) {
      console.error('❌ OCR API call failed:', ocrError);
      return res.status(500).json({
        success: false,
        message: 'OCR service temporarily unavailable. Please try again.',
        error: ocrError.message,
        details: 'The OCR.space API encountered an error'
      });
    }
    
    // Step 6: Validate API response
    if (!parseResult) {
      console.error('❌ OCR API returned null/undefined');
      return res.status(500).json({
        success: false,
        message: 'OCR service returned invalid response'
      });
    }
    
    if (!parseResult.success) {
      console.error('❌ OCR parsing failed:', parseResult.error);
      return res.status(400).json({
        success: false,
        message: parseResult.error || 'Failed to extract timetable from image',
        details: parseResult.details,
        suggestions: [
          'Ensure the image contains a clear timetable',
          'Try a higher quality or better-lit photo',
          'Make sure all text is readable',
          'Use manual JSON input as an alternative'
        ]
      });
    }
    
    // Step 7: Validate extracted data
    if (!parseResult.data || typeof parseResult.data !== 'object') {
      console.error('❌ Invalid data format from OCR');
      return res.status(500).json({
        success: false,
        message: 'AI extracted invalid data format'
      });
    }
    
    console.log('========================================');
    console.log('✅ Successfully extracted timetable!');
    console.log('- Days found:', Object.keys(parseResult.data).length);
    console.log('========================================');
    
    // Step 8: Return successful response
    return res.status(200).json({
      success: true,
      message: 'Timetable extracted successfully from image',
      data: parseResult.data,
      metadata: {
        fileName: originalname,
        fileSize: size,
        mimeType: mimetype,
        extractedAt: new Date().toISOString(),
        daysExtracted: Object.keys(parseResult.data).length,
        note: 'Please review and edit the extracted data before saving'
      }
    });
    
  } catch (error) {
    // Catch any unexpected errors
    console.error('========================================');
    console.error('🔥 Unexpected error in upload-image route:');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================');
    
    // Ensure we return JSON even for unexpected errors
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing the image',
      error: error.message,
      type: error.name,
      suggestions: [
        'Try uploading the image again',
        'Check if the image file is corrupted',
        'Use manual JSON input as an alternative',
        'Contact support if the problem persists'
      ]
    });
  }
});

module.exports = router;
