import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import VerificationResultModal from './common/VerificationResultModal';
import { XMarkIcon, PlusIcon, TrashIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { quizApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function QuestionForm({ onSave, onCancel, existingQuestion = null, quizMetadata }) {
  const [question, setQuestion] = useState(
    existingQuestion || {
      text: '',
      options: ['', ''],
      correctAnswers: [],
      type: 'single'
    }
  );

  const toast = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleTextChange = (e) => setQuestion({ ...question, text: e.target.value });

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = value;
    setQuestion({ ...question, options: updatedOptions });
  };
  
  const handleAddOption = () => {
      setQuestion(q => ({...q, options: [...q.options, '']}));
  }
  
  const handleRemoveOption = (index) => {
      if (question.options.length <= 2) return; // Keep at least 2 options
      const updatedOptions = question.options.filter((_, i) => i !== index);
      // Also remove from correct answers if it was selected
      const updatedCorrectAnswers = question.correctAnswers.filter(ans => ans !== question.options[index]);
      setQuestion({ ...question, options: updatedOptions, correctAnswers: updatedCorrectAnswers });
  }

  const handleTypeChange = (newType) => {
    let newCorrectAnswers = question.correctAnswers;
    if (newType === 'single' && question.correctAnswers.length > 1) {
      newCorrectAnswers = question.correctAnswers.slice(0, 1);
    }
    setQuestion({ ...question, type: newType, correctAnswers: newCorrectAnswers });
  };

  const toggleCorrectAnswer = (option) => {
    const isSelected = question.correctAnswers.includes(option);
    let newCorrectAnswers;

    if (isSelected) {
      newCorrectAnswers = question.correctAnswers.filter(o => o !== option);
    } else {
      if (question.type === 'single') {
        newCorrectAnswers = [option];
      } else {
        newCorrectAnswers = [...question.correctAnswers, option];
      }
    }
    setQuestion({ ...question, correctAnswers: newCorrectAnswers });
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await quizApi.verifyQuestion({
        question: question,
        quizParams: quizMetadata
      });

      if (response.success || response.status === 'success') {
        setVerificationResult(response.data);
        setShowVerificationModal(true);
      } else {
        toast.showError(response.message || "Verification failed.");
      }
    } catch (err) {
      toast.showError(err.message || "An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(question);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <motion.div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-700 max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
            {existingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question Text */}
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="question-text">
                  Question
                  </label>
                  <textarea
                  id="question-text"
                  className="w-full px-3 py-2 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={question.text}
                  onChange={handleTextChange}
                  rows="2"
                  placeholder="e.g., What is the powerhouse of the cell?"
                  required
                  />
              </div>

              {/* Answer Type */}
              <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Answer Type</span>
                  <div className="flex gap-2 rounded-lg bg-gray-900/70 p-1 border-2 border-gray-700">
                      <button type="button" onClick={() => handleTypeChange('single')} className={`w-1/2 py-1 px-2 rounded-md transition-colors ${question.type === 'single' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>Single Choice</button>
                      <button type="button" onClick={() => handleTypeChange('multiple')} className={`w-1/2 py-1 px-2 rounded-md transition-colors ${question.type === 'multiple' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>Multiple Choice</button>
                  </div>
              </div>

              {/* Options */}
              <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Options</span>
                  <div className="space-y-2">
                  {question.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                          <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              placeholder={`Option ${index + 1}`}
                              required
                          />
                          <button type="button" onClick={() => toggleCorrectAnswer(option)} className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${question.correctAnswers.includes(option) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                              ✓
                          </button>
                          <button type="button" onClick={() => handleRemoveOption(index)} disabled={question.options.length <= 2} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                              <TrashIcon className="h-4 w-4" />
                          </button>
                      </div>
                  ))}
                  </div>
                  <Button type="button" onClick={handleAddOption} variant="secondary" className="mt-3 text-xs" size="sm">
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Add Option
                  </Button>
              </div>
          </form>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-700 bg-gray-900/30">
          <Button type="button" onClick={onCancel} variant="primary" size="sm">Cancel</Button>
          <Button 
            type="button" 
            onClick={handleVerify}
            variant="secondary"
            size="sm"
            disabled={isVerifying || !question.text}
          >
            {isVerifying ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ShieldCheckIcon className="h-4 w-4" />}
            <span className="ml-1">{isVerifying ? 'Verifying...' : 'Verify'}</span>
          </Button>
          <Button 
            onClick={(e) => { e.preventDefault(); handleSubmit(e); }} 
            variant="accent" 
            size="sm" 
            disabled={!question.text || question.correctAnswers.length === 0}
          >
            Save
          </Button>
        </div>
      </motion.div>
      {showVerificationModal && (
        <VerificationResultModal
          result={verificationResult}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
}

export default QuestionForm; 