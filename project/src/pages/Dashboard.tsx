import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Users, Lock, Globe, Search, Grid, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useBoard } from '../contexts/BoardContext';
import Header from '../components/Header';
import CreateBoardModal from '../components/CreateBoardModal';
import SearchFilter from '../components/SearchFilter';
import { Board } from '../types';

interface FilterOptions {
  labels: string[];
  members: string[];
  dueDateRange: 'overdue' | 'today' | 'week' | 'month' | null;
}

const Dashboard: React.FC = () => {
  const { boards } = useBoard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    labels: [],
    members: [],
    dueDateRange: null
  });

  // Filter out invalid boards
  const validBoards = boards.filter((board: Board) => board && board.id && board.id !== 'undefined');
  const starredBoards = validBoards.filter((board: Board) => board.isStarred);
  const recentBoards = validBoards.slice(0, 4);
  const allBoards = validBoards;

  const filteredBoards = validBoards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 text-gray-900 bg-blue-100 rounded-md"
              >
                <Grid className="h-4 w-4" />
                <span className="text-sm font-medium">Boards</span>
              </Link>
              <Link
                to="/templates"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Templates</span>
              </Link>
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Home</span>
              </button>
            </nav>

            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Workspaces
              </h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Trello Workspace</div>
                    <div className="text-xs text-gray-500">Free</div>
                  </div>
                </div>
                <div className="ml-9 space-y-1">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Boards
                  </Link>
                  <button
                    className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Members
                  </button>
                  <button
                    className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <h4 className="font-semibold mb-2">Try Trello Premium</h4>
              <p className="text-sm text-purple-100 mb-3">
                Get Planner (full access), Atlassian Intelligence, card mirroring, list colors, and more.
              </p>
              <button className="bg-white text-purple-600 px-3 py-1 rounded text-sm font-medium hover:bg-purple-50 transition-colors">
                Start free trial
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Activity Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Stay on track and up to date</h1>
                <p className="text-blue-100">
                  Invite people to boards and cards, leave comments, add due dates, and we'll show the most important activity here.
                </p>
              </div>
              <div className="hidden lg:block">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Collaboration"
                  className="w-32 h-24 object-cover rounded-lg opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <SearchFilter
              onSearch={setSearchQuery}
              onFilter={setFilters}
              availableLabels={['high-priority', 'medium-priority', 'low-priority', 'design', 'development']}
              availableMembers={[
                { id: '1', name: 'John Doe' },
                { id: '2', name: 'Jane Smith' }
              ]}
            />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Starred Boards */}
          {starredBoards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">⭐ Starred Boards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {starredBoards.map((board: Board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    style={{ backgroundColor: board.background }}
                  >
                    <h3 className="font-medium text-gray-900">{board.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Boards */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">🕒 Recent Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentBoards.map((board: Board, index: number) => (
                <Link
                  key={`recent-${board.id}-${index}`}
                  to={`/board/${board.id}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  style={{ backgroundColor: board.background }}
                >
                  <h3 className="font-medium text-gray-900">{board.title}</h3>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    {getVisibilityIcon(board.visibility)}
                    <span className="ml-1 capitalize">{board.visibility}</span>
                  </div>
                </Link>
              ))}
              <button
                key="create-board-button"
                onClick={() => setShowCreateModal(true)}
                className="block p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors text-center"
              >
                <Plus className="mx-auto mb-2" />
                <span className="font-medium text-gray-600">Create new board</span>
              </button>
            </div>
          </div>

          {/* All Boards */}
          <div>
            <h2 className="text-lg font-semibold mb-4">📋 All Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allBoards.map((board: Board, index: number) => (
                <Link
                  key={`all-${board.id}-${index}`}
                  to={`/board/${board.id}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  style={{ backgroundColor: board.background }}
                >
                  <h3 className="font-medium text-gray-900">{board.title}</h3>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    {getVisibilityIcon(board.visibility)}
                    <span className="ml-1 capitalize">{board.visibility}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {allBoards.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No boards found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search terms</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Quick Start Templates */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Get started faster with a template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Kanban Template', color: 'bg-gradient-to-r from-blue-400 to-blue-600', category: 'productivity' },
                { name: 'Project Management', color: 'bg-gradient-to-r from-green-400 to-green-600', category: 'business' },
                { name: 'Team Sprint', color: 'bg-gradient-to-r from-purple-400 to-purple-600', category: 'development' },
                { name: 'Personal Tasks', color: 'bg-gradient-to-r from-orange-400 to-orange-600', category: 'personal' }
              ].map((template) => (
                <Link
                  key={template.name}
                  to="/templates"
                  className={`h-24 ${template.color} rounded-lg text-white p-4 text-left hover:opacity-90 transition-opacity group`}
                >
                  <h3 className="font-medium mb-1 group-hover:scale-105 transition-transform">{template.name}</h3>
                  <p className="text-xs opacity-90">Click to explore</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;