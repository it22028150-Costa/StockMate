const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left side - Image */}
        <div className="md:w-1/2">
          <img
            src="/wall.jpg"
            alt="Stock Management"
            className="object-cover h-full w-full"
          />
        </div>

        {/* Right side - Content */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Welcome to <span className="text-blue-600">StockMate</span></h1>
          <p className="text-gray-600 mb-6">
            Smart home stock management made easy. Organize your inventory, track expiry, plan shopping, and more — all in one place.
          </p>
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-center sm:space-x-4">
            <a href="/inventory" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition">
              Manage Inventory
            </a>
            <a href="/shopping" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition">
              Shopping & Budget
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;

  