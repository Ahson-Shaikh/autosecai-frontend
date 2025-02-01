import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="cards">
        <div className="card">
          <h2>Current Vulnerabilities</h2>
          <p>15</p>
        </div>
        <div className="card">
          <h2>SAST Scans Ran</h2>
          <p>42</p>
        </div>
        <div className="card">
          <h2>DAST Scans Ran</h2>
          <p>28</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
