import { useState } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="navbar">
      {/* Search Bar */}
      <form className="search-container" onSubmit={handleSearch}>
        <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
</form>


      {/* Profile Dropdown */}
      <div className="profile-container">
        <FaUserCircle className="profile-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <p>Settings</p>
            <p>Profile</p>
            <p>Help</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
