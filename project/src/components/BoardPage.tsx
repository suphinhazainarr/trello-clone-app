import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';
import { useAuth } from '../contexts/AuthContext';
import AddCardForm from './AddCardForm';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { currentBoard, fetchBoard } = useBoard();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const loadBoard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading board with ID:', boardId);
        
        if (!boardId) {
          throw new Error('Board ID is missing');
        }

        await fetchBoard(boardId);
        console.log('Board loaded successfully:', currentBoard);
      } catch (err) {
        console.error('Error loading board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId, fetchBoard, isAuthenticated, token, navigate]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-screen">
        Board not found
      </div>
    );
  }

  console.log('Rendering board:', {
    title: currentBoard.title,
    listCount: currentBoard.lists?.length,
    lists: currentBoard.lists?.map(list => ({
      id: list.id,
      title: list.title,
      cardCount: list.cards?.length
    }))
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{currentBoard.title}</h1>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {currentBoard.lists?.map((list) => (
          <div
            key={list.id}
            className="bg-gray-100 rounded p-4 min-w-[300px]"
          >
            <h2 className="font-semibold mb-4">{list.title}</h2>
            <div className="space-y-2">
              {list.cards?.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded shadow p-3"
                >
                  <h3>{card.title}</h3>
                  {card.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <AddCardForm listId={list.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardPage; 