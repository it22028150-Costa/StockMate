import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Inventory from "./components/Inventory";
import Shopping from "./components/Shopping";
import Recipe from "./components/Recipe";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/recipe" element={<Recipe />} />
          <Route path="/chatbot" element={<ChatBot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
