import { useState } from "react";
import { FaUserCircle, FaCog, FaUser, FaQuestionCircle, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="navbar">
      {/* Logo/Title on the left */}
      <div className="navbar-brand" onClick={() => handleNavigation("/home")}>
        <h2>AutoSecAI</h2>
      </div>

      {/* Spacer to push profile icon to right */}
      <div className="spacer"></div>

      {/* Profile Dropdown */}
      <div className="profile-container">
        <FaUserCircle 
          className="profile-icon" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
        />
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={() => handleNavigation("/home")}>
              <FaHome className="dropdown-icon" />
              <span>Home</span>
            </div>
            <div className="dropdown-item" onClick={() => handleNavigation("/settings")}>
              <FaCog className="dropdown-icon" />
              <span>Settings</span>
            </div>
            <div className="dropdown-item" onClick={() => handleNavigation("/profile")}>
              <FaUser className="dropdown-icon" />
              <span>Profile</span>
            </div>
            <div className="dropdown-item" onClick={() => handleNavigation("/help")}>
              <FaQuestionCircle className="dropdown-icon" />
              <span>Help</span>
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item logout" onClick={handleLogout}>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
