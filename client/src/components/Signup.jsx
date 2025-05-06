import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/SIGNUP.webp')",
      }}
    >
      {/* Backdrop Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-0"></div>

      {/* Form Card */}
      <div className="bg-white/90 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-3xl px-10 py-12 max-w-md w-full z-10 border border-gray-50">
  <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-wider">SIGN UP</h2>
  <form onSubmit={handleSubmit} className="space-y-6">
    <input
      type="text"
      name="name"
      placeholder="Full Name"
      onChange={handleChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white placeholder-gray-500 transition"
    />
    <input
      type="email"
      name="email"
      placeholder="Email Address"
      onChange={handleChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white placeholder-gray-500 transition"
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      onChange={handleChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white placeholder-gray-500 transition"
    />
    <button
      type="submit"
      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
    >
      Sign Up
    </button>
  </form>
</div>

    </div>
  );
};

export default Signup;
