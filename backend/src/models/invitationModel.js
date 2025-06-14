const mongoose = require('mongoose');
const { Schema } = mongoose;

const invitationSchema = new mongoose.Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  responseAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound index to ensure uniqueness of quiz-student pairs
invitationSchema.index({ quiz: 1, student: 1 }, { unique: true });

// Indexes for common queries
invitationSchema.index({ teacher: 1, status: 1 });
invitationSchema.index({ student: 1, status: 1 });

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation; 