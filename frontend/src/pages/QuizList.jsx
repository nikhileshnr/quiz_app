import { useState, useEffect } from 'react';
import { quizApi } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import QuizListItem from '../components/common/QuizListItem';
import { DocumentPlusIcon, ExclamationTriangleIcon, AcademicCapIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const location = useLocation();
  const limit = 9;
  const { currentUser } = useAuth();

  // Check for success message from navigation
  const successMessage = location.state?.message;
  const [showSuccess, setShowSuccess] = useState(!!successMessage);

  useEffect(() => {
    // Clear success message after 5 seconds
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Also clear the location state
        window.history.replaceState({}, document.title)
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    fetchQuizzes(true); // Initial fetch
  }, []);

  const fetchQuizzes = async (isInitial = false) => {
    const pageToFetch = isInitial ? 1 : page + 1;
    setIsLoading(true);
    setError(null);

    try {
      const response = await quizApi.getAll(pageToFetch, limit);
      
      if (response) {
        // Handle both response formats (status/success)
        if (response.status === 'success' || response.success === true) {
          // Extract data from the response (handle different formats)
          const quizData = response.data || [];
          const total = response.pagination?.total || response.count || quizData.length;
          const currentPage = response.pagination?.page || pageToFetch;
          const totalPages = response.pagination?.pages || Math.ceil(total / limit);
          
          setQuizzes(prev => isInitial ? quizData : [...prev, ...quizData]);
          setTotalQuizzes(total);
          setHasMore(currentPage < totalPages);
          setPage(pageToFetch);
        } else {
          setError('Invalid response format from server');
          setHasMore(false);
        }
      } else {
        setError('No quiz data received from server');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again later.');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchQuizzes();
    }
  };
  
  // A simple spinner component for loading states
  const ThemedSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {currentUser.role === 'teacher' ? 'My Quizzes' : 'Available Quizzes'}
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              {currentUser.role === 'teacher' 
                ? 'Manage your created quizzes and track student progress.' 
                : 'Explore quizzes you\'ve been invited to take.'}
            </p>
          </div>
          
          {currentUser.role === 'teacher' && (
            <Link to="/create">
              <Button variant="secondary" size="lg" className="mt-4 sm:mt-0">
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Create New Quiz
              </Button>
            </Link>
          )}
          
          {currentUser.role === 'student' && (
            <Link to="/invitations">
              <Button variant="secondary" size="lg" className="mt-4 sm:mt-0">
                <EnvelopeOpenIcon className="h-5 w-5 mr-2" />
                View Invitations
              </Button>
            </Link>
          )}
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-400/50 rounded-lg shadow-lg">
            <p className="text-green-300 font-semibold">{successMessage}</p>
          </div>
        )}

        {isLoading && page === 1 ? (
          <ThemedSpinner />
        ) : error ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl">
                <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400" />
                <h3 className="mt-4 text-xl font-bold text-white">An Error Occurred</h3>
                <p className="mt-2 text-gray-400">{error}</p>
          </div>
        ) : quizzes.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl">
                <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-500" />
                <h3 className="mt-4 text-xl font-bold text-white">
                  {currentUser.role === 'teacher'
                    ? 'No Quizzes Created Yet'
                    : 'No Available Quizzes'}
                </h3>
                <p className="mt-2 text-gray-400">
                  {currentUser.role === 'teacher'
                    ? 'Get started by creating a new quiz.'
                    : 'You haven\'t been invited to any quizzes yet.'}
                </p>
                {currentUser.role === 'teacher' && (
                  <div className="mt-6">
                    <Link to="/create">
                      <Button variant="primary">Create Quiz</Button>
                    </Link>
                  </div>
                )}
          </div>
        ) : (
          <>
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
              {quizzes.map((quiz, index) => (
                <QuizListItem 
                  key={quiz.id || quiz._id} 
                  quiz={quiz} 
                  index={index}
                  userRole={currentUser.role} 
                />
              ))}
            </motion.div>

            {hasMore && (
              <div className="mt-12 text-center">
                <Button onClick={loadMore} variant="primary" size="lg" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
             <div className="mt-6 text-center text-sm text-gray-500">
              Showing {quizzes.length} of {totalQuizzes} quizzes
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QuizList; 