import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { quizApi } from '../services/api';

import Button from '../components/common/Button';
import Question from '../components/Question';
import QuizResult from '../components/QuizResult';
import { AcademicCapIcon, AdjustmentsHorizontalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [quiz, setQuiz] = useState(null);
  const [quizState, setQuizState] = useState('loading'); // loading, ready, taking, finished
  const [error, setError] = useState(null);
  
  // Quiz session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setQuizState('loading');
        const response = await quizApi.getById(id);
        if (response && response.status === 'success') {
          setQuiz(response.data);
          setQuizState('ready');
        } else {
          setError('Failed to load quiz details.');
          setQuizState('error');
        }
      } catch (err) {
        setError('An error occurred while fetching the quiz.');
        setQuizState('error');
      }
    };
    fetchQuiz();
  }, [id]);
  
  const score = useMemo(() => {
    return userAnswers.reduce((acc, answer) => {
      return acc + (answer.isCorrect ? 1 : 0);
    }, 0);
  }, [userAnswers]);

  const handleVerifyQuestion = async (questionIndex) => {
    setIsVerifying(true);
    try {
      const question = quiz.questions[questionIndex];
      const result = await quizApi.verifyQuestion({
        question: question,
        quizParams: {
          topic: quiz.title,
          difficulty: quiz.difficulty,
          level: quiz.level,
        }
      });

      setVerificationResults(prev => ({
        ...prev,
        [questionIndex]: result.data,
      }));
    } catch (err) {
      setError('Failed to verify question.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartQuiz = () => setQuizState('taking');

  const handleSubmitAnswer = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswers.includes(selectedOption);
    
    setUserAnswers([...userAnswers, { question: currentQuestion.text, selectedOption, isCorrect }]);
    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizState('finished');
    }
  };

  const handleRestartQuiz = () => {
    setQuizState('taking');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const ThemedSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
    </div>
  );
  
  const renderQuizHeader = () => (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{quiz.title}</h1>
      <div className="mt-4 flex justify-center items-center gap-4 text-gray-400">
        <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5"/>
            <span>{quiz.level}</span>
        </div>
        <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5"/>
            <span>{quiz.difficulty}</span>
        </div>
        <span>•</span>
        <span>{quiz.questions.length} Questions</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 sm:p-10 flex flex-col items-center justify-center">
      {quizState === 'loading' && <ThemedSpinner />}

      {quizState === 'error' && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400" />
          <h3 className="mt-4 text-xl font-bold text-white">An Error Occurred</h3>
          <p className="mt-2 text-gray-400">{error}</p>
        </div>
      )}

      {quiz && (quizState === 'ready' || quizState === 'taking' || quizState === 'finished') && (
        <div className="w-full max-w-4xl mx-auto">
          {quizState === 'ready' && (
            <div className="text-center">
              {renderQuizHeader()}
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                Test your knowledge on this subject. When you're ready, hit the start button below.
              </p>
              <Button onClick={handleStartQuiz} size="lg" variant="primary">Start Quiz</Button>
            </div>
          )}

          {quizState === 'taking' && (
            <>
              {renderQuizHeader()}
              <div className="relative w-full max-w-2xl mx-auto min-h-[20rem] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <Question
                    key={currentQuestionIndex}
                    question={quiz.questions[currentQuestionIndex]}
                    onSelectOption={setSelectedOption}
                    selectedOption={selectedOption}
                    isSubmitted={isSubmitted}
                    onVerify={() => handleVerifyQuestion(currentQuestionIndex)}
                    isVerifying={isVerifying}
                    verificationResult={verificationResults[currentQuestionIndex]}
                  />
                </AnimatePresence>
              </div>
              <div className="mt-8 text-center">
                {isSubmitted ? (
                  <Button onClick={handleNextQuestion} size="lg" variant="primary">Next</Button>
                ) : (
                  <Button onClick={handleSubmitAnswer} size="lg" variant="secondary" disabled={!selectedOption}>Submit</Button>
                )}
              </div>
              <div className="text-center mt-4 text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
            </>
          )}

          {quizState === 'finished' && (
            <QuizResult
              score={score}
              total={quiz.questions.length}
              onRestart={handleRestartQuiz}
              onFinish={() => navigate('/quizzes')}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default QuizDetail; 