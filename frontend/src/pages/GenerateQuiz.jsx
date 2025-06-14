import { useState } from 'react';
import { quizApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import SelectField from '../components/common/SelectField';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

function GenerateQuiz() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    level: 'school',
    difficulty: 'easy',
    numQuestions: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await quizApi.createWithAI({
        ...formData,
        numQuestions: parseInt(formData.numQuestions, 10)
      });
      
      if (response && response.data) {
        navigate('/quiz-preview', { 
          state: { 
            quiz: response.data,
            message: 'AI-generated quiz created successfully!' 
          }
        });
      } else {
        throw new Error('Invalid response from server when generating quiz.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please check your input and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const levelOptions = [
      { value: 'school', label: 'School' },
      { value: 'undergrad', label: 'Undergraduate' },
      { value: 'postgrad', label: 'Postgraduate' },
  ];

  const difficultyOptions = [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 sm:p-10 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 sm:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <div className="text-center mb-8">
                <SparklesIcon className="w-12 h-12 mx-auto text-purple-400" />
                <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4">AI Quiz Generator</h1>
                <p className="text-gray-400 mt-2">Let our AI create a custom quiz for you.</p>
            </div>
          
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" />
                    <p className="text-red-300 font-semibold">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
              
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
                    Topic or Description
                  </label>
                  <textarea
                    id="topic"
                    name="topic"
                    rows="4"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., 'The basics of quantum physics' or 'A history of the Roman Empire'"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SelectField
                    label="Level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    options={levelOptions}
                  />
                  <SelectField
                    label="Difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    options={difficultyOptions}
                  />
                  <FormField
                    label="Number of Questions"
                    name="numQuestions"
                    type="number"
                    value={formData.numQuestions}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-4">
                    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Quiz'}
                    </Button>
                </div>
              </form>
        </motion.div>
      </div>
    </div>
  );
}

export default GenerateQuiz; 