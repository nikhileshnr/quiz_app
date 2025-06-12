import { useState } from 'react';

function QuestionForm({ onSave, onCancel, existingQuestion = null }) {
  const [question, setQuestion] = useState(
    existingQuestion || {
      text: '',
      options: ['', '', '', ''],
      correctAnswers: [],
      type: 'single'
    }
  );

  const handleTextChange = (e) => {
    setQuestion({ ...question, text: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = value;
    setQuestion({ ...question, options: updatedOptions });
  };

  const handleTypeChange = (e) => {
    // If switching from multiple to single, keep only first answer or none
    const newType = e.target.value;
    let newCorrectAnswers = question.correctAnswers;
    if (newType === 'single' && question.correctAnswers.length > 1) {
      newCorrectAnswers = question.correctAnswers.slice(0, 1);
    }
    setQuestion({ ...question, type: newType, correctAnswers: newCorrectAnswers });
  };

  const toggleCorrectAnswer = (index) => {
    const isSelected = question.correctAnswers.includes(index);
    let newCorrectAnswers = [...question.correctAnswers];

    if (isSelected) {
      // Remove if already selected
      newCorrectAnswers = newCorrectAnswers.filter(i => i !== index);
    } else {
      // Add if not selected
      if (question.type === 'single') {
        // For single-answer questions, replace any existing answer
        newCorrectAnswers = [index];
      } else {
        // For multiple-answer questions, add to existing answers
        newCorrectAnswers.push(index);
      }
    }

    setQuestion({ ...question, correctAnswers: newCorrectAnswers });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(question);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">
        {existingQuestion ? 'Edit Question' : 'Add New Question'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question-text">
            Question Text
          </label>
          <textarea
            id="question-text"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
            value={question.text}
            onChange={handleTextChange}
            rows="2"
            placeholder="Enter your question here"
            required
          />
        </div>

        <div className="mb-4">
          <span className="block text-gray-700 text-sm font-bold mb-2">Answer Type</span>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="single"
                checked={question.type === 'single'}
                onChange={handleTypeChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Single Correct Answer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="multiple"
                checked={question.type === 'multiple'}
                onChange={handleTypeChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Multiple Correct Answers</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <span className="block text-gray-700 text-sm font-bold mb-2">Options</span>
          <p className="text-sm text-gray-600 mb-4">
            {question.type === 'single' 
              ? 'Select the correct answer' 
              : 'Select all correct answers'}
          </p>
          
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className={`flex-shrink-0 w-6 h-6 ${
                  question.correctAnswers.includes(index) 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                } rounded-full mr-3 cursor-pointer`}
                onClick={() => toggleCorrectAnswer(index)}
              >
                <span className="flex justify-center items-center h-full text-white font-bold">
                  {question.correctAnswers.includes(index) ? '✓' : ''}
                </span>
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            disabled={!question.text || question.correctAnswers.length === 0}
          >
            Save Question
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuestionForm; 