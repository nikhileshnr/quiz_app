import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import Button from './Button';

const VerificationResultModal = ({ result, onClose }) => {
  if (!result) return null;

  const { isCorrect, feedback, suggestions } = result;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 max-h-[90vh] flex flex-col"
        >
          <div className="p-4 sm:p-5 overflow-y-auto">
            <div className="flex items-center mb-3">
              <ShieldCheckIcon className="h-6 w-6 text-purple-400 mr-2" />
              <h2 className="text-lg font-bold text-white">AI Verification</h2>
            </div>

            <div className={`p-3 rounded-lg mb-3 ${isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              <div className="flex items-center">
                {isCorrect ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                )}
                <h3 className={`text-base font-semibold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                  {isCorrect ? 'Verification Passed' : 'Verification Failed'}
                </h3>
              </div>
              <p className={`mt-1 text-sm ${isCorrect ? 'text-green-200' : 'text-red-200'}`}>{feedback}</p>
            </div>
            
            {suggestions && suggestions.length > 0 && (
              <div className="mb-2">
                <h4 className="font-semibold text-gray-300 text-sm mb-1">Suggestions:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 px-4 py-3 rounded-b-2xl text-right flex-shrink-0">
            <Button onClick={onClose} variant="secondary" size="sm">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VerificationResultModal; 