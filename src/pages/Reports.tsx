import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Reports.css";

interface Vulnerability {
  id: number;
  scan_id: number;
  severity: string;
  title: string;
  description: string;
  file_path: string;
  line_number: number;
  remediation: string;
}

interface Scan {
  id: number;
  repo_name: string;
  repo_url: string;
  scan_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

const Reports: React.FC = () => {
  const [scan, setScan] = useState<Scan | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  // Get scan ID from URL query parameter
  const scanId = new URLSearchParams(location.search).get('scanId');
  
  useEffect(() => {
    if (!scanId) {
      // If no scanId is provided, fetch all scans
      fetchScans();
    } else {
      // Fetch specific scan results
      fetchScanResults(parseInt(scanId));
    }
  }, [scanId]);
  
  const fetchScans = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}/scan`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch scans");
      }
      
      const data = await response.json();
      // If there are scans available, redirect to the most recent completed scan
      if (data.scans && data.scans.length > 0) {
        const completedScans = data.scans.filter((s: Scan) => s.status === "completed");
        if (completedScans.length > 0) {
          navigate(`/reports?scanId=${completedScans[0].id}`);
        }
      }
    } catch (error) {
      console.error("Error fetching scans:", error);
      setError("Failed to fetch scans. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchScanResults = async (id: number) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Not authenticated");
      }
      
      const response = await fetch(`${apiUrl}/scan/${id}/results`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch scan results");
      }
      
      const data = await response.json();
      setScan(data.scan);
      setVulnerabilities(data.vulnerabilities);
    } catch (error) {
      console.error("Error fetching scan results:", error);
      setError("Failed to fetch scan results. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const downloadPdfReport = async () => {
    if (!scanId) return;
    
    try {
      setDownloadingPdf(true);
      setPdfError("");
      
      // First check if the PDF exists by making a HEAD request
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Not authenticated");
      }
      
      // Open the PDF in a new tab
      const pdfUrl = `${apiUrl}/scan/${scanId}/report?token=${authToken}`;
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups for this website.");
      }
      
      // Display a message to the user
      console.log("PDF download initiated");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setPdfError(`Failed to download PDF: ${(error as Error).message}`);
    } finally {
      setDownloadingPdf(false);
    }
  };
  
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-info';
    }
  };
  
  // Group vulnerabilities by severity
  const highVulnerabilities = vulnerabilities.filter(v => v.severity.toLowerCase() === 'high');
  const mediumVulnerabilities = vulnerabilities.filter(v => v.severity.toLowerCase() === 'medium');
  const lowVulnerabilities = vulnerabilities.filter(v => v.severity.toLowerCase() === 'low');
  
  if (loading) {
    return <div className="reports-container loading">Loading scan results...</div>;
  }
  
  if (error) {
    return <div className="reports-container error">{error}</div>;
  }
  
  if (!scan) {
    return <div className="reports-container">No scan selected. Please run a scan first.</div>;
  }
  
  return (
    <div className="reports-container">
      <div className="report-header">
        <div>
          <h2>Security Scan Report</h2>
          <p className="repo-info">
            <span className="repo-name">{scan.repo_name}</span>
            <span className="scan-type">{scan.scan_type} Scan</span>
            <span className="scan-date">
              {new Date(scan.completed_at || scan.started_at).toLocaleString()}
            </span>
          </p>
        </div>
        
        <div className="pdf-download-section">
          <button 
            onClick={downloadPdfReport} 
            className="download-pdf-btn"
            disabled={downloadingPdf}
          >
            {downloadingPdf ? "Downloading..." : "Download PDF Report"}
          </button>
          {pdfError && <p className="pdf-error">{pdfError}</p>}
        </div>
      </div>
      
      <div className="vulnerabilities-summary">
        <div className="summary-card">
          <h3>Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{vulnerabilities.length}</span>
              <span className="stat-label">Total Vulnerabilities</span>
            </div>
            <div className="stat-item high">
              <span className="stat-value">{highVulnerabilities.length}</span>
              <span className="stat-label">High</span>
            </div>
            <div className="stat-item medium">
              <span className="stat-value">{mediumVulnerabilities.length}</span>
              <span className="stat-label">Medium</span>
            </div>
            <div className="stat-item low">
              <span className="stat-value">{lowVulnerabilities.length}</span>
              <span className="stat-label">Low</span>
            </div>
          </div>
        </div>
      </div>
      
      {vulnerabilities.length === 0 ? (
        <div className="no-vulnerabilities">
          <p>No vulnerabilities found. Great job!</p>
        </div>
      ) : (
        <div className="vulnerabilities-list">
          <h3>Vulnerabilities</h3>
          {vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="vulnerability-card">
              <div className="vulnerability-header">
                <h4>{vuln.title}</h4>
                <span className={`severity-badge ${getSeverityBadgeClass(vuln.severity)}`}>
                  {vuln.severity}
                </span>
              </div>
              
              <div className="vulnerability-meta">
                <span>File: {vuln.file_path}</span>
                <span>Line: {vuln.line_number}</span>
              </div>
              
              <div className="vulnerability-content">
                <div className="vulnerability-section">
                  <h5>Description</h5>
                  <p>{vuln.description}</p>
                </div>
                
                <div className="vulnerability-section">
                  <h5>Remediation</h5>
                  <p>{vuln.remediation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
