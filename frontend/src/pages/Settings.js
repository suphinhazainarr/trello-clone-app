import React from 'react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <div className="settings-content">
        <div className="settings-section">
          <h2>Profile Settings</h2>
          {/* Add profile settings form here */}
        </div>
        <div className="settings-section">
          <h2>Notification Settings</h2>
          {/* Add notification settings here */}
        </div>
        <div className="settings-section">
          <h2>Account Settings</h2>
          {/* Add account settings here */}
        </div>
      </div>
    </div>
  );
};

export default Settings; 