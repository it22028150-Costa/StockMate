import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-purple-300 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl w-full bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
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
          className="md:w-1/2 p-10 flex flex-col justify-center text-center"
        >
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 mb-4">
            Welcome to StockMate
          </h1>
          <p className="text-gray-700 text-lg mb-8">
            Smart home stock management made effortless. Track stock, expiry, and shopping — beautifully.
          </p>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-center sm:space-x-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/inventory"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg transition duration-300"
            >
              Manage Inventory
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/shopping"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg transition duration-300"
            >
              Shopping & Budget
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
