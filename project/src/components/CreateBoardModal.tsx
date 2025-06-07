import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';

interface CreateBoardModalProps {
  onClose: () => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [visibility, setVisibility] = useState<'private' | 'team' | 'public'>('private');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createBoard } = useBoard();
  const navigate = useNavigate();

  const backgrounds = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const boardId = await createBoard(title.trim(), selectedBackground);
      navigate(`/board/${boardId}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create board</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Board Preview */}
          <div className="relative">
            <div 
              className="w-full h-24 rounded-lg flex items-center justify-center text-white font-medium text-lg relative overflow-hidden"
              style={{ background: selectedBackground }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <span className="relative">{title || 'My Trello Board'}</span>
            </div>
          </div>

          {/* Board Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Board title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add board title"
              maxLength={50}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/50</p>
          </div>

          {/* Background Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Background
            </label>
            <div className="grid grid-cols-4 gap-2">
              {backgrounds.map((bg, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedBackground(bg)}
                  className="relative w-full h-12 rounded-md overflow-hidden border-2 transition-all hover:scale-105"
                  style={{ 
                    background: bg,
                    borderColor: selectedBackground === bg ? '#3b82f6' : 'transparent'
                  }}
                  disabled={isLoading}
                >
                  {selectedBackground === bg && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value as 'private')}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">Private</div>
                  <div className="text-sm text-gray-500">Only you can see and edit this board</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="team"
                  checked={visibility === 'team'}
                  onChange={(e) => setVisibility(e.target.value as 'team')}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">Team</div>
                  <div className="text-sm text-gray-500">Team members can see and edit this board</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value as 'public')}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">Public</div>
                  <div className="text-sm text-gray-500">Anyone on the internet can see this board</div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;