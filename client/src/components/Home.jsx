import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Home = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl w-full bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left side - Slider */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2"
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            className="h-full w-full"
          >
            <SwiperSlide>
              <img src="/wall.jpg" alt="Slide 1" className="object-cover w-full h-full" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/wall2.webp" alt="Slide 2" className="object-cover w-full h-full" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/wall3.jpg" alt="Slide 3" className="object-cover w-full h-full" />
            </SwiperSlide>
          </Swiper>
        </motion.div>

        {/* Right side - Content */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 p-10 flex flex-col justify-center text-center space-y-8"
        >
          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to{" "}
              </span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-extrabold">
                StockMate
              </span>
            </h1>
            <p className="text-sm text-gray-500 tracking-wide">
              Your all-in-one household inventory companion
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg">
            Your smart assistant for managing household supplies. Stay ahead with real-time tracking, instant alerts, and budget-friendly shopping.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/inventory"
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition duration-300"
            >
              🗃 Manage Inventory
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/shopping"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition duration-300"
            >
              🛒 Shopping & Budget
            </motion.a>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-sm text-gray-700">
            {[
              { icon: "Real-time Inventory Tracking.png", label: "Real-time Inventory Tracking" },
              { icon: "Low Stock Notifications.png", label: "Low Stock Notifications" },
              { icon: "Smart Budget Planning.png", label: "Smart Budget Planning" },
              { icon: "Recipe-based Stock Suggestions.png", label: "Recipe-based Stock Suggestions" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <img src={`/icons/${feature.icon}`} alt={feature.label} className="w-6 h-6" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="border-t pt-4 text-gray-500 italic text-sm">
            “StockMate made my pantry feel like a supermarket — neat, updated, and under control.”
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
