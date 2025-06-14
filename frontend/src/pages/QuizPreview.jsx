import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { quizApi } from '../services/api';
import Button from '../components/common/Button';
import { CheckCircleIcon, ExclamationTriangleIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function QuizPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    // Check if we have quiz data in the location state
    if (location.state?.quiz) {
      setQuiz(location.state.quiz);
      if (location.state.message) {
        setMessage(location.state.message);
      }
    } else {
      // No quiz data, redirect to the generator
      setError('No quiz data available. Please generate a quiz first.');
      setTimeout(() => navigate('/generate-quiz'), 2000);
    }
  }, [location, navigate]);

  const handleSaveQuiz = async () => {
    if (!quiz) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Prepare the quiz data for saving
      const quizData = {
        title: quiz.title || quiz.topic,
        difficulty: quiz.difficulty,
        level: quiz.level,
        questions: quiz.questions,
        generationMethod: 'ai'
      };
      
      // Save the quiz to the database - the backend will assign the current user as creator
      const response = await quizApi.createManual(quizData);
      
      if (response && response.data && response.data._id) {
        // Navigate to the saved quiz
        navigate(`/quiz/${response.data._id}`, {
          state: { message: 'Quiz saved successfully!' }
        });
      } else {
        throw new Error('Failed to save quiz.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditQuestion = (index) => {
    setEditingQuestion(index);
    setEditedQuestion({...quiz.questions[index]});
    setVerificationResult(null);
  };

  const handleUpdateQuestion = (field, value) => {
    setEditedQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveQuestion = () => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[editingQuestion] = editedQuestion;
    
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
    
    setEditingQuestion(null);
    setEditedQuestion(null);
    setVerificationResult(null);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleRegenerateQuestion = async (index) => {
    setIsRegenerating(true);
    setError(null);
    
    try {
      const response = await quizApi.regenerateQuestions({
        quizParams: {
          topic: quiz.title || quiz.topic,
          level: quiz.level,
          difficulty: quiz.difficulty,
        },
        indicesToRegenerate: [index],
        currentQuestions: quiz.questions
      });
      
      if (response.data && response.data.length > 0) {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[index] = response.data[0];
        
        setQuiz(prev => ({
          ...prev,
          questions: updatedQuestions
        }));
        
        setMessage('Question regenerated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate question. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleVerifyQuestion = async () => {
    if (!editedQuestion) return;
    
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await quizApi.verifyQuestion({
        question: editedQuestion,
        originalQuestion: quiz.questions[editingQuestion],
        quizParams: {
          topic: quiz.title || quiz.topic || '',
          level: quiz.level,
          difficulty: quiz.difficulty,
        }
      });
      
      if (response && response.data) {
        setVerificationResult(response.data);
      } else {
        throw new Error('Invalid verification response.');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify question. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegenerateAllQuestions = async () => {
    setIsRegenerating(true);
    setError(null);
    
    try {
      // Create new quiz with same parameters
      const response = await quizApi.createWithAI({
        topic: quiz.title || quiz.topic || '',
        level: quiz.level,
        difficulty: quiz.difficulty,
        numQuestions: quiz.questions.length
      });
      
      if (response && response.data) {
        // Update with new questions
        setQuiz(response.data);
        setMessage('All questions regenerated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to regenerate questions.');
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate questions. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!quiz) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 sm:p-10 flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div className="text-red-400">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {message && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-center">
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                <p className="text-green-300 font-semibold">{message}</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-center">
              <div className="flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" />
                <p className="text-red-300 font-semibold">{error}</p>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-6">
              <span className="px-3 py-1 bg-gray-700/50 rounded-full">Topic: {quiz.topic}</span>
              <span className="px-3 py-1 bg-gray-700/50 rounded-full">Level: {quiz.level}</span>
              <span className="px-3 py-1 bg-gray-700/50 rounded-full">Difficulty: {quiz.difficulty}</span>
              <span className="px-3 py-1 bg-gray-700/50 rounded-full">{quiz.questions.length} Questions</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <p className="text-gray-300">Review your AI-generated quiz before saving.</p>
                <Button
                  onClick={handleRegenerateAllQuestions}
                  variant="secondary"
                  disabled={isRegenerating}
                  className="flex items-center"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  {isRegenerating ? 'Regenerating...' : 'Regenerate All'}
                </Button>
              </div>
              <Button 
                onClick={handleSaveQuiz} 
                variant="primary" 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Quiz'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-lg"
              >
                {editingQuestion === index ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text
                      </label>
                      <textarea
                        value={editedQuestion.text}
                        onChange={(e) => handleUpdateQuestion('text', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600 rounded-lg text-white"
                        rows="3"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Options
                      </label>
                      {editedQuestion.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...editedQuestion.options];
                              newOptions[optIndex] = e.target.value;
                              handleUpdateQuestion('options', newOptions);
                            }}
                            className="w-full px-4 py-2 bg-gray-700/60 border border-gray-600 rounded-lg text-white"
                          />
                          <input
                            type="checkbox"
                            checked={editedQuestion.correctAnswers.includes(option)}
                            onChange={(e) => {
                              let newCorrectAnswers = [...editedQuestion.correctAnswers];
                              if (e.target.checked) {
                                newCorrectAnswers.push(option);
                              } else {
                                newCorrectAnswers = newCorrectAnswers.filter(ans => ans !== option);
                              }
                              handleUpdateQuestion('correctAnswers', newCorrectAnswers);
                            }}
                            className="ml-2 h-5 w-5 accent-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* AI Verification Result */}
                    {verificationResult && (
                      <div className={`p-4 rounded-lg ${
                        verificationResult.isCorrect 
                          ? 'bg-green-900/20 border border-green-500/50' 
                          : 'bg-red-900/20 border border-red-500/50'
                      }`}>
                        <div className="flex items-start">
                          {verificationResult.isCorrect 
                            ? <CheckCircleIcon className="h-5 w-5 text-green-400 mt-1 mr-2" />
                            : <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-1 mr-2" />
                          }
                          <p className={`${verificationResult.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                            {verificationResult.feedback || verificationResult.explanation}
                          </p>
                        </div>
                        
                        {verificationResult.suggestions && verificationResult.suggestions.length > 0 && (
                          <div className="mt-2 ml-7">
                            <p className="text-sm text-gray-400 font-medium">Suggestions:</p>
                            <ul className="list-disc list-inside text-sm text-gray-400">
                              {verificationResult.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <Button 
                        onClick={handleVerifyQuestion} 
                        variant="secondary"
                        disabled={isVerifying}
                        className="flex items-center"
                      >
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        {isVerifying ? 'Verifying...' : 'Verify with AI'}
                      </Button>
                      
                      <div>
                        <Button 
                          onClick={() => setEditingQuestion(null)} 
                          variant="secondary"
                          className="mr-2"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveQuestion} 
                          variant="primary"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-medium text-white">Question {index + 1}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRegenerateQuestion(index)}
                          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                          disabled={isRegenerating}
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-200 mb-4">{question.text}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            question.correctAnswers.includes(option)
                              ? 'border-green-500/50 bg-green-900/10'
                              : 'border-gray-700 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-600 mr-3">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className={question.correctAnswers.includes(option) ? 'text-green-400' : 'text-gray-300'}>
                              {option}
                            </span>
                            {question.correctAnswers.includes(option) && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button 
              onClick={() => navigate('/generate-quiz')} 
              variant="secondary"
            >
              Back to Generator
            </Button>
            <Button 
              onClick={handleSaveQuiz} 
              variant="primary" 
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizPreview; 