import React, { useState } from 'react';
import { Search, Filter, X, Calendar, Tag, User } from 'lucide-react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  availableLabels?: string[];
  availableMembers?: { id: string; name: string }[];
}

interface FilterOptions {
  labels: string[];
  members: string[];
  dueDateRange: 'overdue' | 'today' | 'week' | 'month' | null;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  availableLabels = [],
  availableMembers = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    labels: [],
    members: [],
    dueDateRange: null
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      labels: [],
      members: [],
      dueDateRange: null
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  const hasActiveFilters = filters.labels.length > 0 || filters.members.length > 0 || filters.dueDateRange;

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-1 px-3 py-2 border rounded-md transition-colors ${
            hasActiveFilters 
              ? 'bg-blue-100 border-blue-300 text-blue-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {filters.labels.length + filters.members.length + (filters.dueDateRange ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Labels Filter */}
            {availableLabels.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Labels</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableLabels.map((label) => (
                    <button
                      key={label}
                      onClick={() => {
                        const newLabels = filters.labels.includes(label)
                          ? filters.labels.filter(l => l !== label)
                          : [...filters.labels, label];
                        handleFilterChange({ labels: newLabels });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.labels.includes(label)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Members Filter */}
            {availableMembers.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Members</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        const newMembers = filters.members.includes(member.id)
                          ? filters.members.filter(m => m !== member.id)
                          : [...filters.members, member.id];
                        handleFilterChange({ members: newMembers });
                      }}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.members.includes(member.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <span>{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Due Date</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'today', label: 'Due Today' },
                  { value: 'week', label: 'Due This Week' },
                  { value: 'month', label: 'Due This Month' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newRange = filters.dueDateRange === option.value ? null : option.value as any;
                      handleFilterChange({ dueDateRange: newRange });
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.dueDateRange === option.value
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;