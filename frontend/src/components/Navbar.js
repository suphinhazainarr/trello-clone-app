import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Trello Clone</Link>
      </div>

      <div className="navbar-menu">
        {user ? (
          <>
            <div className="navbar-end">
              <NotificationBell />
              <div className="navbar-item">
                <div className="user-menu">
                  <span className="username">{user.name}</span>
                  <button onClick={logout} className="logout-button">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="navbar-end">
            <Link to="/login" className="navbar-item">
              Login
            </Link>
            <Link to="/register" className="navbar-item">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 