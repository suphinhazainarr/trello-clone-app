import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Star, Users, Lock, Globe } from 'lucide-react';
import { useBoard } from '../contexts/BoardContext';
import Header from '../components/Header';
import BoardList from '../components/BoardList';
import CardModal from '../components/CardModal';
import { Board, User } from '../types';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { currentBoard, addList, moveCard, fetchBoard, setCurrentBoard, updateBoard } = useBoard();
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial board load
  useEffect(() => {
    const loadBoard = async () => {
      if (!boardId) {
        console.error('Board ID is missing');
        setError('Board ID is missing');
        navigate('/dashboard');
        return;
      }

      // Skip if we already have the correct board loaded
      if (!isInitialLoad && currentBoard?.id === boardId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await fetchBoard(boardId);
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Error loading board:', err);
        setError(err instanceof Error ? err.message : 'Failed to load board');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();

    // Clean up function
    return () => {
      if (boardId !== currentBoard?.id) {
        setCurrentBoard(null);
      }
    };
  }, [boardId, isInitialLoad]); // Only depend on boardId and isInitialLoad

  const handleAddList = async () => {
    if (!newListTitle.trim() || !currentBoard) {
      return;
    }

    try {
      await addList(currentBoard.id, newListTitle.trim());
      setNewListTitle('');
      setShowAddList(false);
    } catch (err) {
      console.error('Error adding list:', err);
      // Show error message to user
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination || !currentBoard) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list reordering
    if (type === 'list') {
      const newLists = Array.from(currentBoard.lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);

      const updatedBoard = {
        ...currentBoard,
        lists: newLists
      };

      updateBoard(updatedBoard);
      return;
    }

    // Handle card moving
    moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center pt-20">
          <div className="text-red-500 text-lg mb-4">{error || 'Board not found'}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: currentBoard.background }}>
      <Header />
      
      {/* Board Header */}
      <div className="px-4 py-3 border-b border-white border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">{currentBoard.title}</h1>
            <button className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors">
              <Star className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1 text-white text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              {getVisibilityIcon(currentBoard.visibility)}
              <span className="capitalize">{currentBoard.visibility}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {currentBoard.members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.user?.id || index}
                    className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium border-2 border-white"
                  >
                    {member.user?.name?.[0] || `U${index + 1}`}
                  </div>
                ))}
              </div>
              <button className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-1 rounded text-sm transition-colors">
                Invite
              </button>
            </div>
            
            <button className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-4 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board-lists" type="list" direction="horizontal">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex space-x-4 min-h-full pb-4"
              >
                {currentBoard.lists.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="min-w-72 flex-shrink-0"
                      >
                        <BoardList
                          list={list}
                          onCardClick={(cardId) => setSelectedCard(cardId)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}

                {/* Add List */}
                <div className="min-w-72 flex-shrink-0">
                  {showAddList ? (
                    <div className="bg-gray-100 rounded-lg p-3">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                        placeholder="Enter list title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleAddList}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Add list
                        </button>
                        <button
                          onClick={() => {
                            setShowAddList(false);
                            setNewListTitle('');
                          }}
                          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddList(true)}
                      className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg p-3 flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add another list</span>
                    </button>
                  )}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          cardId={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};

export default BoardPage;