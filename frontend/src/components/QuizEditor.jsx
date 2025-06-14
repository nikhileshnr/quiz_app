import { useState, useEffect } from 'react';
import QuestionEditor from './QuestionEditor';
import { quizApi } from '../services/api';
import Button from './common/Button';

function QuizEditor({ quiz: initialQuiz, onSave, onUpdate, onCancel }) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  useEffect(() => {
    if (!quiz.questions.some(q => q.id)) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => ({
          ...q,
          id: `q-${i}-${Date.now()}`
        }))
      }));
    }
  }, [quiz.questions]);

  const handleQuestionChange = (updatedQuestion) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleRegenerateSelected = async () => {
    if (selectedQuestionIds.length === 0) return;
    
    setIsRegenerating(true);
    
    try {
      // Get indices of selected questions
      const indicesToRegenerate = quiz.questions
        .filter(q => selectedQuestionIds.includes(q.id))
        .map((_, i) => i);
      
      const response = await quizApi.regenerateQuestions({
        quizParams: {
          topic: quiz.title || quiz.topic,
          level: quiz.level,
          difficulty: quiz.difficulty,
        },
        indicesToRegenerate,
        currentQuestions: quiz.questions
      });
      
      const regeneratedQuestions = response.data;
      
      // Replace selected questions with regenerated ones
      const updatedQuestions = quiz.questions.map((q, i) => {
        if (selectedQuestionIds.includes(q.id)) {
          const matchingRegenerated = regeneratedQuestions.find(
            (rq, rIndex) => rIndex === i
          );
          return matchingRegenerated ? { ...matchingRegenerated, id: q.id } : q;
        }
        return q;
      });
      
      setQuiz(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
      
      // Clear selection after regeneration
      setSelectedQuestionIds([]);
    } catch (error) {
      console.error('Failed to regenerate questions:', error);
      // Show error message here
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateSingleQuestion = async (question) => {
    setIsRegenerating(true);
    
    try {
      const index = quiz.questions.findIndex(q => q.id === question.id);
      
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
        updatedQuestions[index] = { ...response.data[0], id: question.id };
        
        setQuiz(prev => ({
          ...prev,
          questions: updatedQuestions
        }));
      }
    } catch (error) {
      console.error('Failed to regenerate question:', error);
      // Show error message here
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveQuiz = () => {
    onUpdate(quiz); // Pass updated quiz state up
    onSave(quiz);
  };
  
  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Edit Quiz Questions</h2>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleRegenerateSelected}
            disabled={selectedQuestionIds.length === 0 || isRegenerating}
            variant="secondary"
          >
            {isRegenerating 
              ? 'Regenerating...' 
              : `Regenerate Selected (${selectedQuestionIds.length})`}
          </Button>
          
          <Button 
            onClick={handleSaveQuiz}
            variant="accent"
          >
            Save Quiz
          </Button>
          <Button
            onClick={handleCancel}
            variant="primary"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id={`select-${question.id}`}
                checked={selectedQuestionIds.includes(question.id)}
                onChange={() => toggleQuestionSelection(question.id)}
                className="h-5 w-5 text-accent rounded focus:ring-accent"
              />
              <label htmlFor={`select-${question.id}`} className="ml-3 font-semibold text-lg text-gray-800">
                Question {index + 1}
              </label>
            </div>
            
            <QuestionEditor
              question={question}
              quizParams={{
                topic: quiz.title || quiz.topic,
                level: quiz.level,
                difficulty: quiz.difficulty,
              }}
              onSave={handleQuestionChange}
              onRegenerate={() => handleRegenerateSingleQuestion(question)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizEditor; 