import { Link } from "react-router-dom";

const Navbar = () => {
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
          <Link to="/my-profile">My Profile</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
