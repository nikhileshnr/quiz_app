import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AcademicCapIcon, AdjustmentsHorizontalIcon, TagIcon, ClockIcon, PencilIcon, UserIcon, ChartBarIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const getDifficultyClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'text-green-400 border-green-400/50 bg-green-400/10';
    case 'medium':
      return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
    case 'hard':
      return 'text-red-400 border-red-400/50 bg-red-400/10';
    default:
      return 'text-gray-400 border-gray-400/50 bg-gray-400/10';
  }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

function QuizListItem({ quiz, index, userRole = 'student' }) {
  const { _id, title, level, difficulty, questionCount, questions, createdAt, attempts } = quiz;
  const id = _id || quiz.id;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.05 }
    },
  };

  const renderCardActions = () => {
    if (userRole === 'teacher') {
      return (
        <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between">
          <Link to={`/quiz/${id}/edit`} className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <Link to={`/quiz/${id}/invite`} className="flex items-center text-sm font-semibold text-green-400 hover:text-green-300 transition-colors">
            <UserIcon className="h-4 w-4 mr-1" />
            Invite
          </Link>
          <Link to={`/quiz/${id}/results`} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            <ChartBarIcon className="h-4 w-4 mr-1" />
            Results
          </Link>
        </div>
      );
    } else {
      // Student view
      const hasAttempted = Boolean(attempts && attempts.length);
      
      return (
        <div className="mt-6 pt-4 border-t border-gray-700/50 text-center">
          <Link to={`/quiz/${id}`} className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center">
            {hasAttempted ? (
              <>
                <DocumentCheckIcon className="h-5 w-5 mr-2" />
                View Results
              </>
            ) : (
              <>
                Take Quiz &rarr;
              </>
            )}
          </Link>
        </div>
      );
    }
  };

  return (
    <motion.div variants={cardVariants}>
      <div className="h-full rounded-2xl p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg transition-all duration-300 ease-in-out hover:border-indigo-500/80 hover:-translate-y-1 group">
        <h2 className="text-xl font-bold text-white mb-4 truncate group-hover:text-indigo-400 transition-colors">{title}</h2>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <AcademicCapIcon className="h-5 w-5 text-indigo-400/80" />
            <span>Level: <span className="font-semibold text-white">{level}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-400/80" />
            <span>Difficulty: <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${getDifficultyClass(difficulty)}`}>{difficulty}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <TagIcon className="h-5 w-5 text-indigo-400/80" />
            <span>{questionCount || questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <ClockIcon className="h-5 w-5 text-indigo-400/80" />
            <span>Created: {formatDate(createdAt)}</span>
          </div>
        </div>
        
        {renderCardActions()}
      </div>
    </motion.div>
  );
}

export default QuizListItem; 