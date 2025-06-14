import { useState } from 'react';
import { quizApi } from '../services/api';
import Button from './common/Button';
import { PencilSquareIcon, SparklesIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

function QuestionEditor({ 
  question, 
  quizParams, 
  onSave, 
  onRegenerate,
  onCancel 
}) {
  const [editedQuestion, setEditedQuestion] = useState({...question});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleTextChange = (e) => {
    setEditedQuestion({ ...editedQuestion, text: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...editedQuestion.options];
    updatedOptions[index] = value;
    setEditedQuestion({ ...editedQuestion, options: updatedOptions });
  };

  const toggleCorrectAnswer = (index) => {
    const optionValue = editedQuestion.options[index];
    const isSelected = editedQuestion.correctAnswers.includes(optionValue);
    let newCorrectAnswers = [...editedQuestion.correctAnswers];

    if (isSelected) {
      // Remove if already selected
      newCorrectAnswers = newCorrectAnswers.filter(answer => answer !== optionValue);
    } else {
      // Add if not selected
      if (editedQuestion.type === 'single') {
        // For single-answer questions, replace any existing answer
        newCorrectAnswers = [optionValue];
      } else {
        // For multiple-answer questions, add to existing answers
        newCorrectAnswers.push(optionValue);
      }
    }

    setEditedQuestion({ ...editedQuestion, correctAnswers: newCorrectAnswers });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let newCorrectAnswers = [...editedQuestion.correctAnswers];
    
    if (newType === 'single' && newCorrectAnswers.length > 1) {
      newCorrectAnswers = [newCorrectAnswers[0]];
    }
    
    setEditedQuestion({ ...editedQuestion, type: newType, correctAnswers: newCorrectAnswers });
  };

  const handleSave = () => {
    onSave(editedQuestion);
    setIsEditing(false);
    setVerificationResult(null);
  };

  const handleVerifyWithAI = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await quizApi.verifyQuestion({
        question: editedQuestion,
        originalQuestion: question,
        quizParams
      });
      
      setVerificationResult(response.data);
    } catch (error) {
      setVerificationResult({
        isValid: false,
        explanation: error.message || 'Failed to verify question. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegenerateQuestion = () => {
    onRegenerate(question);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {!isEditing ? (
        <div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-4">{editedQuestion.text}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-accent"
                title="Edit question"
              >
                <PencilSquareIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleRegenerateQuestion}
                className="text-gray-500 hover:text-secondary"
                title="Regenerate question"
              >
                <SparklesIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {editedQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg text-sm ${
                  editedQuestion.correctAnswers.includes(option) 
                    ? 'bg-secondary-light border border-secondary text-secondary-dark font-semibold'
                    : 'bg-gray-100'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">Type:</span> {editedQuestion.type === 'single' ? 'Single correct answer' : 'Multiple correct answers'}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Question Text
            </label>
            <textarea
              className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              value={editedQuestion.text}
              onChange={handleTextChange}
              rows="3"
              placeholder="Enter your question here"
              required
            />
          </div>

          <div className="mb-4">
            <span className="block text-gray-700 font-semibold mb-2">Answer Type</span>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={editedQuestion.type === 'single'}
                  onChange={handleTypeChange}
                  className="form-radio h-4 w-4 text-accent focus:ring-accent"
                />
                <span className="ml-2">Single Correct</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="multiple"
                  checked={editedQuestion.type === 'multiple'}
                  onChange={handleTypeChange}
                  className="form-radio h-4 w-4 text-accent focus:ring-accent"
                />
                <span className="ml-2">Multiple Correct</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <span className="block text-gray-700 font-semibold mb-2">Options</span>
            <p className="text-sm text-gray-600 mb-2">
              Mark the correct answer(s).
            </p>
            
            <div className="space-y-3">
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-3 cursor-pointer transition-colors ${
                      editedQuestion.correctAnswers.includes(option) 
                        ? 'bg-secondary' 
                        : 'bg-gray-300'
                    }`}
                    onClick={() => toggleCorrectAnswer(index)}
                  >
                    {editedQuestion.correctAnswers.includes(option) && <CheckIcon className="h-4 w-4 text-white" />}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {verificationResult && (
            <div className={`mb-4 p-3 rounded-lg flex items-start ${
              verificationResult.isValid 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex-shrink-0 mr-3">
                {verificationResult.isValid 
                  ? <CheckIcon className="h-5 w-5" /> 
                  : <XMarkIcon className="h-5 w-5" />}
              </div>
              <div>
                <span className="font-semibold">
                  {verificationResult.isValid 
                    ? 'AI says this looks correct!' 
                    : 'AI has detected a potential issue.'}
                </span>
                <p className="text-sm">{verificationResult.explanation}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              onClick={handleVerifyWithAI}
              variant="primary"
              className="bg-primary-light hover:bg-primary text-primary-dark hover:text-white"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'AI Verify'}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setVerificationResult(null);
                setEditedQuestion({...question});
              }}
              variant="primary"
              className="bg-gray-200 hover:bg-gray-300 !text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="secondary"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionEditor; 