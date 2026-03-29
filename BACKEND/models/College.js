const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Engineering', 'Medical', 'Law', 'Arts', 'Science', 'Business', 'Other']
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  },
  state: String,
  city: String,
  location: {
    type: String,
    required: true
  },
  establishedYear: {
    type: Number,
    required: true,
    min: 1700,
    max: new Date().getFullYear()
  },
  totalStudents: {
    type: Number,
    required: true,
    min: 1
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  degreeLevels: [{
    level: {
      type: String,
      enum: ['Undergraduate', 'Postgraduate', 'Doctorate', 'Diploma']
    },
    programs: [{
      name: String,
      duration: String,
      seats: Number,
      fees: String
    }]
  }],
  courses: [{
    name: String,
    duration: String,
    seats: Number,
    level: {
      type: String,
      enum: ['B.Tech', 'M.Tech', 'MBA', 'MBBS', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'LLB', 'LLM', 'PhD', 'Diploma']
    }
  }],
  facilities: [String],
  contact: {
    email: String,
    phone: String,
    website: String
  },
  description: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
collegeSchema.index({ type: 1 });
collegeSchema.index({ country: 1 });
collegeSchema.index({ 'courses.level': 1 });

module.exports = mongoose.model('College', collegeSchema);