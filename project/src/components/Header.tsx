import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronDown, Home, Layout, FileText, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from './NotificationPanel';
import OnlineUsers from './OnlineUsers';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateBoard = () => {
    navigate('/dashboard');
    setShowCreateMenu(false);
  };

  return (
    <header className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-2 hover:bg-blue-700 px-2 py-1 rounded">
          <Layout className="h-6 w-6" />
          <span className="font-bold text-lg">Trello</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded text-sm"
          >
            <Home className="h-4 w-4" />
            <span>Boards</span>
          </Link>
          
          <Link 
            to="/templates" 
            className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded text-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </Link>
        </nav>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-blue-500 text-white placeholder-blue-200 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <OnlineUsers />
        
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-400 px-3 py-2 rounded text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg border z-50">
              <div className="py-2">
                <button
                  onClick={handleCreateBoard}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Layout className="h-4 w-4" />
                  <span>Create board</span>
                </button>
                <Link
                  to="/templates"
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Start with template</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <NotificationPanel />

        <button className="p-2 hover:bg-blue-700 rounded">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 hover:bg-blue-700 px-2 py-1 rounded"
          >
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
              {user?.initials}
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                    {user?.initials}
                  </div>
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                  Profile and visibility
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                  Activity
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                  Cards
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">
                  Settings
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;