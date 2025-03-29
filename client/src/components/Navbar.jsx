import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token (or any auth state) from local storage
    localStorage.removeItem("token");
    // Optionally, you can also clear any user state if you're storing it in a context or state management solution
    // Redirect the user to the login page
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <div>
          <Link to="/" className="font-bold text-lg">StockMate</Link>
        </div>
        <div className="space-x-4">
          <Link to="/">Home</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/shopping">Shopping</Link>
          <Link to="/recipe">Recipes</Link>
          <Link to="/chatbot">ChatBot</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
