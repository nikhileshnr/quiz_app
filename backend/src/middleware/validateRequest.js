const Joi = require('joi');

/**
 * Create a validation middleware with the provided schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation Error',
        errors: errorDetails
      });
    }

    // Validation passed, continue to the next middleware
    next();
  };
};

/**
 * Schema for manual quiz creation
 */
const quizSchema = Joi.object({
  title: Joi.string().required().max(200).trim()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required()
    .messages({
      'string.base': 'Difficulty must be a string',
      'any.only': 'Difficulty must be easy, medium, or hard',
      'any.required': 'Difficulty is required'
    }),
  
  level: Joi.string().valid('school', 'undergrad', 'postgrad').required()
    .messages({
      'string.base': 'Level must be a string',
      'any.only': 'Level must be school, undergrad, or postgrad',
      'any.required': 'Level is required'
    }),
  
  questions: Joi.array().items(
    Joi.object({
      text: Joi.string().required().trim()
        .messages({
          'string.base': 'Question text must be a string',
          'string.empty': 'Question text cannot be empty',
          'any.required': 'Question text is required'
        }),
      
      options: Joi.array().items(Joi.string().trim()).min(2).required()
        .messages({
          'array.base': 'Options must be an array',
          'array.min': 'At least 2 options are required',
          'any.required': 'Options are required'
        }),
      
      correctAnswers: Joi.array().items(Joi.string().trim()).min(1).required()
        .messages({
          'array.base': 'Correct answers must be an array',
          'array.min': 'At least 1 correct answer is required',
          'any.required': 'Correct answers are required'
        }),
      
      type: Joi.string().valid('single', 'multiple').required()
        .messages({
          'string.base': 'Question type must be a string',
          'any.only': 'Question type must be single or multiple',
          'any.required': 'Question type is required'
        })
    })
  ).min(1).required()
    .messages({
      'array.base': 'Questions must be an array',
      'array.min': 'At least 1 question is required',
      'any.required': 'Questions are required'
    }),
  
  // createdBy is automatically set in the controller
  createdBy: Joi.string().valid('manual', 'ai')
});

/**
 * Schema for AI quiz generation request
 */
const aiQuizRequestSchema = Joi.object({
  topic: Joi.string().required().trim()
    .messages({
      'string.base': 'Topic must be a string',
      'string.empty': 'Topic cannot be empty',
      'any.required': 'Topic is required'
    }),
  
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required()
    .messages({
      'string.base': 'Difficulty must be a string',
      'any.only': 'Difficulty must be easy, medium, or hard',
      'any.required': 'Difficulty is required'
    }),
  
  level: Joi.string().valid('school', 'undergrad', 'postgrad').required()
    .messages({
      'string.base': 'Level must be a string',
      'any.only': 'Level must be school, undergrad, or postgrad',
      'any.required': 'Level is required'
    }),
  
  questionCount: Joi.number().integer().min(1).max(20).default(5)
    .messages({
      'number.base': 'Question count must be a number',
      'number.min': 'Question count must be at least 1',
      'number.max': 'Question count cannot exceed 20',
      'number.integer': 'Question count must be an integer'
    })
});

module.exports = {
  validateRequest,
  schemas: {
    quizSchema,
    aiQuizRequestSchema
  }
}; 