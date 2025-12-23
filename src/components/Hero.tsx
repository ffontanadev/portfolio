import { motion } from 'framer-motion';
import { StatusBadge, ActivityCard, CircularImageContainer } from './Hero/index';

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative select-none min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100"
    >
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {/* Split-screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">

          {/* Left Column - Content */}
          <div className="flex flex-col space-y-8">
            {/* Status Badge */}
            <div>
              <StatusBadge />
            </div>

            {/* Hero Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight"
            >
              Hi, I'm <span className="text-coral-500">Felipe!</span>
            </motion.h1>

            {/* Subheading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 leading-relaxed"
            >
              <p>
                I'm a <span className="font-semibold underline">Developer</span> at{' '}
                <span className="font-semibold text-dark-900">Magenta Innova</span>
              </p>
              <p>working for BBVA.</p>
            </motion.div>

            {/* Activity Card */}
            <ActivityCard />
          </div>

          {/* Right Column - Circular Image */}
          <div className="flex justify-center lg:justify-end">
            <CircularImageContainer />
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute right-0 top-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute left-0 bottom-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10"
      />
    </section>
  );
};

export default Hero;
