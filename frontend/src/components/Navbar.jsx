import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Define navigation links based on authentication status and role
  const getNavLinks = () => {
    // Default nav links for all users (authenticated or not)
    const links = [
      { name: 'Home', path: '/' },
    ];
    
    if (!currentUser) {
      // For unauthenticated users
      links.push({ name: 'Login', path: '/login' });
    } else if (currentUser.role === 'teacher') {
      // For teachers
      links.push(
        { name: 'Create Quiz', path: '/create' },
        { name: 'AI Generator', path: '/generate' },
        { name: 'Browse Quizzes', path: '/quizzes' }
      );
    } else if (currentUser.role === 'student') {
      // For students
      links.push({ name: 'Browse Quizzes', path: '/quizzes' });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeLinkStyle = "bg-gray-900/80 text-white";
  const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700/50 hover:text-white";
  
  const navbarClasses = `
    fixed top-0 z-50 w-full transition-all duration-300
    ${isScrolled ? 'bg-gray-900/70 backdrop-blur-lg border-b border-gray-500/20' : 'bg-transparent border-b border-transparent'}
  `;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
                <SparklesIcon className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold text-white">QuizMaster AI</span>
              </NavLink>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              {/* Logout button for authenticated users */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700/50 hover:text-white flex items-center gap-1"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-xl"
            initial={{ opacity: 0, y: "-5%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-5%" }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="pt-20 px-2 space-y-1 text-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `block px-3 py-4 rounded-md text-lg font-medium ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              {/* Logout button for authenticated users */}
              {currentUser && (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full px-3 py-4 rounded-md text-lg font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar; 