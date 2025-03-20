import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Dashboard from "./Dashboard";
import Scans from "./Scan";
import Reports from "./Reports";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Set the active section based on the URL path
  useEffect(() => {
    if (location.pathname === "/reports") {
      setActiveSection("reports");
    } else if (location.pathname === "/home" && location.search.includes("token=")) {
      // If we have a token in URL from OAuth, show scans section
      setActiveSection("scans");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
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
        <Navbar />
        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "scans" && <Scans />}
        {activeSection === "reports" && <Reports />}
      </div>
    </div>
  );
};

export default Home;




