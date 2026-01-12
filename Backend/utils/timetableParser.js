/**
 * Universal Timetable JSON Parser
 * Automatically detects and transforms various timetable formats
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * Generate random color for subjects
 */
const generateColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Normalize time format
 */
const normalizeTime = (time) => {
  if (!time) return '';
  const timeStr = time.toString().trim();
  
  // Already in HH:MM format
  if (TIME_REGEX.test(timeStr)) return timeStr;
  
  // Handle formats like "08:30 AM" or "8:30"
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?/);
  if (match) {
    const hours = match[1].padStart(2, '0');
    const minutes = match[2] || '00';
    return `${hours}:${minutes}`;
  }
  
  return timeStr;
};

/**
 * Extract subject information from various field names
 */
const extractSubjectInfo = (obj) => {
  const info = {
    name: null,
    type: 'Lecture',
    faculty: '',
    room: '',
    code: '',
    section: ''
  };

  // Try various field names for subject
  const nameFields = ['subject', 'name', 'course', 'courseName', 'subjectName', 'title'];
  for (const field of nameFields) {
    if (obj[field] && typeof obj[field] === 'string') {
      info.name = obj[field].trim();
      break;
    }
  }

  // Type mapping
  const typeMap = {
    'L': 'Lecture',
    'P': 'Practical',
    'T': 'Tutorial',
    'Lab': 'Practical',
    'Lecture': 'Lecture',
    'Practical': 'Practical',
    'Tutorial': 'Tutorial',
    'L+P': 'Both',
    'Both': 'Both'
  };

  const typeFields = ['type', 'classType', 'sessionType'];
  for (const field of typeFields) {
    if (obj[field]) {
      info.type = typeMap[obj[field]] || 'Lecture';
      break;
    }
  }

  // Faculty/Teacher
  const facultyFields = ['faculty', 'teacher', 'instructor', 'professor'];
  for (const field of facultyFields) {
    if (obj[field]) {
      info.faculty = obj[field].toString().trim();
      break;
    }
  }

  // Room
  const roomFields = ['room', 'location', 'venue', 'classroom'];
  for (const field of roomFields) {
    if (obj[field]) {
      info.room = obj[field].toString().trim();
      break;
    }
  }

  // Code
  const codeFields = ['code', 'courseCode', 'subjectCode'];
  for (const field of codeFields) {
    if (obj[field]) {
      info.code = obj[field].toString().trim();
      break;
    }
  }

  // Section
  const sectionFields = ['section', 'batch', 'group'];
  for (const field of sectionFields) {
    if (obj[field]) {
      info.section = obj[field].toString().trim();
      break;
    }
  }

  return info;
};

/**
 * Format 1: Time-slot based (Day -> Time -> Classes)
 * Example: { "Monday": { "08:30": [{ subject: "Math" }] } }
 */
const parseTimeSlotFormat = (data) => {
  const subjectsMap = new Map();
  const schedule = [];

  DAYS.forEach(day => {
    if (!data[day]) return;

    const dayData = data[day];
    const periods = [];

    // Get all time slots and sort them
    const timeSlots = Object.keys(dayData).sort();

    timeSlots.forEach((time) => {
      const classes = dayData[time];
      const classArray = Array.isArray(classes) ? classes : [classes];

      classArray.forEach(cls => {
        if (typeof cls === 'object' && cls !== null) {
          const info = extractSubjectInfo(cls);
          
          if (info.name) {
            // Add to subjects map
            const subjectKey = `${info.name}_${info.type}`;
            if (!subjectsMap.has(subjectKey)) {
              subjectsMap.set(subjectKey, {
                name: info.name,
                code: info.code || info.name.toUpperCase().replace(/\s+/g, '_'),
                type: info.type,
                color: generateColor(),
                teacher: info.faculty,
                room: info.room
              });
            }

            // Add period
            periods.push({
              subject: info.name,
              startTime: normalizeTime(time),
              endTime: '',
              room: info.room,
              type: info.type,
              section: info.section || 'All'
            });
          }
        }
      });
    });

    if (periods.length > 0) {
      schedule.push({ day, periods });
    }
  });

  return {
    subjects: Array.from(subjectsMap.values()),
    schedule
  };
};

/**
 * Format 2: Array of days with periods
 * Example: [{ day: "Monday", periods: [...] }]
 */
const parseArrayFormat = (data) => {
  const subjectsMap = new Map();
  const schedule = [];

  data.forEach(dayData => {
    if (!dayData || typeof dayData !== 'object') return;

    const day = dayData.day || dayData.name || dayData.dayName;
    if (!day || !DAYS.includes(day)) return;

    const periods = [];
    const periodsArray = dayData.periods || dayData.classes || dayData.schedule || [];

    periodsArray.forEach(period => {
      const info = extractSubjectInfo(period);
      
      if (info.name) {
        const subjectKey = `${info.name}_${info.type}`;
        if (!subjectsMap.has(subjectKey)) {
          subjectsMap.set(subjectKey, {
            name: info.name,
            code: info.code || info.name.toUpperCase().replace(/\s+/g, '_'),
            type: info.type,
            color: generateColor(),
            teacher: info.faculty,
            room: info.room
          });
        }

        periods.push({
          subject: info.name,
          startTime: normalizeTime(period.startTime || period.time || period.start),
          endTime: normalizeTime(period.endTime || period.end || ''),
          room: info.room,
          type: info.type,
          section: info.section || 'All'
        });
      }
    });

    if (periods.length > 0) {
      schedule.push({ day, periods });
    }
  });

  return {
    subjects: Array.from(subjectsMap.values()),
    schedule
  };
};

