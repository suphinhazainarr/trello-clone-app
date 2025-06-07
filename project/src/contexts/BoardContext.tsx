import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  createBoard as apiCreateBoard, 
  getBoards, 
  updateBoard as apiUpdateBoard, 
  deleteBoard as apiDeleteBoard,
  createList as apiCreateList,
  updateList as apiUpdateList,
  deleteList as apiDeleteList,
  createCard as apiCreateCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  moveCard as apiMoveCard,
  getBoard as apiGetBoard
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

  useEffect(() => {
    console.log('Current boards state:', boards);
  }, [boards]);

  useEffect(() => {
    if (token) {
      console.log('Token found, loading boards...');
      loadBoards();
      socketService.connect();
    } else {
      console.log('No token found, skipping board load');
    }
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (currentBoard) {
      socketService.joinBoard(currentBoard.id);
      
      const handleBoardEvent = (event: string, data: any) => {
        switch (event) {
          case 'updated':
            setCurrentBoard(data);
            setBoards(prev => prev.map(b => b.id === data.id ? data : b));
            break;
          case 'deleted':
            if (data === currentBoard.id) {
              setCurrentBoard(null);
              setBoards(prev => prev.filter(b => b.id !== data));
            }
            break;
          case 'listCreated':
            if (currentBoard.id === data.boardId) {
              setCurrentBoard(prev => prev ? {
                ...prev,
                lists: [...prev.lists, data]
              } : null);
            }
            break;
          case 'listUpdated':
            if (currentBoard.id === data.boardId) {
              setCurrentBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.map(l => l.id === data.id ? data : l)
              } : null);
            }
            break;
          case 'listDeleted':
            if (currentBoard.id === data.boardId) {
              setCurrentBoard(prev => prev ? {
                ...prev,
                lists: prev.lists.filter(l => l.id !== data)
              } : null);
            }
            break;
          // Add more cases for other events as needed
        }
      };

      socketService.onBoardEvent(currentBoard.id, handleBoardEvent);
      return () => {
        socketService.leaveBoard(currentBoard.id);
        socketService.offBoardEvent(currentBoard.id, handleBoardEvent);
      };
    }
  }, [currentBoard]);

  const loadBoards = async () => {
    try {
      console.log('Loading boards...');
      const data = await getBoards();
      console.log('Boards loaded from API:', data);
      setBoards(data);
      if (currentBoard) {
        const updatedCurrentBoard = data.find((board: { id: string; }) => board.id === currentBoard.id);
        if (updatedCurrentBoard) {
          setCurrentBoard(updatedCurrentBoard);
        }
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const fetchBoard = async (boardId: string): Promise<Board> => {
    try {
      if (!boardId || boardId === 'undefined') {
        throw new Error('Board ID is missing or invalid');
      }

      // First try to find the board in the local state
      let board: Board | undefined = boards.find((b: Board) => b && b.id === boardId);
      
      // If not found locally or if the board data is invalid, fetch from API
      if (!board || !board.id || board.id === 'undefined') {
        try {
          const fetchedBoard = await apiGetBoard(boardId);
          if (!fetchedBoard || !fetchedBoard.id) {
            throw new Error('Invalid board data received from server');
          }
          // Add to local state if not already present
          setBoards(prev => {
            const exists = prev.some(b => b.id === fetchedBoard.id);
            return exists ? prev : [...prev, fetchedBoard];
          });
          board = fetchedBoard;
        } catch (error) {
          console.error('Error fetching board from API:', error);
          throw error;
        }
      }
      
      if (!board || !board.id) {
        throw new Error('Board not found');
      }
      
      setCurrentBoard(board);
      return board;
    } catch (error) {
      console.error('Error fetching board:', error);
      setCurrentBoard(null);
      throw error;
    }
  };

  const createBoard = async (title: string, background: string): Promise<string> => {
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

  const deleteBoard = async (boardId: string): Promise<void> => {
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

  const updateBoard = async (updatedBoard: Board): Promise<void> => {
    try {
      const result = await apiUpdateBoard(updatedBoard.id, updatedBoard);
      setBoards(prev => prev.map(board => 
        board.id === updatedBoard.id ? result : board
      ));
      if (currentBoard?.id === updatedBoard.id) {
        setCurrentBoard(result);
      }
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  };

  const addList = async (boardId: string, title: string): Promise<void> => {
    try {
      const newList = await apiCreateList(boardId, { title });
      setBoards(prev => prev.map(board => 
        board.id === boardId 
          ? { ...board, lists: [...board.lists, newList] }
          : board
      ));
    } catch (error) {
      console.error('Error adding list:', error);
      throw error;
    }
  };

  const updateList = async (listId: string, updates: Partial<List>): Promise<void> => {
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

  const deleteList = async (listId: string): Promise<void> => {
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

  const addCard = async (listId: string, title: string): Promise<void> => {
    try {
      if (!listId || listId === 'undefined') {
        throw new Error('Invalid list ID');
      }
      if (!title || !title.trim()) {
        throw new Error('Card title is required');
      }

      // Verify the list exists in the current board
      const listExists = currentBoard?.lists.some(list => list.id === listId);
      if (!listExists) {
        throw new Error('List not found in current board');
      }

      const newCard = await apiCreateCard(listId, { title: title.trim() });
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.map(list => 
          list.id === listId 
            ? { ...list, cards: [...list.cards, newCard] }
            : list
        )
      })));
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const updateCard = async (cardId: string, updates: Partial<Card>): Promise<void> => {
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

  const deleteCard = async (cardId: string): Promise<void> => {
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

  const moveCard = async (cardId: string, sourceListId: string, destListId: string, destIndex: number): Promise<void> => {
    try {
      await apiMoveCard(cardId, sourceListId, destListId, destIndex);
      setBoards(prev => prev.map(board => ({
        ...board,
        lists: board.lists.map(list => {
          if (list.id === sourceListId) {
            return {
              ...list,
              cards: list.cards.filter(card => card.id !== cardId)
            };
          }
          if (list.id === destListId) {
            const card = board.lists
              .find(l => l.id === sourceListId)
              ?.cards.find(c => c.id === cardId);
            if (card) {
              const newCards = [...list.cards];
              newCards.splice(destIndex, 0, card);
              return { ...list, cards: newCards };
            }
          }
          return list;
        })
      })));
    } catch (error) {
      console.error('Error moving card:', error);
      throw error;
    }
  };

  const value = {
    boards,
    currentBoard,
    createBoard,
    deleteBoard,
    setCurrentBoard,
    updateBoard,
    addList,
    updateList,
    deleteList,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    fetchBoard
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};