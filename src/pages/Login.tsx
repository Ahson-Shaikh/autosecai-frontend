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
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/login`, {
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
          <img src="/company_logo.png" alt="Company Logo" className="logo-img" />
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
        Streamline your application security testing with advanced 
        <strong>SAST (Static Application Security Testing)</strong> and 
        <strong>DAST (Dynamic Application Security Testing)</strong>. 
        Our platform automates scanning at every stage of the SDLC—helping you 
        detect vulnerabilities early and address them quickly. 
        </p>
        <h3>Why AutoSecAI?</h3>
        <ul>
            <li>Comprehensive SAST and DAST analysis for in-depth code coverage</li>
            <li>Detailed vulnerability reports with clear remediation steps</li>
            <li>Integration with modern CI/CD pipelines and developer workflows</li>
            <li>Real-time alerts and dashboards for tracking security posture</li>
            <li>Expert guidance to prioritize and fix critical issues first</li>
            <li>Meet compliance and regulatory requirements with ease</li>
        </ul>
        <p>
            Protect your applications from potential threats and security pitfalls. 
            Sign up now to get started with industry-leading vulnerability assessments.
        </p>
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
