import React, { useState } from 'react';
import { Search, Star, Eye, Copy, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  creator: string;
  views: number;
  likes: number;
  background: string;
  preview: string;
  featured?: boolean;
}

const TemplatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { createBoard } = useBoard();

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📋' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'design', name: 'Design', icon: '🎨' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'hr', name: 'HR & Operations', icon: '👥' },
    { id: 'personal', name: 'Personal', icon: '👤' },
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'project-management', name: 'Project Management', icon: '📊' },
    { id: 'remote-work', name: 'Remote Work', icon: '🏠' },
    { id: 'sales', name: 'Sales', icon: '💰' },
    { id: 'support', name: 'Support', icon: '🎧' },
    { id: 'team-management', name: 'Team Management', icon: '👨‍👩‍👧‍👦' }
  ];

  const templates: Template[] = [
    {
      id: '1',
      title: 'Kanban Template',
      description: 'A simple kanban board for managing tasks and workflow',
      category: 'productivity',
      creator: 'Trello Team',
      views: 45200,
      likes: 1200,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      preview: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      featured: true
    },
    {
      id: '2',
      title: 'Project Management',
      description: 'Complete project management workflow with sprints and milestones',
      category: 'project-management',
      creator: 'Trello Team',
      views: 38100,
      likes: 890,
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      preview: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400',
      featured: true
    },
    {
      id: '3',
      title: 'New Hire Onboarding',
      description: 'Help new employees start strong with this onboarding template',
      category: 'hr',
      creator: 'Trello Team',
      views: 18300,
      likes: 531,
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      preview: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      title: 'Content Calendar',
      description: 'Plan and organize your content marketing strategy',
      category: 'marketing',
      creator: 'Marketing Pro',
      views: 23400,
      likes: 672,
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      preview: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '5',
      title: 'Design System',
      description: 'Organize design components and maintain consistency',
      category: 'design',
      creator: 'Design Team',
      views: 15600,
      likes: 445,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      preview: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '6',
      title: 'Remote Team Hub',
      description: 'Keep your remote team connected and productive',
      category: 'remote-work',
      creator: 'Remote Work Expert',
      views: 29800,
      likes: 823,
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      preview: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=400',
      featured: true
    }
  ];

  const featuredCategories = [
    { id: 'business', name: 'Business', icon: '💼', color: 'bg-blue-500' },
    { id: 'design', name: 'Design', icon: '🎨', color: 'bg-pink-500' },
    { id: 'education', name: 'Education', icon: '📚', color: 'bg-yellow-500' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️', color: 'bg-gray-500' },
    { id: 'marketing', name: 'Marketing', icon: '📈', color: 'bg-green-500' },
    { id: 'project-management', name: 'Project Management', icon: '📊', color: 'bg-purple-500' },
    { id: 'remote-work', name: 'Remote Work', icon: '🏠', color: 'bg-indigo-500' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTemplates = filteredTemplates.filter(t => t.featured);
  const newAndNotableTemplates = filteredTemplates.slice(0, 3);

  const handleUseTemplate = (template: Template) => {
    const boardId = createBoard(`${template.title} Copy`, template.background);
    navigate(`/board/${boardId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Find template"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Featured Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {featuredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-white text-xl">{category.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New and Notable Templates */}
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl">⭐</span>
              <h2 className="text-2xl font-bold text-gray-900">New and notable templates</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {newAndNotableTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div 
                    className="h-32 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${template.preview})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors"></div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                        TEMPLATE
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>by {template.creator}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{(template.views / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{template.likes}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Use template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Templates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Templates' : `${categories.find(c => c.id === selectedCategory)?.name} Templates`}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredTemplates.length} templates
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div 
                    className="h-24 relative"
                    style={{ background: template.background }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors"></div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded font-medium">
                        TEMPLATE
                      </span>
                    </div>
                    {template.featured && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{template.title}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>by {template.creator}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{(template.views / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Use template
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or browse different categories</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;