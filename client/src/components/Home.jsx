import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBoxOpen, FaShoppingCart, FaUtensils } from "react-icons/fa";

const images = [
  "https://images.squarespace-cdn.com/content/v1/53f2c502e4b03f7a2b0a9013/ccb017a7-11f2-4db0-99c6-21cd1d7b4ba2/Losurdos-grocery-electronic-shelf-label-installation-FurtureShelf-2.jpeg",
  "https://en.idei.club/uploads/posts/2023-02/thumbs/1677327993_en-idei-club-p-supermarket-interior-instagram-68.jpg",
  "https://del.h-cdn.co/assets/16/24/1024x651/gallery-1466177617-2753296191-0f49c62756-b.jpg",
  "https://d3uwoey2rd901c.cloudfront.net/wp-content/uploads/2018/11/Rice-Media-Supermarket-Millennial-Obsession-8.jpg",
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const preload = new Image();
    preload.src = images[(currentImage + 1) % images.length];
  }, [currentImage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 100);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      {/* Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${images[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-60 z-10" />

      {/* Hero Section */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-white text-center">
        <div className="bg-black/40 p-8 rounded-lg shadow-lg max-w-3xl w-full border border-white/20">
          <h1 className="text-4xl md:text-6xl font-extrabold font-serif mb-6">
            Welcome to <span className="text-green-400">StockMate</span>
          </h1>
          <p className="text-md md:text-xl mb-6">
            Your all-in-one solution to manage groceries, track inventory, discover recipes, and reduce waste smartly.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <Link
              to="/login"
              className="px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 transition-all shadow-md"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all shadow-md"
            >
              Sign Up
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex justify-center gap-6 flex-wrap text-sm text-white/90">
            <div className="flex items-center gap-2">
              <FaBoxOpen className="text-green-300" />
              Inventory Tracking
            </div>
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-yellow-300" />
              Smart Shopping
            </div>
            <div className="flex items-center gap-2">
              <FaUtensils className="text-pink-300" />
              Recipe Suggestions
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 animate-bounce text-white/60">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Home;
