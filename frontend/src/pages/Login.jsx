import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, AcademicCapIcon, UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

function Login() {
  const [role, setRole] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, error: authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (!role) {
      setError('Please select a role');
      return;
    }

    if (!isLogin) {
      // Additional validation for signup
      if (!name) {
        setError('Name is required');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Signup process
      setIsLoading(true);
      const result = await signup({ name, email, password, role });
      setIsLoading(false);
      
      if (result?.success) {
        navigate('/');
      } else {
        setError(result?.error || authError || 'An error occurred during signup');
      }
    } else {
      // Login process
      setIsLoading(true);
      const result = await login({ email, password, role });
      setIsLoading(false);
      
      if (result?.success) {
        navigate('/');
      } else {
        setError(result?.error || authError || 'Invalid credentials');
      }
    }
  };

  // Reset form when switching between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-500/20 p-3 rounded-full">
              <LockClosedIcon className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-8">
            {!role 
              ? 'Welcome to QuizMaster AI' 
              : isLogin 
                ? 'Sign in to your account'
                : 'Create your account'
            }
          </h2>
          
          {!role ? (
            <div className="space-y-4">
              <h3 className="text-center text-gray-300 mb-6">I am a:</h3>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole('teacher')}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg transition-all"
              >
                <AcademicCapIcon className="h-6 w-6" />
                <span className="text-lg font-medium">Teacher</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole('student')}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-all"
              >
                <UserIcon className="h-6 w-6" />
                <span className="text-lg font-medium">Student</span>
              </motion.button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your name"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-gray-300 mb-1" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-md p-3 flex items-center gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLogin ? `Sign in as ${role === 'teacher' ? 'Teacher' : 'Student'}` : `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`}
                </Button>
                
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                  disabled={isLoading}
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole('')}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                  disabled={isLoading}
                >
                  Change role
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login; 