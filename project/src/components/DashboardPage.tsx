import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';
import { useAuth } from '../contexts/AuthContext';
import { Board } from '../types';

const DashboardPage: React.FC = () => {
  const { boards, createBoard } = useBoard();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, token, navigate]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      setError(null);
      const boardId = await createBoard(newBoardTitle.trim(), '#026AA7');
      setNewBoardTitle('');
      setIsCreating(false);
      navigate(`/board/${boardId}`);
    } catch (err) {
      console.error('Error creating board:', err);
      setError(err instanceof Error ? err.message : 'Failed to create board');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Boards</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Board
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter board title"
                className="w-full p-2 border rounded mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewBoardTitle('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newBoardTitle.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boards.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No boards yet. Create your first board!
          </div>
        ) : (
          boards.map((board: Board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{board.title}</h3>
                <div className="text-sm text-gray-500">
                  {board.lists?.length || 0} lists •{' '}
                  {board.lists?.reduce((sum, list) => sum + (list.cards?.length || 0), 0) || 0} cards
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 