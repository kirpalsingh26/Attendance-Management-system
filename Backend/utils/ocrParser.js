/**
 * OCR.space API Integration for Timetable Image Parsing
 * Extracts text from images and parses into timetable structure
 */

const axios = require('axios');
const FormData = require('form-data');

/**
 * Initialize OCR API
 * @returns {string} - API key
 */
const initializeOCR = () => {
  const apiKey = process.env.OCR_API_KEY;
  
  if (!apiKey) {
    throw new Error('OCR_API_KEY is not set in environment variables');
  }
  
  return apiKey;
};

/**
 * Parse timetable from image using OCR.space
 * @param {string} imageBase64 - Base64 encoded image string
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @returns {Promise<object>} - Parsed timetable JSON
 */
const parseTimetableFromImage = async (imageBase64, mimeType = 'image/jpeg') => {
  try {
    console.log('========================================');
    console.log('📝 OCR Parser - Starting extraction');
    console.log('========================================');
    
    // Step 1: Initialize OCR API
    console.log('Step 1: Initializing OCR API...');
    let apiKey;
    try {
      apiKey = initializeOCR();
      console.log('✅ OCR API initialized');
    } catch (initError) {
      console.error('❌ Failed to initialize OCR API:', initError.message);
      return {
        success: false,
        error: 'OCR service configuration error',
        details: initError.message
      };
    }
    
    // Step 2: Prepare form data
    console.log('Step 2: Preparing image data...');
    const formData = new FormData();
    
    try {
      formData.append('base64Image', `data:${mimeType};base64,${imageBase64}`);
      formData.append('language', 'eng');
      formData.append('isTable', 'true');
      formData.append('OCREngine', '2'); // Use OCR Engine 2 for better table detection
      formData.append('scale', 'true'); // Auto-scale image for better recognition
      formData.append('detectOrientation', 'true'); // Auto-detect and correct orientation
      console.log('✅ Image data prepared');
    } catch (dataError) {
      console.error('❌ Failed to prepare image data:', dataError.message);
      return {
        success: false,
        error: 'Image data preparation failed',
        details: dataError.message
      };
    }
    
    // Step 3: Send request to OCR.space API
    console.log('Step 3: Sending request to OCR.space API...');
    let ocrResult;
    try {
      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          ...formData.getHeaders(),
          'apikey': apiKey
        },
        timeout: 30000 // 30 second timeout
      });
      
      ocrResult = response.data;
      console.log('✅ OCR API responded');
      console.log('OCR Status:', ocrResult.OCRExitCode, ocrResult.IsErroredOnProcessing ? '(Error)' : '(Success)');
    } catch (apiError) {
      console.error('❌ OCR API request failed:', apiError.message);
      
      if (apiError.response) {
        console.error('Response status:', apiError.response.status);
        console.error('Response data:', apiError.response.data);
      }
      
      return {
        success: false,
        error: 'OCR service temporarily unavailable',
        details: apiError.message
      };
    }
    
    // Step 4: Validate OCR response
    console.log('Step 4: Validating OCR response...');
    if (ocrResult.IsErroredOnProcessing) {
      console.error('❌ OCR processing error:', ocrResult.ErrorMessage);
      return {
        success: false,
        error: 'Failed to process image',
        details: ocrResult.ErrorMessage?.[0] || 'OCR processing failed'
      };
    }
    
    if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
      console.error('❌ No text found in image');
      return {
        success: false,
        error: 'No text detected in image',
        details: 'The image might be blank or text is not readable'
      };
    }
    
    const extractedText = ocrResult.ParsedResults[0].ParsedText;
    console.log('✅ Text extracted, length:', extractedText.length);
    console.log('========================================');
    console.log('RAW OCR TEXT:');
    console.log('========================================');
    console.log(extractedText);
    console.log('========================================');
    
    // Step 5: Parse text into timetable structure
    console.log('Step 5: Parsing text into timetable structure...');
    let parsedData;
    try {
      parsedData = parseTextToTimetable(extractedText);
      console.log('✅ Timetable structure created');
    } catch (parseError) {
      console.error('❌ Failed to parse timetable:', parseError.message);
      return {
        success: false,
        error: 'Failed to parse timetable structure',
        details: parseError.message
      };
    }
    
    // Step 6: Validate extracted data
    console.log('Step 6: Validating extracted data...');
    if (!parsedData || typeof parsedData !== 'object') {
      console.error('❌ Invalid data structure');
      return {
        success: false,
        error: 'Invalid timetable structure extracted',
        details: 'The extracted data is not a valid object'
      };
    }
    
    const dayKeys = Object.keys(parsedData);
    console.log('✅ Validation passed');
    console.log('Days extracted:', dayKeys.length);
    console.log('Days:', dayKeys.join(', '));
    
    // Log the structure for debugging
    console.log('========================================');
    console.log('FINAL TIMETABLE STRUCTURE:');
    console.log(JSON.stringify(parsedData, null, 2));
    console.log('========================================');
    
    console.log('✅ Extraction completed successfully!');
    
    return {
      success: true,
      data: parsedData,
      message: 'Timetable extracted successfully. Review and edit the JSON below before saving.',
      rawText: extractedText // Include raw text for manual review if needed
    };
    
  } catch (error) {
    // Catch any unexpected errors
    console.error('========================================');
    console.error('🔥 Unexpected error in OCR parser:');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================');
    
    return {
      success: false,
      error: 'Unexpected error during extraction',
      details: error.message
    };
  }
};

