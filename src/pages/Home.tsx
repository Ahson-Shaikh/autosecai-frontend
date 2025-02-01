import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Dashboard from "./Dashboard";
import Scans from "./Scan";
import Reports from "./Reports";


const Home = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="home-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <h2>AutoSecAI</h2>
        <ul>
          <li onClick={() => setActiveSection("dashboard")} className={activeSection === "dashboard" ? "active" : ""}>Dashboard</li>
          <li onClick={() => setActiveSection("scans")} className={activeSection === "scans" ? "active" : ""}>Scans</li>
          <li onClick={() => setActiveSection("reports")} className={activeSection === "reports" ? "active" : ""}>Reports</li>
          <li onClick={handleLogout} className="logout">Logout</li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "scans" && <Scans />}
        {activeSection === "reports" && <Reports />}
      </div>
    </div>
  );
};

export default Home;
