import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Inventory from "./components/Inventory";
import Shopping from "./components/Shopping";
import Recipe from "./components/Recipe";
import ChatBot from "./components/ChatBot";
import ProfilePage from "./components/user-profile";

// Wrapper to access hooks like useLocation
const AppWrapper = () => {
  const location = useLocation();

  // List of routes that shouldn't show the navbar
  const hideNavbarRoutes = ["/login", "/signup"];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/recipe" element={<Recipe />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/my-profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;