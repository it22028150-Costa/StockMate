import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token (or any auth state) from local storage
    localStorage.removeItem("token");
    // Redirect the user to the login page
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to="/" className="font-semibold text-2xl text-gray-200">
          StockMate
        </Link>

        {/* Navigation Links */}
        <div className="space-x-6 text-lg flex items-center">
          <Link to="/" className="hover:text-gray-400 transition duration-300">Home</Link>
          <Link to="/inventory" className="hover:text-gray-400 transition duration-300">Inventory</Link>
          <Link to="/shopping" className="hover:text-gray-400 transition duration-300">Shopping</Link>
          <Link to="/recipe" className="hover:text-gray-400 transition duration-300">Recipes</Link>
          <Link to="/chatbot" className="hover:text-gray-400 transition duration-300">ChatBot</Link>

          {/* Auth Links & Logout */}
          <div className="space-x-6">
            <Link to="/login" className="hover:text-gray-400 transition duration-300">Login</Link>
            <Link to="/signup" className="hover:text-gray-400 transition duration-300">Sign Up</Link>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
