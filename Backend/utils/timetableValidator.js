/**
 * Timetable JSON Validator
 * Validates and sanitizes uploaded timetable JSON structures
 */

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_SUBJECT_TYPES = ['Lecture', 'Practical', 'Tutorial', 'Both'];

/**
 * Validates time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean}
 */
const isValidTimeFormat = (time) => {
  if (!time || typeof time !== 'string') return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};

/**
 * Validates hex color format
 * @param {string} color - Color string to validate
 * @returns {boolean}
 */
const isValidColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
};

/**
 * Validates a single subject object
 * @param {object} subject - Subject object to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validateSubject = (subject, index) => {
  const errors = [];

  if (!subject.name || typeof subject.name !== 'string' || subject.name.trim() === '') {
    errors.push(`Subject at index ${index}: name is required and must be a non-empty string`);
  }

  if (subject.type && !VALID_SUBJECT_TYPES.includes(subject.type)) {
    errors.push(`Subject at index ${index}: type must be one of ${VALID_SUBJECT_TYPES.join(', ')}`);
  }

  if (subject.color && !isValidColor(subject.color)) {
    errors.push(`Subject at index ${index}: color must be a valid hex color (e.g., #3B82F6)`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validates a single period object
 * @param {object} period - Period object to validate
 * @param {string} day - Day name for error messages
 * @param {number} index - Period index for error messages
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validatePeriod = (period, day, index) => {
  const errors = [];

  if (!period.subject || typeof period.subject !== 'string' || period.subject.trim() === '') {
    errors.push(`${day} - Period ${index + 1}: subject is required and must be a non-empty string`);
  }

  if (!period.startTime || !isValidTimeFormat(period.startTime)) {
    errors.push(`${day} - Period ${index + 1}: startTime must be in HH:MM format (e.g., 09:30)`);
  }

  if (!period.endTime || !isValidTimeFormat(period.endTime)) {
    errors.push(`${day} - Period ${index + 1}: endTime must be in HH:MM format (e.g., 10:30)`);
  }

  // Validate time logic
  if (period.startTime && period.endTime && isValidTimeFormat(period.startTime) && isValidTimeFormat(period.endTime)) {
    const [startHour, startMin] = period.startTime.split(':').map(Number);
    const [endHour, endMin] = period.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      errors.push(`${day} - Period ${index + 1}: endTime must be after startTime`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validates a day schedule object
 * @param {object} daySchedule - Day schedule object to validate
 * @param {number} index - Day index for error messages
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validateDaySchedule = (daySchedule, index) => {
  const errors = [];

  if (!daySchedule.day || !VALID_DAYS.includes(daySchedule.day)) {
    errors.push(`Schedule at index ${index}: day must be one of ${VALID_DAYS.join(', ')}`);
  }

  if (!Array.isArray(daySchedule.periods)) {
    errors.push(`Schedule at index ${index}: periods must be an array`);
    return { valid: false, errors };
  }

  // Validate each period
  daySchedule.periods.forEach((period, periodIndex) => {
    const periodValidation = validatePeriod(period, daySchedule.day, periodIndex);
    errors.push(...periodValidation.errors);
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Main validation function for timetable JSON
 * @param {object} timetableData - Complete timetable data to validate
 * @returns {object} - { valid: boolean, errors: string[], sanitized: object }
 */
const validateTimetableJSON = (timetableData) => {
  const errors = [];
  
  // Check if data is an object
  if (!timetableData || typeof timetableData !== 'object') {
    return {
      valid: false,
      errors: ['Timetable data must be a valid JSON object'],
      sanitized: null
    };
  }

  // Accept both 'subjects' or 'subject' field
  const subjectsArray = timetableData.subjects || timetableData.subject;
  
  // Validate subjects array
  if (!Array.isArray(subjectsArray)) {
    errors.push('subjects or subject field is required and must be an array');
  } else if (subjectsArray.length === 0) {
    errors.push('At least one subject is required');
  } else {
    subjectsArray.forEach((subject, index) => {
      const subjectValidation = validateSubject(subject, index);
      errors.push(...subjectValidation.errors);
    });
  }

  // Validate schedule array (now optional)
  if (timetableData.schedule) {
    if (!Array.isArray(timetableData.schedule)) {
      errors.push('schedule field must be an array if provided');
    } else {
      timetableData.schedule.forEach((daySchedule, index) => {
        const scheduleValidation = validateDaySchedule(daySchedule, index);
        errors.push(...scheduleValidation.errors);
      });
    }
  }

  // Validate cross-references: ensure all period subjects exist in subjects array (only if schedule exists)
  if (Array.isArray(subjectsArray) && Array.isArray(timetableData.schedule)) {
    const subjectNames = new Set(subjectsArray.map(s => s.name));
    
    timetableData.schedule.forEach((daySchedule) => {
      if (Array.isArray(daySchedule.periods)) {
        daySchedule.periods.forEach((period, periodIndex) => {
          if (period.subject && !subjectNames.has(period.subject)) {
            errors.push(
              `${daySchedule.day} - Period ${periodIndex + 1}: subject "${period.subject}" not found in subjects list`
            );
          }
        });
      }
    });
  }

  // Sanitize data (trim strings, set defaults)
  const sanitized = {
    name: typeof timetableData.name === 'string' ? timetableData.name.trim() : 'My Timetable',
    semester: typeof timetableData.semester === 'string' ? timetableData.semester.trim() : '',
    academicYear: typeof timetableData.academicYear === 'string' ? timetableData.academicYear.trim() : '',
    subjects: Array.isArray(subjectsArray) ? subjectsArray.map(subject => ({
      name: subject.name.trim(),
      code: typeof subject.code === 'string' ? subject.code.trim() : '',
      type: subject.type || 'Lecture',
      color: subject.color || '#3B82F6',
      classTime: typeof subject.classTime === 'string' ? subject.classTime.trim() : '',
      teacher: typeof subject.teacher === 'string' ? subject.teacher.trim() : '',
      room: typeof subject.room === 'string' ? subject.room.trim() : ''
    })) : [],
    schedule: Array.isArray(timetableData.schedule) ? timetableData.schedule.map(daySchedule => ({
      day: daySchedule.day,
      periods: Array.isArray(daySchedule.periods) ? daySchedule.periods.map(period => ({
        subject: period.subject.trim(),
        startTime: period.startTime,
        endTime: period.endTime,
        teacher: typeof period.teacher === 'string' ? period.teacher.trim() : '',
        room: typeof period.room === 'string' ? period.room.trim() : ''
      })) : []
    })) : []
  };

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
};

/**
 * Extracts unique subjects from timetable data
 * @param {object} timetableData - Timetable data
 * @returns {array} - Array of unique subjects
 */
const extractSubjectsFromSchedule = (schedule) => {
  const subjectsMap = new Map();
  
  if (Array.isArray(schedule)) {
    schedule.forEach(daySchedule => {
      if (Array.isArray(daySchedule.periods)) {
        daySchedule.periods.forEach(period => {
          if (period.subject && !subjectsMap.has(period.subject)) {
            subjectsMap.set(period.subject, {
              name: period.subject,
              teacher: period.teacher || '',
              room: period.room || ''
            });
          }
        });
      }
    });
  }
  
  return Array.from(subjectsMap.values());
};

module.exports = {
  validateTimetableJSON,
  extractSubjectsFromSchedule,
  VALID_DAYS,
  VALID_SUBJECT_TYPES
};
