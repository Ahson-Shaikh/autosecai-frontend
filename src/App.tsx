import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";  
import Register from "./pages/Register";  
import Home from "./pages/Home";
import { useEffect } from "react";
import Settings from "./pages/Settings";

const App = () => {
  // Check for token in URL if redirected from GitHub OAuth
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    
    if (token) {
      localStorage.setItem("authToken", token);
      // Clean URL by removing token query parameter
      const cleanURL = window.location.pathname;
      window.history.replaceState({}, document.title, cleanURL);
    }
  }, []);

  return (
    <Router>
      <Routes>  
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />  
        <Route path="/register" element={<Register />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/reports" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
