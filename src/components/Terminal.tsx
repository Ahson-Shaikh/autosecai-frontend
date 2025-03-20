import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './Terminal.css';

interface TerminalProps {
  scanId: number | null;
  running: boolean;
  repoName?: string;
  onCancelScan?: () => void;
}

interface LogMessage {
  timestamp: string;
  message: string;
  phase?: string;
}

interface FileProgress {
  timestamp: string;
  filePath: string;
  fileType: string;
}

interface AIService {
  service: string;
  model: string;
}

const Terminal: React.FC<TerminalProps> = ({ scanId, running, repoName = "Unknown Repository", onCancelScan }) => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [scanPhase, setScanPhase] = useState<string>('initializing');
  const [currentFile, setCurrentFile] = useState<string>('');
  const [aiService, setAiService] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Connect to Socket.IO when the component mounts
  useEffect(() => {
    if (!scanId || !running) return;
    
    const socketUrl = apiUrl;
    console.log(`Connecting to Socket.IO server at ${socketUrl}`);
    
    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setConnected(true);
      
      // Join the scan room
      newSocket.emit('join-scan', scanId);
      console.log(`Joined scan room: scan-${scanId}`);
      
      // Add an initial connection message
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: `Connected to scan server. Monitoring scan #${scanId}...`
      }]);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: `Connection error: ${error.message}`
      }]);
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log(`Disconnected from Socket.IO server: ${reason}`);
      setConnected(false);
      
      // Don't add duplicate disconnect messages
      setLogs(prev => {
        const lastLog = prev[prev.length - 1];
        if (lastLog && lastLog.message.includes('Disconnected from scan server')) {
          return prev;
        }
        return [...prev, {
          timestamp: new Date().toISOString(),
          message: `Disconnected from scan server: ${reason}`
        }];
      });
      
      // Attempt to reconnect if the scan is still running
      if (running && reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: 'Attempting to reconnect...'
        }]);
      }
    });
    
    newSocket.on('scan-log', (data: LogMessage) => {
      console.log('Received scan log:', data);
      setLogs(prev => [...prev, data]);
      
      if (data.phase) {
        setScanPhase(data.phase);
      }
    });
    
    newSocket.on('file-progress', (data: FileProgress) => {
      console.log('Received file progress:', data);
      setCurrentFile(data.filePath);
    });
    
    newSocket.on('ai-service', (data: AIService) => {
      console.log('Received AI service info:', data);
      setAiService(data.service);
      setAiModel(data.model);
    });
    
    setSocket(newSocket);
    
    // Cleanup when the component unmounts
    return () => {
      console.log('Leaving scan room and disconnecting socket');
      newSocket.emit('leave-scan');
      newSocket.disconnect();
    };
  }, [apiUrl, scanId, running]);

  // Auto-scroll to the bottom when logs update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle cancel scan
  const handleCancelScan = () => {
    if (onCancelScan) {
      onCancelScan();
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          Security Scan of {repoName} {scanId ? `(#${scanId})` : ''} - {scanPhase}
          {!connected && <span className="connection-status disconnected"> - Disconnected</span>}
        </div>
        <div className="terminal-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>
      </div>
      <div className="terminal-body" ref={terminalRef}>
        {logs.length === 0 && (
          <div className="terminal-line">
            <span className="prompt">$</span> Waiting for scan logs...
          </div>
        )}
        
        {logs.map((log, index) => {
          // Apply special styling for vulnerability findings
          const isVulnerability = log.message.includes('[High]') || log.message.includes('[Medium]') || log.message.includes('[Low]');
          let className = "terminal-line";
          
          if (isVulnerability) {
            if (log.message.includes('[High]')) {
              className += " vulnerability high";
            } else if (log.message.includes('[Medium]')) {
              className += " vulnerability medium";
            } else {
              className += " vulnerability low";
            }
          }
          
          // Apply styling for warnings
          if (log.phase === "warning" || log.message.includes('Warning:')) {
            className += " warning";
          }
          
          const time = new Date(log.timestamp).toLocaleTimeString();
          
          return (
            <div key={index} className={className}>
              <span className="prompt">$</span> [{time}] {log.message}
            </div>
          );
        })}
        
        {running && connected && (
          <div className="terminal-line cursor-line">
            <span className="prompt">$</span> <span className="cursor"></span>
          </div>
        )}
      </div>
      <div className="terminal-footer">
        <div className="scan-info">
          {aiService && (
            <div className="ai-service">
              AI: <span className="service-name">{aiService}</span>
              {aiModel && <span className="model-name">({aiModel})</span>}
            </div>
          )}
          <div className="scan-phase">
            Phase: <span className="phase-name">{scanPhase}</span>
          </div>
          {currentFile && (
            <div className="current-file">
              File: <span className="file-name">{currentFile}</span>
            </div>
          )}
        </div>
        {running && onCancelScan && (
          <button className="cancel-scan-btn" onClick={handleCancelScan}>
            Cancel Scan
          </button>
        )}
      </div>
    </div>
  );
};

export default Terminal; 