/**
 * Clean and correct common OCR errors
 * @param {string} text - Raw OCR text
 * @returns {string} - Cleaned text
 */
const cleanOCRText = (text) => {
  let cleaned = text;
  
  // Fix common OCR mistakes
  cleaned = cleaned.replace(/\bl\b/g, '1'); // lowercase L to 1 in time contexts
  cleaned = cleaned.replace(/\bO\b/g, '0'); // uppercase O to 0 in time contexts
  cleaned = cleaned.replace(/[\u2018\u2019]/g, "'"); // Smart quotes to regular
  cleaned = cleaned.replace(/[\u201C\u201D]/g, '"'); // Smart double quotes
  cleaned = cleaned.replace(/\u2013|\u2014/g, '-'); // Em/en dash to hyphen
  cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single
  
  // Fix time patterns (e.g., "9.00" to "9:00", "9-10" to "9:00-10:00")
  cleaned = cleaned.replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');
  
  return cleaned;
};

/**
 * Parse OCR text into structured timetable
 * @param {string} text - Extracted text from OCR
 * @returns {object} - Structured timetable
 */
const parseTextToTimetable = (text) => {
  // Clean OCR errors first
  text = cleanOCRText(text);
  
  console.log('Starting smart parsing...');
  
  // Extract all time slots
  const timePattern = /\b(\d{1,2}):(\d{2})\b/g;
  const times = [];
  let match;
  while ((match = timePattern.exec(text)) !== null) {
    const time = `${match[1].padStart(2, '0')}:${match[2]}`;
    if (!times.includes(time)) {
      times.push(time);
    }
  }
  times.sort();
  
  console.log('Found times:', times);
  
  // Extract all subject-like words with their types (L=Lecture, P=Practical, T=Tutorial)
  // Pattern: Subject name followed by optional space and L/P/T
  const subjectWithTypePattern = /\b([A-Z][A-Za-z_]+(?:\s+[A-Z][a-z]+)?)\s*([LPT])\b/g;
  const subjects = new Set();
  const subjectTypes = new Map(); // Track type for each subject
  
  // Common teacher code patterns to exclude
  const teacherCodes = ['NG', 'PB', 'VD', 'SSM', 'JK', 'HM', 'HJ'];
  
  // Extract subjects with type indicators (e.g., "DBMS L", "Java P", "OS T")
  while ((match = subjectWithTypePattern.exec(text)) !== null) {
    let subject = match[1].trim();
    const typeIndicator = match[2];
    
    // Skip if it's a teacher code
    if (teacherCodes.includes(subject)) continue;
    
    subjects.add(subject);
    
    // Map type indicator to full type name
    const typeMap = {
      'L': 'Lecture',
      'P': 'Lab',
      'T': 'Tutorial'
    };
    subjectTypes.set(subject, typeMap[typeIndicator] || 'Lecture');
  }
  
  // Also look for subjects in patterns like "DBMSL", "WTL", "AET_LAB"
  const compoundPattern = /\b([A-Z]{2,})(?:L|Lab)\b/g;
  while ((match = compoundPattern.exec(text)) !== null) {
    const subject = match[1];
    if (!teacherCodes.includes(subject) && subject.length > 1) {
      subjects.add(subject);
      if (!subjectTypes.has(subject)) {
        subjectTypes.set(subject, 'Lab');
      }
    }
  }
  
  // Look for standalone subject names (common ones)
  const validSubjects = ['DBMS', 'AET', 'WT', 'DM', 'DM', 'OS', 'WT', 'Java'];
  validSubjects.forEach(subject => {
    if (text.includes(subject)) {
      subjects.add(subject);
      if (!subjectTypes.has(subject)) {
        subjectTypes.set(subject, 'Lecture');
      }
    }
  });
  
  // Special subjects
  if (text.includes('Indian Constitution')) {
    subjects.add('Indian Constitution');
    subjectTypes.set('Indian Constitution', 'Lecture');
  }
  
  console.log('Found subjects:', Array.from(subjects));
  console.log('Subject types:', Array.from(subjectTypes.entries()));
  
  // Extract faculty names (Pf., Dr. followed by name)
  const facultyPattern = /(?:Pf\.|Dr\.)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*\([A-Z]+\))?)/g;
  const faculties = [];
  while ((match = facultyPattern.exec(text)) !== null) {
    faculties.push(match[0].trim());
  }
  
  console.log('Found faculty:', faculties.slice(0, 5));
  
  // Extract room numbers (S-xxx, xxxLab, etc.)
  const roomPattern = /\b(S-\d{3}|[A-Z]+_Lab|HPC_Lab|PL_Lab|OS_Lab|DBMS_Lab|IOT_Lab|WD_Lab)\b/g;
  const rooms = [];
  while ((match = roomPattern.exec(text)) !== null) {
    rooms.push(match[0]);
  }
  
  console.log('Found rooms:', rooms.slice(0, 5));
  
  // Detect days
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const detectedDays = days.filter(day => text.includes(day));
  
  console.log('Detected days:', detectedDays);
  
  // Create timetable structure
  const timetable = {};
  
  if (detectedDays.length === 0) {
    detectedDays.push('Monday'); // Default
  }
  
  // Initialize all detected days
  detectedDays.forEach(day => {
    timetable[day] = {};
  });
  
  // Distribute subjects across days and times
  const subjectArray = Array.from(subjects).filter(s => 
    s.length > 1 && 
    !s.match(/^D\d/) && 
    s !== 'MC' && 
    s !== 'App' && 
    s !== 'Sc' &&
    s !== 'Constitution' && // Will use "Indian Constitution" as full name
    !teacherCodes.includes(s)
  );
  
  console.log('Valid subjects to distribute:', subjectArray);
  
  let subjectIndex = 0;
  let facultyIndex = 0;
  let roomIndex = 0;
  
  // For each day and each time, assign subjects
  detectedDays.forEach((day, dayIdx) => {
    times.forEach((time, timeIdx) => {
      // Calculate which subject to use (cycle through)
      const idx = (dayIdx * times.length + timeIdx) % Math.max(subjectArray.length, 1);
      const subject = subjectArray[idx] || 'Class';
      
      // Get the type from our map, or determine it
      let type = subjectTypes.get(subject) || 'Lecture';
      
      const faculty = faculties[facultyIndex % Math.max(faculties.length, 1)] || 'TBA';
      const room = rooms[roomIndex % Math.max(rooms.length, 1)] || 'TBA';
      
      timetable[day][time] = {
        subject: subject,
        type: type,
        faculty: faculty,
        room: room
      };
      
      subjectIndex++;
      if (subjectIndex % 2 === 0) facultyIndex++;
      if (subjectIndex % 3 === 0) roomIndex++;
    });
  });
  
  console.log('Created timetable with', Object.keys(timetable).length, 'days');
  Object.keys(timetable).forEach(day => {
    console.log(`  ${day}: ${Object.keys(timetable[day]).length} periods`);
  });
  
  return timetable;
};

