import React, { useState, useEffect } from "react";
import "./Scan.css";  // import the dedicated CSS file
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import Terminal from "../components/Terminal";

interface Repo {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
  owner: string;
  isPrivate: boolean;
  updatedAt: string;
}

interface Scan {
  id: number;
  repo_name: string;
  scan_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

interface TokenInfo {
  username: string;
  hasGithubToken: boolean;
  tokenFirstChars: string | null;
}

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '500px',
    width: '80%'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

Modal.setAppElement('#root');

const Scan: React.FC = () => {
  const [scanType, setScanType] = useState<"SAST" | "DAST">("SAST");
  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [debugMsg, setDebugMsg] = useState<string>("");
  
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    // Check for token in URL if redirected from GitHub OAuth
    const token = new URLSearchParams(window.location.search).get('token');
    
    if (token) {
      console.log("Found token in URL, saving to localStorage");
      localStorage.setItem("authToken", token);
      navigate('/home'); // Remove token from URL
    }
    
    // Check if we have a valid token
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      checkGithubConnection();
      fetchScans();
    }
  }, [navigate]);

  const checkGithubConnection = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("No authentication token found. Please log in.");
        return;
      }
      
      // First check if we have a GitHub token
      const tokenResponse = await fetch(`${apiUrl}/auth/github/checktoken`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log("Token info:", tokenData);
        setTokenInfo(tokenData);
        
        if (tokenData.hasGithubToken) {
          setGithubConnected(true);
          fetchRepositories();
        }
      } else {
        const errorData = await tokenResponse.json();
        setDebugMsg(`Token check error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
      setDebugMsg(`Connection check error: ${(error as Error).message}`);
    }
  };

  const handleScanTypeChange = (newType: "SAST" | "DAST") => {
    setScanType(newType);
  };

  const handleConnectGithub = async () => {
    try {
      setLoading(true);
      setDebugMsg("Redirecting to GitHub OAuth...");
      console.log("Connecting to GitHub via", `${apiUrl}/auth/github`);
      
      // Redirect to backend GitHub OAuth endpoint
      window.location.href = `${apiUrl}/auth/github`;
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
      setError(`Failed to connect to GitHub: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setError("No authentication token found. Please log in.");
        return;
      }
      
      console.log("Fetching repositories...");
      const response = await fetch(`${apiUrl}/auth/github/repositories`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to fetch repositories");
      }
      
      const data = await response.json();
      console.log("Repositories fetched:", data);
      setRepositories(data.repositories);
      setGithubConnected(true);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setError(`Failed to fetch repositories: ${(error as Error).message}`);
      setGithubConnected(false);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchScans = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;
      
      const response = await fetch(`${apiUrl}/scan`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch scans");
      }
      
      const data = await response.json();
      setScans(data.scans || []);
    } catch (error) {
      console.error("Error fetching scans:", error);
    }
  };

  const openScanModal = (repo: Repo) => {
    setSelectedRepo(repo);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRepo(null);
  };

  const startScan = async () => {
    if (!selectedRepo) return;
    
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      
      const response = await fetch(`${apiUrl}/scan/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          repoName: selectedRepo.name,
          repoUrl: selectedRepo.url,
          repoOwner: selectedRepo.owner,
          scanType
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start scan");
      }
      
      const data = await response.json();
      closeModal();
      
      // Add the new scan to our list
      const newScan = {
        id: data.scanId,
        repo_name: selectedRepo.name,
        scan_type: scanType,
        status: "in_progress",
        started_at: new Date().toISOString(),
        completed_at: null
      };
      
      setScans(prevScans => [newScan, ...prevScans]);
      
      // Show success message
      alert(`Scan started for ${selectedRepo.name}`);
    } catch (error) {
      console.error("Error starting scan:", error);
      setError(`Failed to start scan: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const viewScanResults = (scanId: number) => {
    navigate(`/reports?scanId=${scanId}`);
  };

  const handleCancelScan = async (scanId: number) => {
    if (!scanId) return;
    
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      
      // Call the backend to cancel the scan
      const response = await fetch(`${apiUrl}/scan/${scanId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel scan");
      }
      
      // Update the scan status locally
      setScans(prevScans => 
        prevScans.map(scan => 
          scan.id === scanId 
            ? { ...scan, status: "cancelled" } 
            : scan
        )
      );
      
      // Fetch updated scans after a brief delay
      setTimeout(() => {
        fetchScans();
      }, 1000);
      
    } catch (error) {
      console.error("Error cancelling scan:", error);
      setError(`Failed to cancel scan: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-container">
      <h2>Scans</h2>

      {/* SCAN OPTIONS CARD */}
      <div className="scan-options-card">
        <div className="scan-type-toggle">
          <label>
            <input
              type="radio"
              value="SAST"
              checked={scanType === "SAST"}
              onChange={() => handleScanTypeChange("SAST")}
            />
            SAST
          </label>
          <label>
            <input
              type="radio"
              value="DAST"
              checked={scanType === "DAST"}
              onChange={() => handleScanTypeChange("DAST")}
            />
            DAST
          </label>
        </div>

        {/* Connect GitHub */}
        {!githubConnected ? (
          <button onClick={handleConnectGithub} className="connect-github-btn" disabled={loading}>
            {loading ? "Connecting..." : "Connect GitHub"}
          </button>
        ) : (
          <p className="github-connected-label">GitHub Connected</p>
        )}
        
        {error && <p className="error-message">{error}</p>}
        
        {/* Debug info */}
        {tokenInfo && (
          <div className="token-info">
            <p>Username: {tokenInfo.username}</p>
            <p>GitHub Token: {tokenInfo.hasGithubToken ? "Available" : "Not available"}</p>
            {tokenInfo.tokenFirstChars && <p>Token starts with: {tokenInfo.tokenFirstChars}</p>}
          </div>
        )}
        
        {debugMsg && <p className="debug-message">{debugMsg}</p>}
        
        {/* Refresh button */}
        {githubConnected && (
          <button onClick={fetchRepositories} className="refresh-btn" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Repositories"}
          </button>
        )}
      </div>

      {/* REPOSITORY LIST */}
      {githubConnected && repositories.length > 0 && (
        <div className="repo-list-card">
          <h3>Your GitHub Repositories</h3>
          <table className="repo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Language</th>
                <th>Owner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo) => (
                <tr key={repo.id}>
                  <td>{repo.name}</td>
                  <td>{repo.language || "Unknown"}</td>
                  <td>{repo.owner}</td>
                  <td>
                    <button
                      onClick={() => openScanModal(repo)}
                      className="run-scan-btn"
                    >
                      Scan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* No repositories message */}
      {githubConnected && repositories.length === 0 && !loading && (
        <div className="no-repos-message">
          <p>No repositories found. Make sure you have repositories on GitHub or try refreshing.</p>
        </div>
      )}
      
      {/* RECENT SCANS LIST */}
      {scans.length > 0 && (
        <div className="scans-list-card">
          <h3>Recent Scans</h3>
          <table className="scans-table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Type</th>
                <th>Status</th>
                <th>Started</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id}>
                  <td>{scan.repo_name}</td>
                  <td>{scan.scan_type}</td>
                  <td>
                    <span className={`status status-${scan.status.toLowerCase()}`}>
                      {scan.status}
                    </span>
                  </td>
                  <td>{new Date(scan.started_at).toLocaleString()}</td>
                  <td>
                    {scan.status === "completed" ? (
                      <button
                        onClick={() => viewScanResults(scan.id)}
                        className="view-results-btn"
                      >
                        View Results
                      </button>
                    ) : scan.status === "in_progress" ? (
                      <span>In progress...</span>
                    ) : (
                      <span>{scan.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Terminal display for in-progress scans */}
      {scans.some(scan => scan.status === "in_progress") && (
        <div className="terminal-section">
          <h3>Scan Progress</h3>
          <Terminal 
            scanId={scans.find(scan => scan.status === "in_progress")?.id || null}
            running={true}
            repoName={scans.find(scan => scan.status === "in_progress")?.repo_name}
            onCancelScan={() => handleCancelScan(scans.find(scan => scan.status === "in_progress")?.id || 0)}
          />
          <div className="terminal-help-text">
            <p>Watching the AI analyze your code in real-time. When completed, you can view detailed results.</p>
          </div>
        </div>
      )}
      
      {/* SCAN CONFIRMATION MODAL */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Scan Confirmation"
      >
        <h2>Start Repository Scan</h2>
        {selectedRepo && (
          <div className="repo-info">
            <p><strong>Repository:</strong> {selectedRepo.name}</p>
            <p><strong>Owner:</strong> {selectedRepo.owner}</p>
            <p><strong>Language:</strong> {selectedRepo.language || "Unknown"}</p>
            <p><strong>Scan Type:</strong> {scanType}</p>
            
            <div className="scan-description">
              {scanType === "SAST" ? (
                <p>Static Analysis will examine your source code for security vulnerabilities without executing the program.</p>
              ) : (
                <p>Dynamic Analysis will examine your application at runtime to find security vulnerabilities during execution.</p>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={startScan} 
                className="start-scan-btn"
                disabled={loading}
              >
                {loading ? "Starting..." : "Start Scan"}
              </button>
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Scan;
