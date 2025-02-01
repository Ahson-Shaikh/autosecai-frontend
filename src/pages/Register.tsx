import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal"
import "./Register.css"; // Import CSS for styling

Modal.setAppElement("#root"); // Accessibility fix
const Register = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const res = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email }),
        });

        if (!res.ok) {
            throw new Error("Failed to register. Please try again.");
        }

        const data = await res.json();

        if (data.error) {
            setMessage(data.error);
        } else {
            setMessage("Registration successful!");
            setIsModalOpen(true); // Show success modal
        }
    } catch (error: any) {
        setMessage(error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/login"); // Redirect to login after closing modal
  };


  return (
    <div className="login-container">
      {/* Left Panel - Login Form */}
      <div className="login-form-container">
        <div className="logo">
          <img src="../../public/company_logo.png" alt="Company Logo" className="logo-img" />
        </div>
        <form onSubmit={handleRegister}>
        <div className="input-group">
            <label>Email *</label>
            <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <div className="input-group">
            <label>Username *</label>
            <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit" onClick={handleRegister}>Create Account</button>
        </form>
        <button className="create-account" onClick={handleLogin}>Login</button>
        <p className="error-message">{message}</p>

        <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal">
        <div className="modal-content">
          <h2>Registration Successful</h2>
          <p>Your account has been created successfully! You will be redirected to the login page.</p>
          <button onClick={closeModal}>OK</button>
        </div>
      </Modal>

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
        <p className="footer-left">© 2025 SphereOps™. All rights reserved.</p>
        <div className="footer-links">
            <a href="#">Contact Us</a>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
        </div>
        </div>
    </div>
  );
};

export default Register;
