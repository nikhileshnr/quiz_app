import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionForm from '../components/QuestionForm';
import { quizApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import SelectField from '../components/common/SelectField';
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

function CreateQuiz() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id: quizId } = useParams(); // Get quiz ID from URL
  
  const [quizData, setQuizData] = useState({
    title: '',
    level: 'undergrad',
    difficulty: 'medium',
    questions: []
  });
  
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine if we're in "edit" mode
  const isEditMode = Boolean(quizId);
  
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      quizApi.getById(quizId)
        .then(response => {
          if (response.success || response.status === 'success') {
            setQuizData(response.data);
          } else {
            toast.showError(response.message || 'Failed to fetch quiz data.');
            navigate('/quizzes');
          }
        })
        .catch(err => {
          toast.showError(err.message || 'An error occurred while fetching the quiz.');
          navigate('/quizzes');
        })
        .finally(() => setIsLoading(false));
    }
  }, [quizId, isEditMode, navigate, toast]);
  
  const handleQuizDataChange = (e) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };
  
  const handleSaveQuestion = (question) => {
    const updatedQuestions = [...quizData.questions];
    if (editingQuestion !== null) {
      updatedQuestions[editingQuestion.index] = question;
      toast.showSuccess('Question updated');
    } else {
      updatedQuestions.push(question);
      toast.showSuccess('Question added');
    }
    setQuizData({ ...quizData, questions: updatedQuestions });
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };
  
  const handleEditQuestion = (index) => {
    setEditingQuestion({ question: quizData.questions[index], index });
    setShowQuestionForm(true);
  };
  
  const handleRemoveQuestion = (index) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter((_, i) => i !== index)
    });
    toast.showInfo('Question removed');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quizData.questions.length === 0) {
      toast.showError('Please add at least one question');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await quizApi.update(quizId, quizData);
        toast.showSuccess('Quiz updated successfully!');
        navigate('/quizzes', { state: { message: 'Quiz updated successfully!'} });
      } else {
        await quizApi.createManual(quizData);
        toast.showSuccess('Quiz created successfully!');
        navigate('/quizzes', { state: { message: 'Quiz created successfully!'} });
      }
    } catch (err) {
      toast.showError(err.message || (isEditMode ? 'Failed to update quiz' : 'Failed to create quiz'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const levelOptions = [{ value: 'school', label: 'School' }, { value: 'undergrad', label: 'Undergraduate' }, { value: 'postgrad', label: 'Postgraduate' }];
  const difficultyOptions = [{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }];

  return (
    <>
      <div className="bg-gray-900 min-h-screen text-white p-6 sm:p-10">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
                {isEditMode ? <PencilIcon className="w-12 h-12 mx-auto text-purple-400" /> : <BookOpenIcon className="w-12 h-12 mx-auto text-purple-400" />}
                <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4">{isEditMode ? 'Edit Your Quiz' : 'Create Your Own Quiz'}</h1>
                <p className="text-gray-400 mt-2">{isEditMode ? 'Refine the details of your existing quiz.' : 'Craft every detail of your quiz from scratch.'}</p>
            </div>
          
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <ArrowPathIcon className="w-10 h-10 text-purple-400 animate-spin" />
                <p className="ml-4 text-lg">Loading Quiz Data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                {/* Quiz Metadata */}
                <div className="space-y-6">
                 <FormField label="Quiz Title" name="title" value={quizData.title} onChange={handleQuizDataChange} placeholder="e.g., 'A Brief History of Time'" required />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Education Level" name="level" value={quizData.level} onChange={handleQuizDataChange} options={levelOptions} required />
                    <SelectField label="Difficulty" name="difficulty" value={quizData.difficulty} onChange={handleQuizDataChange} options={difficultyOptions} required />
                 </div>
                </div>
                
                {/* Questions Section */}
                <div className="border-t border-gray-700/50 pt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Questions ({quizData.questions.length})</h2>
                    <Button type="button" variant="secondary" onClick={() => { setEditingQuestion(null); setShowQuestionForm(true); }}>
                      <PlusIcon className="h-5 w-5 mr-2" /> Add Question
                    </Button>
                  </div>
                  
                  {quizData.questions.length === 0 ? (
                    <div className="bg-gray-800/70 p-6 text-center rounded-lg border-2 border-dashed border-gray-700">
                      <p className="text-gray-500">No questions added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizData.questions.map((q, index) => (
                        <div key={index} className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                          <p className="font-semibold text-gray-200 truncate pr-4">{index + 1}. {q.text}</p>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button type="button" onClick={() => handleEditQuestion(index)} size="sm" className="!p-2"><PencilIcon className="h-4 w-4" /></Button>
                            <Button type="button" onClick={() => handleRemoveQuestion(index)} size="sm" className="!p-2 !bg-red-500/20 hover:!bg-red-500/40 text-red-400"><TrashIcon className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end pt-8 border-t border-gray-700/50">
                  <Button type="submit" variant="primary" size="lg" disabled={isSubmitting || quizData.questions.length === 0}>
                    {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Creating Quiz...') : (isEditMode ? 'Save Changes' : 'Create & Save Quiz')}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showQuestionForm && (
          <QuestionForm
            onSave={handleSaveQuestion}
            onCancel={() => { setShowQuestionForm(false); setEditingQuestion(null); }}
            existingQuestion={editingQuestion?.question}
            quizMetadata={{ title: quizData.title, difficulty: quizData.difficulty, level: quizData.level }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default CreateQuiz;