/**
 * Format 3: Flat list of classes
 * Example: [{ day: "Monday", time: "08:30", subject: "Math" }]
 */
const parseFlatFormat = (data) => {
  const subjectsMap = new Map();
  const scheduleMap = new Map();

  data.forEach(item => {
    if (!item || typeof item !== 'object') return;

    const day = item.day || item.dayName || item.weekday;
    if (!day || !DAYS.includes(day)) return;

    const info = extractSubjectInfo(item);
    if (!info.name) return;

    // Add to subjects
    const subjectKey = `${info.name}_${info.type}`;
    if (!subjectsMap.has(subjectKey)) {
      subjectsMap.set(subjectKey, {
        name: info.name,
        code: info.code || info.name.toUpperCase().replace(/\s+/g, '_'),
        type: info.type,
        color: generateColor(),
        teacher: info.faculty,
        room: info.room
      });
    }

    // Add to schedule
    if (!scheduleMap.has(day)) {
      scheduleMap.set(day, []);
    }

    scheduleMap.get(day).push({
      subject: info.name,
      startTime: normalizeTime(item.time || item.startTime || item.start),
      endTime: normalizeTime(item.endTime || item.end || ''),
      room: info.room,
      type: info.type,
      section: info.section || 'All'
    });
  });

  const schedule = Array.from(scheduleMap.entries()).map(([day, periods]) => ({
    day,
    periods
  }));

  return {
    subjects: Array.from(subjectsMap.values()),
    schedule
  };
};

/**
 * Format 4: Subjects-first format (already expected format)
 * Example: { subjects: [...], schedule: [...] }
 */
const parseStandardFormat = (data) => {
  const subjectsArray = data.subjects || data.subject || [];
  const scheduleArray = data.schedule || [];

  // Normalize subjects
  const subjects = subjectsArray.map(s => ({
    name: s.name || s.subject || 'Unknown',
    code: s.code || (s.name || '').toUpperCase().replace(/\s+/g, '_'),
    type: s.type || 'Lecture',
    color: s.color || generateColor(),
    teacher: s.teacher || s.faculty || '',
    room: s.room || s.location || ''
  }));

  // Normalize schedule
  const schedule = scheduleArray.map(d => ({
    day: d.day || d.name,
    periods: (d.periods || []).map(p => ({
      subject: p.subject || p.name,
      startTime: normalizeTime(p.startTime || p.time || p.start),
      endTime: normalizeTime(p.endTime || p.end || ''),
      room: p.room || '',
      type: p.type || 'L',
      section: p.section || 'All'
    }))
  }));

  return { subjects, schedule };
};

/**
 * Main parser - detects format and parses accordingly
 */
const parseUniversalTimetable = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data: must be an object or array');
  }

  // Handle nested timetable structure (e.g., { "timetable": { "Monday": ... } })
  let actualData = data;
  if (data.timetable && typeof data.timetable === 'object') {
    console.log('Detected nested timetable wrapper, unwrapping...');
    actualData = data.timetable;
  }

  let result = null;

  // Detect format and parse
  if (actualData.subjects || actualData.subject) {
    // Format 4: Standard format
    console.log('Detected: Standard format (subjects + schedule)');
    result = parseStandardFormat(actualData);
  } else if (Array.isArray(actualData)) {
    // Check if it's array of days or flat list
    if (actualData.length > 0 && actualData[0].day && (actualData[0].periods || actualData[0].classes)) {
      // Format 2: Array of days
      console.log('Detected: Array format (days with periods)');
      result = parseArrayFormat(actualData);
    } else {
      // Format 3: Flat list
      console.log('Detected: Flat list format');
      result = parseFlatFormat(actualData);
    }
  } else if (DAYS.some(day => day in actualData)) {
    // Format 1: Time-slot format
    console.log('Detected: Time-slot format (day -> time -> classes)');
    result = parseTimeSlotFormat(actualData);
  } else {
    throw new Error('Unable to detect timetable format. Please check your JSON structure.');
  }

  // Add metadata
  return {
    name: data.name || actualData.name || 'Imported Timetable',
    semester: data.semester || actualData.semester || 'Current',
    academicYear: data.academicYear || actualData.academicYear || new Date().getFullYear().toString(),
    subjects: result.subjects,
    schedule: result.schedule
  };
};

module.exports = {
  parseUniversalTimetable,
  normalizeTime,
  extractSubjectInfo
};
