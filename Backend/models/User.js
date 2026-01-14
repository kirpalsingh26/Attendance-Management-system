const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: 6,
    select: false
  },
  profilePicture: {
    type: String,
    default: '/profile_pic_default.svg'
    // Can store base64 image data or URL
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local'
  },
  providerId: {
    type: String,
    sparse: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  semesterStartDate: {
    type: Date,
    default: null
  },
  semesterEndDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
