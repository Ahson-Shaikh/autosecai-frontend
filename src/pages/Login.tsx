import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css"; // Import CSS for styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          throw new Error(data.error || "Login failed. Please try again.");
        }
  
        // Store token in localStorage
        localStorage.setItem("authToken", data.token);
  
        // Redirect to home page after successful login
        navigate("/home");
      } catch (error: any) {
        setErrorMessage(error.message);
      }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Login Form */}
      <div className="login-form-container">
        <div className="logo">
          <img src="../../public/company_logo.png" alt="Company Logo" className="logo-img" />
        </div>
        <form onSubmit={handleLogin}>
        <div className="input-group">
            <label>Email *</label>
            <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <div className="input-group">
            <label>Password *</label>
            <div className="password-container">
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
             
            </div>
       
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Log In</button>
        </form>
        <p className="forgot-password">Forgot Password?</p>
        <button className="create-account" onClick={handleRegister}>Create Account</button>
      </div>

      {/* Right Panel - Background and Information */}
      <div className="login-background">
      <div className="info-box">
        <h1>#wesolveIT</h1>
        <p>
            Simplify multi-cloud management and procurement with a single pane of glass 
            for self-service visibility across cloud providers, ensuring better lifecycle 
            and cost management.
        </p>
        <h3>Benefits include:</h3>
        <ul>
            <li>Single portal for multiple provider XaaS subscriptions</li>
            <li>Digitally sign and access EULAs</li>
            <li>Spend and budget controls</li>
            <li>Predictive analytics and transactional reporting</li>
            <li>Real-time subscription support</li>
            <li>Access to expert guidance</li>
            <li>Industry-leading SaaS, IaaS, and PaaS offerings</li>
        </ul>
        <p>Purchase and manage your subscriptions—all in one place.</p>
        <a href="#">Sign up for a free account now.</a>
        </div>
      </div>

        {/* Footer */}
        <div className="footer">
        <p className="footer-left">© 2025 SphereOps". All rights reserved.</p>
        <div className="footer-links">
            <a href="#">Contact Us</a>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
        </div>
        </div>
    </div>
  );
};

export default Login;
