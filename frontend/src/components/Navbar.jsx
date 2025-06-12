import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Quiz App</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Home
                </Link>
                <Link to="/create" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Create Quiz
                </Link>
                <Link to="/generate" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  AI Generator
                </Link>
                <Link to="/quizzes" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  View Quizzes
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-800">
              <span className="sr-only">Open main menu</span>
              {/* Menu icon - we'll implement mobile menu later */}
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 