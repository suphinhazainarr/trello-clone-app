import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Users, Lock, Globe, Search, Grid, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useBoard } from '../contexts/BoardContext';
import Header from '../components/Header';
import CreateBoardModal from '../components/CreateBoardModal';
import SearchFilter from '../components/SearchFilter';

const Dashboard: React.FC = () => {
  const { boards } = useBoard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    labels: [],
    members: [],
    dueDateRange: null
  });

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentBoards = filteredBoards.slice(0, 4);
  const allBoards = filteredBoards;

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
                  <button className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Members
                  </button>
                  <button className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
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

          {/* Recently Viewed */}
          {recentBoards.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recently viewed</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentBoards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="group relative h-24 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    style={{ background: board.background }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors"></div>
                    <div className="relative p-4 h-full flex flex-col justify-between text-white">
                      <h3 className="font-medium truncate">{board.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs opacity-90">
                          {getVisibilityIcon(board.visibility)}
                          <span className="capitalize">{board.visibility}</span>
                        </div>
                        <Star className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Your Boards */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Your boards</span>
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create board</span>
              </button>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Create New Board Card */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center group"
                >
                  <div className="text-center">
                    <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-600 mx-auto mb-1" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-800">Create new board</span>
                  </div>
                </button>

                {/* Board Cards */}
                {allBoards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="group relative h-24 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    style={{ background: board.background }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors"></div>
                    <div className="relative p-4 h-full flex flex-col justify-between text-white">
                      <h3 className="font-medium truncate">{board.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs opacity-90">
                          {getVisibilityIcon(board.visibility)}
                          <span className="capitalize">{board.visibility}</span>
                        </div>
                        <Star className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Board name</h3>
                    <div className="flex items-center space-x-8">
                      <span className="text-sm font-medium text-gray-900">Visibility</span>
                      <span className="text-sm font-medium text-gray-900">Members</span>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  <div className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => setShowCreateModal(true)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="text-gray-600">Create new board</span>
                      </div>
                    </div>
                  </div>
                  
                  {allBoards.map((board) => (
                    <Link
                      key={board.id}
                      to={`/board/${board.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ background: board.background }}
                          >
                            <span className="text-white text-xs font-bold">
                              {board.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{board.title}</span>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            {getVisibilityIcon(board.visibility)}
                            <span className="capitalize">{board.visibility}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {board.members.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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