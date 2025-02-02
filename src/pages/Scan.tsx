import React, { useState } from "react";
import "./Scan.css";  // import the dedicated CSS file

interface Repo {
  id: number;
  name: string;
  url: string;
}

const Scan: React.FC = () => {
  const [scanType, setScanType] = useState<"SAST" | "DAST">("SAST");
  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repo[]>([]);

  const handleScanTypeChange = (newType: "SAST" | "DAST") => {
    setScanType(newType);
  };

  const handleConnectGithub = async () => {
    // Real implementation: OAuth & fetch repos
    setGithubConnected(true);
    setRepositories([
      { id: 1, name: "MyFrontend", url: "github.com/user/MyFrontend" },
      { id: 2, name: "MyBackend", url: "github.com/user/MyBackend" },
      { id: 3, name: "MyAPI", url: "github.com/user/MyAPI" },
    ]);
  };

  const runScan = (repo: Repo) => {
    alert(`Running ${scanType} scan on repo: ${repo.name}`);
    // call your DeepSeek API here
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
          <button onClick={handleConnectGithub} className="connect-github-btn">
            Connect GitHub
          </button>
        ) : (
          <p className="github-connected-label">GitHub Connected</p>
        )}
      </div>

      {/* REPOSITORY LIST */}
      {githubConnected && (
        <div className="repo-list-card">
          <h3>Your GitHub Repositories</h3>
          <table className="repo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo) => (
                <tr key={repo.id}>
                  <td>{repo.name}</td>
                  <td>{repo.url}</td>
                  <td>
                    <button
                      onClick={() => runScan(repo)}
                      className="run-scan-btn"
                    >
                      Run {scanType} Scan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Scan;
