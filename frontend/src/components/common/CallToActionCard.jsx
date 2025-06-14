import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

function CallToActionCard({ icon, title, description, link, className = '' }) {
  return (
    <Link to={link}>
      <motion.div
        className={`relative rounded-3xl p-8 h-full flex flex-col justify-between overflow-hidden group ${className}`}
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Background & Glow Effect */}
        <div className="absolute inset-0 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-3xl"></div>
        <div className="absolute -inset-px rounded-3xl border border-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 blur-lg"></div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-4 text-purple-400">
            {icon}
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>

        <div className="relative z-10 mt-8">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <span>Get Started</span>
            <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default CallToActionCard;
