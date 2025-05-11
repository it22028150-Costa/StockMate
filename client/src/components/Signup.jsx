import { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  });

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        }
        break;
      
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          error = "Invalid email address";
        }
        break;
      
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(value)) {
          error = "Password must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(value)) {
          error = "Password must contain at least one number";
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          error = "Password must contain at least one special character";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
    setError("");
    
    // Calculate password strength if the password field changes
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
    
    // Update validation error for this field
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setValidationErrors(prev => ({...prev, [name]: fieldError}));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({...prev, [name]: true}));
    const fieldError = validateField(name, value);
    setValidationErrors(prev => ({...prev, [name]: fieldError}));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setValidationErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      window.location.href = "/"; // Navigate to home page
    } catch(err) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (formData.password.length === 0) return "";
    const levels = ["Weak", "Fair", "Good", "Strong"];
    return levels[passwordStrength] || "Weak";
  };

  const getPasswordStrengthColor = () => {
    const colors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    return colors[passwordStrength] || "bg-red-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="mt-2 text-4xl font-bold text-blue-600">StockMate</h1>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input 
                id="name"
                type="text" 
                name="name" 
                placeholder="John Doe" 
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.name}
                required 
                className={`w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.name && touched.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                name="email" 
                placeholder="your@email.com" 
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.email}
                required 
                className={`w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.email && touched.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input 
                id="password"
                type="password" 
                name="password" 
                placeholder="••••••••" 
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.password}
                required 
                className={`w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.password && touched.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {validationErrors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getPasswordStrengthColor()} h-2 rounded-full`} 
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2 w-10">{getPasswordStrengthText()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Use 8+ characters with a mix of letters, numbers & symbols</p>
                </div>
              )}
            </div>
            
            <div>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex justify-center disabled:bg-blue-400"
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-blue-600 rounded-full animate-spin"></span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;