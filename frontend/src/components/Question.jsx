import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

function Question({ question, onSelectOption, selectedOption, isSubmitted, onVerify, isVerifying, verificationResult }) {
  
  const getOptionClass = (option) => {
    if (!isSubmitted) {
      return `border-gray-600/50 group-hover:border-indigo-500/50 ${selectedOption === option ? 'bg-indigo-500/30 border-indigo-500/80' : 'bg-gray-800/60'}`;
    }
    
    // After submission
    const isThisOptionCorrect = question.correctAnswers.includes(option);
    
    if (isThisOptionCorrect) {
      return 'bg-green-500/30 border-green-500/80';
    }
    if (selectedOption === option && !isThisOptionCorrect) {
      return 'bg-red-500/30 border-red-500/80';
    }

    return 'border-gray-700/50 bg-gray-800/80 opacity-60';
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-white text-left">{question.text}</h2>
        {onVerify && (
          <button
            onClick={onVerify}
            disabled={isVerifying}
            className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            <ShieldCheckIcon className="h-5 w-5 mr-1" />
            {isVerifying ? 'Verifying...' : 'Verify with AI'}
          </button>
        )}
      </div>

      {verificationResult && (
        <div className={`p-3 mb-4 rounded-md text-sm ${
          verificationResult.isCorrect ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
        }`}>
          <p className="font-semibold">{verificationResult.isCorrect ? 'Verification Passed:' : 'Verification Failed:'}</p>
          <p>{verificationResult.feedback}</p>
        </div>
      )}

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => onSelectOption(option)}
            disabled={isSubmitted}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 group ${getOptionClass(option)}`}
            whileHover={!isSubmitted ? { scale: 1.02 } : {}}
          >
            <span className="font-semibold text-lg text-white">{option}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default Question; 