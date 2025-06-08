import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { 
  createBoard as apiCreateBoard, 
  getBoards, 
  updateBoard as apiUpdateBoard, 
  deleteBoard as apiDeleteBoard,
  createList as apiCreateList,
  updateList as apiUpdateList,
  deleteList as apiDeleteList,
  apiCreateCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  moveCard as apiMoveCard,
  apiGetBoard
} from '../services/api';
import { Board, Card, List, User } from '../types';
import { socketService } from '../services/socket.service';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Comment {
  id: string;
  text: string;
  user: string;
  createdAt: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  user: string;
  createdAt: string;
}

interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  createBoard: (title: string, background: string) => Promise<string>;
  deleteBoard: (boardId: string) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  updateBoard: (board: Board) => Promise<void>;
  addList: (boardId: string, title: string) => Promise<void>;
  updateList: (listId: string, updates: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addCard: (listId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, sourceListId: string, destListId: string, destIndex: number) => Promise<void>;
  fetchBoard: (boardId: string) => Promise<Board>;
}

interface BoardProviderProps {
  children: React.ReactNode;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const { token } = useAuth();

  // Memoize the fetchBoard function
  const fetchBoard = useCallback(async (boardId: string): Promise<Board> => {
    try {
      if (!boardId || boardId === 'undefined') {
        throw new Error('Board ID is missing or invalid');
      }

      console.log('Fetching board with ID:', boardId);
      const fetchedBoard = await apiGetBoard(boardId);

      if (!fetchedBoard || !fetchedBoard.id) {
        throw new Error('Invalid board data received from server');
      }

      // Update boards list if needed
      setBoards(prev => {
        const boardIndex = prev.findIndex(b => b.id === fetchedBoard.id);
        if (boardIndex === -1) {
          return [...prev, fetchedBoard];
        }
        const newBoards = [...prev];
        newBoards[boardIndex] = fetchedBoard;
        return newBoards;
      });
      
      setCurrentBoard(fetchedBoard);
      return fetchedBoard;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }, []); // No dependencies needed as it only uses stable functions

  // Memoize the setCurrentBoard function
  const setCurrentBoardSafely = useCallback((board: Board | null) => {
    setCurrentBoard(prev => {
      if (prev?.id === board?.id) return prev;
      return board;
    });
  }, []);

  useEffect(() => {
    if (token) {
      console.log('Token found, loading boards...');
      loadBoards();
      socketService.connect();
    } else {
      console.log('No token found, skipping board load');
      setBoards([]);
      setCurrentBoard(null);
    }
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // Separate useEffect for socket board events
  useEffect(() => {
    if (!currentBoard?.id) return;

    console.log(`Setting up socket listeners for board: ${currentBoard.id}`);
    
    // Join board room
    socketService.joinBoard(currentBoard.id);

    // Create event handler
    const handleBoardEvent = (event: string, data: any) => {
      console.log(`Board event received: ${event}`, data);
      
      // Skip user join/leave events to prevent loops
      if (event === 'userJoined' || event === 'userLeft') {
        return;
      }

      switch (event) {
        case 'updated':
          if (data?.id === currentBoard.id) {
            setCurrentBoard(prev => prev?.id === data.id ? {...prev, ...data} : prev);
            setBoards(prev => prev.map(b => b.id === data.id ? {...b, ...data} : b));
          }
          break;
        case 'deleted':
          if (data === currentBoard.id) {
            setCurrentBoard(null);
            setBoards(prev => prev.filter(b => b.id !== data));
          }
          break;
        case 'listCreated':
        case 'listUpdated':
        case 'listDeleted':
          // Instead of updating immediately, fetch fresh board data
          fetchBoard(currentBoard.id).catch(console.error);
          break;
      }
    };

    // Set up event listener
    socketService.onBoardEvent(currentBoard.id, handleBoardEvent);

    // Cleanup function
    return () => {
      console.log(`Cleaning up socket listeners for board: ${currentBoard.id}`);
      socketService.leaveBoard(currentBoard.id);
      socketService.offBoardEvent(currentBoard.id, handleBoardEvent);
    };
  }, [currentBoard?.id, fetchBoard]);

  const loadBoards = async () => {
    try {
      console.log('Loading boards...');
      const data = await getBoards();
      console.log('Boards loaded from API:', data);
      if (Array.isArray(data)) {
        setBoards(data);
        if (currentBoard) {
          const updatedCurrentBoard = data.find(board => board.id === currentBoard.id);
          if (updatedCurrentBoard) {
            setCurrentBoard(updatedCurrentBoard);
          }
        }
      } else {
        console.error('Invalid boards data received:', data);
        setBoards([]);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      setBoards([]);
    }
  };

  const handleDeleteBoard = async (boardId: string): Promise<void> => {
    try {
      await apiDeleteBoard(boardId);
      setBoards(prev => prev.filter(board => board.id !== boardId));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  };

  const handleUpdateBoard = async (board: Board): Promise<void> => {
    try {
      const result = await apiUpdateBoard(board.id, board);
      setBoards(prev => prev.map(b => 
        b.id === board.id ? result : b
      ));
      if (currentBoard?.id === board.id) {
        setCurrentBoard(result);
      }
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  };

  const handleAddList = useCallback(async (boardId: string, title: string) => {
    try {
      if (!boardId || !title.trim()) {
        throw new Error('Board ID and title are required');
      }

      // The API call will handle emitting the socket event
      const newList = await apiCreateList(boardId, { title });

      if (currentBoard?.id === boardId) {
        setCurrentBoard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lists: [...(prev.lists || []), newList]
          };
        });
      }
    } catch (error) {
      console.error('Error adding list:', error);
      throw error;
    }
  }, [currentBoard?.id]);

  const handleUpdateList = async (listId: string, updates: Partial<List>): Promise<void> => {
    try {
      const updatedList = await apiUpdateList(listId, updates);
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.map(list => 
          list.id === listId ? updatedList : list
        )
      })));
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  };

