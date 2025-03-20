import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Settings.css";
import Navbar from "./Navbar";

interface ApiKeys {
  openaiKey: string;
  ollamaEndpoint: string;
  ollamaModel: string;
}

interface OllamaModel {
  name: string;
  size?: number;
  modified?: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ai");
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openaiKey: "",
    ollamaEndpoint: "",
    ollamaModel: ""
  });
  const [hasKeys, setHasKeys] = useState({
    openai: false,
    ollama: false
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [testingConnection, setTestingConnection] = useState<{
    openai: boolean;
    ollama: boolean;
  }>({
    openai: false,
    ollama: false
  });
  const [connectionStatus, setConnectionStatus] = useState<{
    openai: { success: boolean; message: string } | null;
    ollama: { success: boolean; message: string } | null;
  }>({
    openai: null,
    ollama: null
  });
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [fetchingModels, setFetchingModels] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Get the API URL from environment variables or use default
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Load saved API keys on component mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    
    axios.get(`${apiUrl}/settings/api-keys`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(response => {
        setHasKeys({
          openai: response.data.hasOpenAI,
          ollama: response.data.hasOllama
        });
        // Only set keys if they exist and are being sent from backend
        if (response.data.openaiKey) {
          setApiKeys(prevKeys => ({
            ...prevKeys,
            openaiKey: response.data.openaiKey
          }));
        }
        if (response.data.ollamaEndpoint) {
          setApiKeys(prevKeys => ({
            ...prevKeys,
            ollamaEndpoint: response.data.ollamaEndpoint
          }));
        }
        if (response.data.ollamaModel) {
          setApiKeys(prevKeys => ({
            ...prevKeys,
            ollamaModel: response.data.ollamaModel
          }));
        }
        
        // If Ollama endpoint exists, fetch models
        if (response.data.ollamaEndpoint) {
          fetchOllamaModels(response.data.ollamaEndpoint);
        }
      })
      .catch(err => {
        console.error("Error loading settings:", err);
        if (err.response?.status === 404) {
          // Settings not found is normal for a new user
          console.log("No settings found, using defaults");
        } else {
          setErrorMsg(`Failed to load settings: ${err.response?.data?.error || "Unknown error"}`);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate, apiUrl]);

  // Normalize URL to ensure it has a protocol
  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    
    // If URL doesn't start with http:// or https://, add http://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for ollamaEndpoint to ensure valid URL format
    if (name === 'ollamaEndpoint' && value.trim()) {
      setApiKeys(prevKeys => ({
        ...prevKeys,
        [name]: value  // Store original input value
      }));
      
      // Use normalized URL with protocol for API calls
      const normalizedUrl = normalizeUrl(value);
      if (normalizedUrl !== value && normalizedUrl.trim()) {
        fetchOllamaModels(normalizedUrl);
      } else {
        fetchOllamaModels(value);
      }
    } else {
      setApiKeys(prevKeys => ({
        ...prevKeys,
        [name]: value
      }));
    }
    
    // Clear saved message when user makes changes
    setIsSaved(false);
    // Clear any previous errors
    setErrorMsg("");
  };

  const fetchOllamaModels = async (endpoint: string) => {
    if (!endpoint) return;
    
    setFetchingModels(true);
    
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        navigate("/login");
        return;
      }

      // Use normalized URL for the API call
      const normalizedEndpoint = normalizeUrl(endpoint);
      
      const response = await axios.post(
        `${apiUrl}/settings/ollama-models`,
        { ollamaEndpoint: normalizedEndpoint },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.success && response.data.models) {
        setOllamaModels(response.data.models);
        
        // If no model is selected but models are available, select the first one
        if (!apiKeys.ollamaModel && response.data.models.length > 0) {
          setApiKeys(prevKeys => ({
            ...prevKeys,
            ollamaModel: response.data.models[0].name
          }));
        }
      }
    } catch (err: any) {
      console.error("Error fetching Ollama models:", err);
      setOllamaModels([]);
    } finally {
      setFetchingModels(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        navigate("/login");
        return;
      }

      // Normalize Ollama endpoint URL if present
      const normalizedOllamaEndpoint = apiKeys.ollamaEndpoint 
        ? normalizeUrl(apiKeys.ollamaEndpoint) 
        : apiKeys.ollamaEndpoint;

      const response = await axios.post(
        `${apiUrl}/settings/api-keys`,
        {
          openaiKey: apiKeys.openaiKey,
          ollamaEndpoint: normalizedOllamaEndpoint,
          ollamaModel: apiKeys.ollamaModel
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      setIsSaved(true);
      setHasKeys({
        openai: !!apiKeys.openaiKey,
        ollama: !!apiKeys.ollamaEndpoint
      });
      
      // Update saved status and clear after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error saving API keys:", err);
      setErrorMsg(`Failed to save settings: ${err.response?.data?.error || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testOpenAIConnection = async () => {
    if (!apiKeys.openaiKey) {
      setConnectionStatus(prev => ({
        ...prev,
        openai: { success: false, message: "OpenAI API key is required" }
      }));
      return;
    }

    setTestingConnection(prev => ({ ...prev, openai: true }));
    setConnectionStatus(prev => ({ ...prev, openai: null }));

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${apiUrl}/settings/test-connection`,
        { service: "openai" },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      setConnectionStatus(prev => ({
        ...prev,
        openai: { 
          success: response.data.success,
          message: response.data.message || "Connection successful"
        }
      }));
    } catch (err: any) {
      console.error("OpenAI connection test error:", err);
      setConnectionStatus(prev => ({
        ...prev,
        openai: {
          success: false,
          message: err.response?.data?.error || "Connection failed"
        }
      }));
    } finally {
      setTestingConnection(prev => ({ ...prev, openai: false }));
    }
  };

  const testOllamaConnection = async () => {
    if (!apiKeys.ollamaEndpoint) {
      setConnectionStatus(prev => ({
        ...prev,
        ollama: { success: false, message: "Ollama endpoint is required" }
      }));
      return;
    }

    setTestingConnection(prev => ({ ...prev, ollama: true }));
    setConnectionStatus(prev => ({ ...prev, ollama: null }));

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        navigate("/login");
        return;
      }

      // Normalize Ollama endpoint URL
      const normalizedOllamaEndpoint = normalizeUrl(apiKeys.ollamaEndpoint);

      const response = await axios.post(
        `${apiUrl}/settings/test-connection`,
        { service: "ollama", endpoint: normalizedOllamaEndpoint },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      // If we got models back from the API, update our models state
      if (response.data.success && response.data.models && response.data.models.length > 0) {
        const models = response.data.models.map((name: string) => ({ name }));
        setOllamaModels(models);
        
        // If no model is selected but models are available, select the first one
        if (!apiKeys.ollamaModel && models.length > 0) {
          setApiKeys(prevKeys => ({
            ...prevKeys,
            ollamaModel: models[0].name
          }));
        }
      }

      setConnectionStatus(prev => ({
        ...prev,
        ollama: { 
          success: response.data.success,
          message: response.data.message || "Connection successful"
        }
      }));
    } catch (err: any) {
      console.error("Ollama connection test error:", err);
      setConnectionStatus(prev => ({
        ...prev,
        ollama: {
          success: false,
          message: err.response?.data?.error || "Connection failed"
        }
      }));
    } finally {
      setTestingConnection(prev => ({ ...prev, ollama: false }));
    }
  };

  // Format the filesize in a readable way (MB, GB)
  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return "Unknown size";
    
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  return (
    <>
      <Navbar />
      <div className="settings-page-wrapper">
        <div className="settings-container">
          <h1>Settings</h1>
          <div className="back-link" onClick={() => navigate('/home')}>
            ← Back to Home
          </div>
          
          <div className="settings-tabs">
            <button 
              className={activeTab === "ai" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("ai")}
            >
              AI Integration
            </button>
            <button 
              className={activeTab === "account" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("account")}
            >
              Account Settings
            </button>
            <button 
              className={activeTab === "notifications" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("notifications")}
            >
              Notifications
            </button>
          </div>
          
          <div className="settings-content">
            {activeTab === "ai" && (
              <div className="ai-settings">
                <h2>AI Service Integration</h2>
                <p className="settings-description">
                  Configure your AI providers for code scanning. At least one provider is required for vulnerability scanning.
                </p>
                
                {errorMsg && <div className="settings-error">{errorMsg}</div>}
                {isSaved && <div className="settings-success">Settings saved successfully!</div>}
                
                <div className="settings-content-section">
                  <h3>AI Integration</h3>
                  <p className="settings-description">
                    Configure your AI providers for code scanning. At least one provider is required for vulnerability scanning.
                  </p>
                  
                  {/* OpenAI section */}
                  <div className="form-group">
                    <label htmlFor="openaiKey">OpenAI API Key</label>
                    <input
                      type="password"
                      id="openaiKey"
                      name="openaiKey"
                      value={apiKeys.openaiKey}
                      onChange={handleInputChange}
                      className={apiKeys.openaiKey && apiKeys.openaiKey.includes('your_') ? 'error-input' : ''}
                      placeholder="sk-..."
                    />
                    {apiKeys.openaiKey && apiKeys.openaiKey.includes('your_') && (
                      <div className="input-warning">
                        Please enter a real OpenAI API key, not the placeholder value.
                      </div>
                    )}
                    <div className="input-help">
                      Your OpenAI API key will be encrypted and stored securely. 
                      Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI dashboard</a>.
                    </div>
                    <button 
                      onClick={testOpenAIConnection}
                      disabled={!apiKeys.openaiKey || apiKeys.openaiKey.includes('your_') || testingConnection.openai}
                      className="test-connection-btn"
                    >
                      {testingConnection.openai ? 'Testing...' : 'Test Connection'}
                    </button>
                    {connectionStatus.openai && (
                      <div className={connectionStatus.openai.success ? "connection-success" : "connection-error"}>
                        {connectionStatus.openai.message}
                      </div>
                    )}
                  </div>
                  
                  {/* Ollama section */}
                  <div className="form-group">
                    <label htmlFor="ollamaEndpoint">
                      Ollama Endpoint
                      {!apiKeys.openaiKey && <span className="required-field"> (Required when OpenAI is not configured)</span>}
                    </label>
                    <input
                      type="text"
                      id="ollamaEndpoint"
                      name="ollamaEndpoint"
                      value={apiKeys.ollamaEndpoint}
                      onChange={handleInputChange}
                      placeholder="http://localhost:11434"
                      className={!apiKeys.openaiKey && !apiKeys.ollamaEndpoint ? "error-input" : ""}
                    />
                    {!apiKeys.openaiKey && !apiKeys.ollamaEndpoint && (
                      <div className="input-warning">
                        You must configure either OpenAI API key or Ollama endpoint to use AI scanning.
                      </div>
                    )}
                    <div className="input-help">
                      Your Ollama API endpoint. For public Ollama services, use the full URL (e.g., http://example.com:11434).
                      For local Ollama, use http://localhost:11434.
                    </div>
                    <button 
                      onClick={testOllamaConnection}
                      disabled={!apiKeys.ollamaEndpoint || testingConnection.ollama}
                      className="test-connection-btn"
                    >
                      {testingConnection.ollama ? 'Testing...' : 'Test Connection'}
                    </button>
                    {connectionStatus.ollama && (
                      <div className={connectionStatus.ollama.success ? "connection-success" : "connection-error"}>
                        {connectionStatus.ollama.message}
                      </div>
                    )}
                  </div>
                  
                  {/* Ollama Model Selection */}
                  {apiKeys.ollamaEndpoint && (
                    <div className="form-group">
                      <label htmlFor="ollamaModel">Ollama Model</label>
                      <div className="model-select-container">
                        <select
                          id="ollamaModel"
                          name="ollamaModel"
                          value={apiKeys.ollamaModel}
                          onChange={handleInputChange}
                          disabled={fetchingModels || ollamaModels.length === 0}
                          className="model-select"
                        >
                          {ollamaModels.length === 0 ? (
                            <option value="">No models available</option>
                          ) : (
                            <>
                              <option value="">Select a model</option>
                              {ollamaModels.map(model => (
                                <option key={model.name} value={model.name}>
                                  {model.name} {model.size ? `(${formatFileSize(model.size)})` : ''}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        {fetchingModels && <span className="loading-indicator">Loading models...</span>}
                      </div>
                      <div className="input-help">
                        Select which model to use for security scanning. Smaller models use less RAM.
                      </div>
                    </div>
                  )}
                  
                  <div className="settings-info-box">
                    <h3>About AI Integration</h3>
                    <p>AutoSecAI supports two different AI backends for security scanning:</p>
                    <ul>
                      <li><strong>Ollama</strong>: Free, runs locally on your machine, but may provide less accurate results</li>
                      <li><strong>OpenAI GPT-4</strong>: More accurate analysis but requires an API key and costs money per scan</li>
                    </ul>
                    <p>Configure at least one of these options to enable AI-powered security scanning.</p>
                  </div>
                  
                  <div className="settings-actions">
                    <button 
                      className="save-button"
                      onClick={saveSettings}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "account" && (
              <div className="account-settings">
                <h2>Account Settings</h2>
                <p>Account settings will be implemented in a future update.</p>
              </div>
            )}
            
            {activeTab === "notifications" && (
              <div className="notification-settings">
                <h2>Notification Settings</h2>
                <p>Notification settings will be implemented in a future update.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings; 