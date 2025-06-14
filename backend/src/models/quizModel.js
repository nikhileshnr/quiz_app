// This is a skeleton for the Quiz model
// Will be implemented with MongoDB/Mongoose when we set up the database connection

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Question schema
const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Question options are required'],
    validate: {
      validator: function(options) {
        return options.length >= 2; // At least 2 options are required
      },
      message: 'A question must have at least 2 options'
    }
  },
  correctAnswers: {
    type: [String],
    required: [true, 'Correct answer(s) are required'],
    validate: {
      validator: function(correctAnswers) {
        // At least one correct answer is required
        if (correctAnswers.length < 1) return false;
        
        // All correct answers must be in the options array
        return correctAnswers.every(answer => this.options.includes(answer));
      },
      message: 'Correct answers must be included in the options array'
    }
  },
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: {
      values: ['single', 'multiple'],
      message: 'Question type must be either "single" or "multiple"'
    }
  }
});

// Custom validation for single-choice questions to have exactly one correct answer
questionSchema.path('correctAnswers').validate(function(correctAnswers) {
  if (this.type === 'single' && correctAnswers.length !== 1) {
    return false;
  }
  return true;
}, 'Single-choice questions must have exactly one correct answer');

// Define a schema for student quiz attempts
const attemptSchema = new mongoose.Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required']
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum possible score is required']
  },
  answers: [{
    questionIndex: Number,
    selectedOptions: [String],
    isCorrect: Boolean
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Define the Quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'A quiz title must have less than 200 characters']
  },
  difficulty: {
    type: String,
    required: [true, 'Quiz difficulty is required'],
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be: easy, medium, or hard'
    }
  },
  level: {
    type: String,
    required: [true, 'Quiz academic level is required'],
    enum: {
      values: ['school', 'undergrad', 'postgrad'],
      message: 'Level must be: school, undergrad, or postgrad'
    }
  },
  questions: {
    type: [questionSchema],
    required: [true, 'Questions are required'],
    validate: {
      validator: function(questions) {
        return questions.length > 0;
      },
      message: 'A quiz must have at least one question'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Quiz creator is required']
  },
  generationMethod: {
    type: String,
    default: 'manual',
    enum: {
      values: ['manual', 'ai'],
      message: 'Creation method must be: manual or ai'
    }
  },
  invitedStudents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  attempts: [attemptSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  timeLimit: {
    type: Number, // Time limit in minutes, 0 means no limit
    default: 0
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  toJSON: { virtuals: true }, // Include virtuals when data is converted to JSON
  toObject: { virtuals: true } // Include virtuals when data is converted to a JavaScript object
});

// Virtual property for the number of questions
quizSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Virtual property for the average score
quizSchema.virtual('averageScore').get(function() {
  if (!this.attempts || this.attempts.length === 0) return 0;
  
  const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return totalScore / this.attempts.length;
});

// Index for improved search performance
quizSchema.index({ title: 'text' });
quizSchema.index({ difficulty: 1, level: 1 });
quizSchema.index({ createdBy: 1 }); // Index for creator lookups

// Pre-save hook to ensure consistency
quizSchema.pre('save', function(next) {
  // Ensure each question's type matches its correctAnswers length
  this.questions.forEach(question => {
    if (question.type === 'single' && question.correctAnswers.length !== 1) {
      question.type = 'multiple';
    }
  });
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 