  const handleDeleteList = async (listId: string): Promise<void> => {
    try {
      await apiDeleteList(listId);
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.filter(list => list.id !== listId)
      })));
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };

  const handleAddCard = async (listId: string, title: string): Promise<void> => {
    try {
      const newCard = await apiCreateCard(listId, { title });
      
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.map(list =>
          list.id === listId
            ? { ...list, cards: [...list.cards, newCard] }
            : list
        )
      })));

      if (currentBoard) {
        setCurrentBoard({
          ...currentBoard,
          lists: currentBoard.lists.map(list =>
            list.id === listId
              ? { ...list, cards: [...list.cards, newCard] }
              : list
          )
        });
      }
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const handleUpdateCard = async (cardId: string, updates: Partial<Card>): Promise<void> => {
    try {
      const updatedCard = await apiUpdateCard(cardId, updates);
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.map(list => ({
          ...list,
          cards: list.cards.map(card => 
            card.id === cardId ? updatedCard : card
          )
        }))
      })));
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const handleDeleteCard = async (cardId: string): Promise<void> => {
    try {
      await apiDeleteCard(cardId);
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.map(list => ({
          ...list,
          cards: list.cards.filter(card => card.id !== cardId)
        }))
      })));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const handleMoveCard = async (cardId: string, sourceListId: string, destListId: string, destIndex: number): Promise<void> => {
    try {
      await apiMoveCard(cardId, sourceListId, destListId, destIndex);
      setBoards(prev => prev.map(board => {
        const sourceList = board.lists.find(list => list.id === sourceListId);
        const card = sourceList?.cards.find(c => c.id === cardId);
        
        if (!card) return board;

        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id === sourceListId) {
              return {
                ...list,
                cards: list.cards.filter(c => c.id !== cardId)
              };
            }
            if (list.id === destListId) {
              const newCards = [...list.cards];
              newCards.splice(destIndex, 0, { ...card });
              return {
                ...list,
                cards: newCards
              };
            }
            return list;
          })
        };
      }));
    } catch (error) {
      console.error('Error moving card:', error);
      throw error;
    }
  };

  const handleCreateBoard = async (title: string, background: string): Promise<string> => {
    try {
      const newBoard = await apiCreateBoard({ title, background });
      setBoards(prev => [...prev, newBoard]);
      setCurrentBoard(newBoard);
      return newBoard.id;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  };

  // Memoize the context value
  const contextValue = useMemo(() => ({
    boards,
    currentBoard,
    createBoard: handleCreateBoard,
    deleteBoard: handleDeleteBoard,
    setCurrentBoard: setCurrentBoardSafely,
    updateBoard: handleUpdateBoard,
    addList: handleAddList,
    updateList: handleUpdateList,
    deleteList: handleDeleteList,
    addCard: handleAddCard,
    updateCard: handleUpdateCard,
    deleteCard: handleDeleteCard,
    moveCard: handleMoveCard,
    fetchBoard
  }), [
    boards,
    currentBoard,
    handleCreateBoard,
    handleDeleteBoard,
    setCurrentBoardSafely,
    handleUpdateBoard,
    handleAddList,
    handleUpdateList,
    handleDeleteList,
    handleAddCard,
    handleUpdateCard,
    handleDeleteCard,
    handleMoveCard,
    fetchBoard
  ]);

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};