// This is a skeleton for the Quiz model
// Will be implemented with MongoDB/Mongoose when we set up the database connection

const mongoose = require('mongoose');

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
    type: String,
    default: 'manual',
    enum: {
      values: ['manual', 'ai'],
      message: 'Created by must be: manual or ai'
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  toJSON: { virtuals: true }, // Include virtuals when data is converted to JSON
  toObject: { virtuals: true } // Include virtuals when data is converted to a JavaScript object
});

// Virtual property for the number of questions
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Index for improved search performance
quizSchema.index({ title: 'text' });
quizSchema.index({ difficulty: 1, level: 1 });

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