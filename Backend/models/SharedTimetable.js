const mongoose = require('mongoose');
const crypto = require('crypto');

const sharedTimetableSchema = new mongoose.Schema({
  shareId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timetableData: {
    name: { type: String },
    semester: { type: String },
    academicYear: { type: String },
    schedule: [{
      day: { type: String },
      periods: [{
        subject: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        teacher: { type: String },
        room: { type: String }
      }]
    }],
    subjects: [{
      name: { type: String },
      code: { type: String },
      type: { type: String },
      color: { type: String },
      classTime: { type: String },
      teacher: { type: String },
      room: { type: String }
    }]
  },
  permissions: {
    type: String,
    enum: ['view', 'import'],
    default: 'import'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 days (1 year)
  },
  viewCount: {
    type: Number,
    default: 0
  },
  importCount: {
    type: Number,
    default: 0
  },
  importedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    importedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster lookups (shareId already has unique:true, no need for separate index)
sharedTimetableSchema.index({ owner: 1 });
sharedTimetableSchema.index({ expiresAt: 1 });

// Method to check if share link is valid
sharedTimetableSchema.methods.isValid = function() {
  return this.isActive && this.expiresAt > new Date();
};

module.exports = mongoose.model('SharedTimetable', sharedTimetableSchema);
