import { motion } from 'framer-motion';
import Button from './common/Button';

function QuizResult({ score, total, onRestart, onFinish }) {
  const percentage = Math.round((score / total) * 100);
  
  let resultMessage = "Good effort!";
  if (percentage > 90) {
    resultMessage = "Excellent work!";
  } else if (percentage > 70) {
    resultMessage = "Great job!";
  } else if (percentage < 40) {
      resultMessage = "Keep practicing!";
  }

  return (
    <motion.div
      className="text-center w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <h2 className="text-4xl font-bold text-white mb-2">{resultMessage}</h2>
      <p className="text-lg text-gray-400 mb-6">You've completed the quiz.</p>

      <div className="bg-gray-800/50 rounded-2xl p-8 my-8">
        <p className="text-xl text-indigo-300 mb-2">Your Score</p>
        <p className="text-7xl font-extrabold text-white">
          {score} <span className="text-4xl text-gray-400">/ {total}</span>
        </p>
         <p className="text-2xl font-bold text-purple-400 mt-4">
            {percentage}%
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={onRestart} variant="secondary" size="lg">
          Try Again
        </Button>
        <Button onClick={onFinish} variant="primary" size="lg">
          Back to Quizzes
        </Button>
      </div>
    </motion.div>
  );
}

export default QuizResult; 