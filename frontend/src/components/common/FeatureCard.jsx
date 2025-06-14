import { motion } from 'framer-motion';

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

function FeatureCard({ icon, title, children, index }) {
  return (
    <motion.div
      className="relative p-0.5 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/50 via-purple-500/50 to-pink-500/50"
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.5 }}
      variants={cardVariants}
      transition={{ delay: index * 0.1 }}
    >
      <div className="relative z-10 h-full bg-gray-800/80 backdrop-blur-lg rounded-xl p-8 text-center flex flex-col items-center shadow-2xl">
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-indigo-600/50 rounded-full blur-lg"></div>
          <div className="relative p-4 bg-gray-900 inline-block rounded-full">
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{children}</p>
      </div>
    </motion.div>
  );
}

export default FeatureCard;
