import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Trello Clone</h1>
      <div className="boards-grid">
        <Link to="/board/new" className="create-board-card">
          <div className="create-board-content">
            <i className="fas fa-plus"></i>
            <span>Create New Board</span>
          </div>
        </Link>
        {/* Add your boards here */}
      </div>
    </div>
  );
};

export default Home; 