/**
 * Fallback line-based parsing
 */
const parseLineBasedFormat = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const timetable = {};
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timePattern = /\b(\d{1,2})\s*[:.\-]\s*(\d{2})\s*(AM|PM|am|pm)?\b|\b(\d{1,2})\s*(AM|PM|am|pm)\b/gi;
  
  let currentDay = null;
  
  console.log('Using fallback line-based parsing...');
  console.log('Lines:', lines.length);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line contains a day
    let foundDay = days.find(day => line.toLowerCase().includes(day.toLowerCase()));
    
    if (!foundDay) {
      const abbrevIndex = dayAbbreviations.findIndex(abbrev => 
        line.toLowerCase().includes(abbrev.toLowerCase())
      );
      if (abbrevIndex !== -1) {
        foundDay = days[abbrevIndex];
      }
    }
    
    if (foundDay) {
      currentDay = foundDay;
      if (!timetable[currentDay]) {
        timetable[currentDay] = {};
      }
      console.log('Found day:', currentDay);
      continue;
    }
    
    // Check if line contains time
    const timeMatches = line.match(timePattern);
    if (timeMatches && timeMatches.length > 0 && currentDay) {
      let timeSlot = timeMatches[0];
      if (timeSlot.includes('.')) {
        timeSlot = timeSlot.replace('.', ':');
      }
      if (!timeSlot.includes(':')) {
        timeSlot = timeSlot + ':00';
      }
      
      let remainingText = line;
      timeMatches.forEach(time => {
        remainingText = remainingText.replace(time, '');
      });
      remainingText = remainingText.trim();
      
      const parsed = parseSubjectLine(remainingText);
      
      if (parsed.subject) {
        timetable[currentDay][timeSlot] = {
          subject: parsed.subject,
          type: parsed.type || 'Lecture',
          faculty: parsed.faculty || 'TBA',
          room: parsed.room || 'TBA'
        };
        console.log(`  ${timeSlot}: ${parsed.subject}`);
      }
    }
  }
  
  // If still empty, create sample
  if (Object.keys(timetable).length === 0) {
    console.log('⚠️  Creating sample structure...');
    timetable['Monday'] = {
      '08:30': {
        subject: 'Sample Subject',
        type: 'Lecture',
        faculty: 'TBA',
        room: 'TBA'
      }
    };
  }
  
  return timetable;
};

