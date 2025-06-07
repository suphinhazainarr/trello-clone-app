import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <i className="fas fa-home"></i>
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/boards" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <i className="fas fa-columns"></i>
          <span>Boards</span>
        </NavLink>
        
        <NavLink to="/members" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <i className="fas fa-users"></i>
          <span>Members</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar; 