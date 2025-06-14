import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BeakerIcon, BoltIcon, PencilSquareIcon, ShareIcon, SparklesIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import Button from '../components/common/Button';
import FeatureCard from '../components/common/FeatureCard';
import CallToActionCard from '../components/common/CallToActionCard';
import Testimonials from '../components/common/Testimonials';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

// Reusable component for the floating background icons
const FloatingIcon = ({ icon, className }) => (
  <motion.div
    className={`absolute text-white/5 ${className}`}
    initial={{ y: 0, scale: 1 }}
    animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
  >
    {icon}
  </motion.div>
);

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const features = [
    {
      icon: <BeakerIcon className="h-8 w-8 text-indigo-400" />,
      title: "AI-Powered Generation",
      description: "Let our AI create engaging quizzes from any topic in seconds."
    },
    {
      icon: <PencilSquareIcon className="h-8 w-8 text-purple-400" />,
      title: "Custom Quiz Creation",
      description: "Build your own quizzes with a simple and intuitive interface."
    },
    {
      icon: <ShareIcon className="h-8 w-8 text-pink-400" />,
      title: "Share & Compete",
      description: "Share your quizzes with friends and see who scores highest."
    }
  ];

  return (
    <div className="bg-gray-900 text-white">
      <main className="relative min-h-screen w-full overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900/60"></div>
          <FloatingIcon icon={<BeakerIcon className="h-48 w-48" />} className="top-1/4 left-10" />
          <FloatingIcon icon={<PencilSquareIcon className="h-64 w-64" />} className="bottom-10 right-20" />
          <FloatingIcon icon={<BoltIcon className="h-40 w-40" />} className="top-20 right-1/3" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
          <motion.div
            className="text-center flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              QuizMaster AI
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-300 md:text-xl">
              Unleash the power of AI to craft and conquer intelligent quizzes. Your knowledge, supercharged.
            </p>
            
            {!currentUser ? (
              <motion.div
                className="mt-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button onClick={() => navigate('/login')} size="lg" variant="primary">
                  Get Started
                </Button>
              </motion.div>
            ) : (
              <motion.p 
                className="mt-10 text-lg text-indigo-300 font-semibold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              >
                Scroll down to explore.
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A New Era of Quizzing
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              From auto-generated challenges to handcrafted tests, our platform is built to handle it all. Modern, fast, and intelligent.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  index={index}
                >
                  {feature.description}
                </FeatureCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Build/Generate Options Split Section - Only show if user is authenticated */}
      {currentUser && (
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-pink-400">Choose Your Path</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How will you create today?
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Whether you want the speed of AI or the precision of manual creation, we have you covered.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {currentUser.role === 'teacher' && (
                <>
                  <CallToActionCard 
                    icon={<SparklesIcon className="h-10 w-10" />}
                    title="Generate with AI"
                    description="Let our intelligent system build a comprehensive quiz for you based on any topic. Fast, smart, and ready in seconds."
                    link="/generate"
                  />
                  <CallToActionCard 
                    icon={<WrenchScrewdriverIcon className="h-10 w-10" />}
                    title="Create Manually"
                    description="Take full control. Design your quiz from scratch with our intuitive editor, customizing every question and answer."
                    link="/create"
                  />
                </>
              )}
              {currentUser.role === 'student' && (
                <CallToActionCard 
                  icon={<SparklesIcon className="h-10 w-10" />}
                  title="Browse Quizzes"
                  description="Explore available quizzes created by your teachers and test your knowledge."
                  link="/quizzes"
                />
              )}
            </div>
          </div>
        </section>
      )}

      <Testimonials />

      <Footer />
    </div>
  );
}

export default Home;