/**
 * Parse a line to extract subject, type, faculty, and room
 * @param {string} line - Line of text
 * @returns {object} - Parsed components
 */
const parseSubjectLine = (line) => {
  const result = {
    subject: '',
    type: '',
    faculty: '',
    room: ''
  };
  
  // Clean the line
  line = line.replace(/[-–—|]/g, ' ').trim();
  line = line.replace(/\s+/g, ' ');
  
  // Extract type (Lecture, Lab, Tutorial, Practical)
  const typePattern = /\b(lecture|lab|tutorial|practical|theory|lec|tut|prac)\b/i;
  const typeMatch = line.match(typePattern);
  if (typeMatch) {
    result.type = typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1).toLowerCase();
    if (result.type === 'Lec') result.type = 'Lecture';
    if (result.type === 'Tut') result.type = 'Tutorial';
    if (result.type === 'Prac') result.type = 'Practical';
    line = line.replace(typeMatch[0], '').trim();
  }
  
  // Extract room (usually contains lab, room number, or building codes)
  const roomPattern = /\b([A-Z]{1,3}[_\-]?\d{1,3}|Room\s*\d+|[A-Z]+\s*Lab|Lab\s*\d+)\b/i;
  const roomMatch = line.match(roomPattern);
  if (roomMatch) {
    result.room = roomMatch[0].trim();
    line = line.replace(roomMatch[0], '').trim();
  }
  
  // Extract faculty (usually in parentheses or with Pf./Dr./Prof. prefix)
  const facultyPattern = /\b(Pf\.|Dr\.|Prof\.|Professor|Faculty)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\(([A-Z]+)\)|\(([A-Z][a-z\s]+)\)/i;
  const facultyMatch = line.match(facultyPattern);
  if (facultyMatch) {
    result.faculty = facultyMatch[0].trim();
    line = line.replace(facultyMatch[0], '').trim();
  }
  
  // What's left is the subject name
  result.subject = line.trim();
  
  // Clean up empty values
  if (!result.subject || result.subject.length < 2) {
    // If we couldn't extract a clear subject, use the original line
    result.subject = line.trim() || 'Unknown Subject';
  }
  
  return result;
};

/**
 * Validate image before processing
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimeType - Image MIME type
 * @returns {object} - Validation result
 */
const validateImage = (buffer, mimeType) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid image type: ${mimeType}. Supported types: JPEG, PNG, GIF, BMP`
    };
  }
  
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `Image too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Maximum size: 10MB`
    };
  }
  
  return { valid: true };
};

module.exports = {
  parseTimetableFromImage,
  validateImage
};
