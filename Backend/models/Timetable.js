const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  teacher: {
    type: String,
    trim: true
  },
  room: {
    type: String,
    trim: true
  }
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  periods: [periodSchema]
});

const timetableSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'My Timetable'
  },
  semester: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    trim: true
  },
  schedule: [dayScheduleSchema],
  subjects: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['Lecture', 'Practical', 'Tutorial', 'Both'],
      default: 'Lecture'
    },
    color: {
      type: String,
      default: '#3B82F6'
    },
    classTime: {
      type: String,
      trim: true
    },
    teacher: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
