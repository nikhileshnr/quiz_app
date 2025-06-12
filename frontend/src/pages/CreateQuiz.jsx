import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionForm from '../components/QuestionForm';
import { quizApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function CreateQuiz() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [quizData, setQuizData] = useState({
    title: '',
    level: 'undergrad',
    difficulty: 'medium',
    questions: []
  });
  
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle changes to quiz title, level, and difficulty
  const handleQuizDataChange = (e) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: value
    });
  };
  
  // Add a new question or update an existing one
  const handleSaveQuestion = (question) => {
    const updatedQuestions = [...quizData.questions];
    
    if (editingQuestionIndex !== null) {
      // Update existing question
      updatedQuestions[editingQuestionIndex] = question;
      toast.showSuccess('Question updated successfully');
    } else {
      // Add new question
      updatedQuestions.push(question);
      toast.showSuccess('Question added successfully');
    }
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
    
    // Close form and reset editing state
    setShowQuestionForm(false);
    setEditingQuestionIndex(null);
  };
  
  // Edit an existing question
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };
  
  // Remove a question
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
    toast.showInfo('Question removed');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (quizData.questions.length === 0) {
      toast.showError('Please add at least one question to the quiz');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Send data to the backend
      const result = await quizApi.createManual(quizData);
      
      // Reset the form
      setQuizData({
        title: '',
        level: 'undergrad',
        difficulty: 'medium',
        questions: []
      });
      
      // Show success message and navigate to the quizzes list
      toast.showSuccess('Quiz created successfully!');
      navigate('/quizzes');
      
    } catch (err) {
      toast.showError(err.message || 'Failed to create quiz. Please try again.');
      console.error('Quiz creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">Create New Quiz</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Quiz Title */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizDataChange}
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              
              {/* Quiz Level */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="level">
                  Education Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={quizData.level}
                  onChange={handleQuizDataChange}
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="school">School</option>
                  <option value="undergrad">Undergraduate</option>
                  <option value="postgrad">Postgraduate</option>
                </select>
              </div>
              
              {/* Quiz Difficulty */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="difficulty">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={quizData.difficulty}
                  onChange={handleQuizDataChange}
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            {/* Questions Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Questions</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestionIndex(null);
                    setShowQuestionForm(true);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
                >
                  Add Question
                </button>
              </div>
              
              {/* Question List */}
              {quizData.questions.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-lg">
                  <p className="text-gray-500">No questions added yet. Click "Add Question" to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizData.questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{question.text}</h3>
                          <p className="text-sm text-gray-500">
                            {question.type === 'single' ? 'Single' : 'Multiple'} choice question with {question.correctAnswers.length} correct answer(s)
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(index)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-6 py-3 font-medium rounded-lg ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-700 text-white'
                }`}
                disabled={isSubmitting || quizData.questions.length === 0}
              >
                {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Question Form */}
        {showQuestionForm && (
          <QuestionForm
            onSave={handleSaveQuestion}
            onCancel={() => {
              setShowQuestionForm(false);
              setEditingQuestionIndex(null);
            }}
            existingQuestion={editingQuestionIndex !== null ? quizData.questions[editingQuestionIndex] : null}
          />
        )}
      </div>
    </div>
  );
}

export default CreateQuiz;