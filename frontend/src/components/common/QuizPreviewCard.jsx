import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TagIcon, AdjustmentsHorizontalIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const getDifficultyColor = (difficulty) => {
  if (!difficulty) return 'border-gray-600';
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'border-green-500';
    case 'medium': return 'border-yellow-500';
    case 'hard': return 'border-red-500';
    default: return 'border-gray-600';
  }
};

function QuizPreviewCard({ quiz }) {
  const { _id, title, questionCount, questions, difficulty, level } = quiz;
  const id = _id;
  const totalQuestions = questionCount || questions?.length || 0;
  const difficultyColor = getDifficultyColor(difficulty);

  return (
    <Link to={`/quiz/${id}`} className="block snap-center">
      <motion.div
        className="relative w-72 h-80 flex-shrink-0 rounded-2xl bg-gray-800/60 backdrop-blur-sm p-6 flex flex-col justify-between overflow-hidden border border-gray-700/50 shadow-lg transition-all duration-300 ease-in-out hover:shadow-indigo-500/30 hover:border-indigo-500/80 hover:-translate-y-2 group"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-all duration-500 group-hover:w-full ${difficultyColor}`}></div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-3 truncate">{title}</h3>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <span className="flex items-center rounded-full px-3 py-1 bg-gray-700/50 text-gray-300">
              <AcademicCapIcon className="h-4 w-4 mr-1.5" />
              {level}
            </span>
            <span className={`flex items-center rounded-full px-3 py-1 bg-gray-700/50 text-gray-300`}>
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
              {difficulty}
            </span>
          </div>
        </div>

        <div className="text-center">
            <div className="text-6xl font-extrabold text-white mb-1">
                {totalQuestions}
            </div>
            <div className="text-lg text-gray-400">Questions</div>
        </div>

        <div className="text-center">
          <span className="font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Tap to View
          </span>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl transition-all duration-500 group-hover:bg-indigo-500/20 group-hover:scale-150"></div>
      </motion.div>
    </Link>
  );
}

export default QuizPreviewCard;
