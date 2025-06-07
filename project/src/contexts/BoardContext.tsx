import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Card {
  id: string;
  title: string;
  description?: string;
  labels: string[];
  members: string[];
  dueDate?: string;
  checklist: { id: string; text: string; completed: boolean }[];
  comments: { id: string; text: string; author: string; date: string }[];
  attachments: string[];
  cover?: string;
}

interface List {
  id: string;
  title: string;
  cards: Card[];
  boardId: string;
}

interface Board {
  id: string;
  title: string;
  background: string;
  visibility: 'private' | 'team' | 'public';
  members: string[];
  lists: List[];
  activity: { id: string; text: string; date: string; user: string }[];
}

interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  createBoard: (title: string, background: string) => string;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (board: Board | null) => void;
  updateBoard: (board: Board) => void;
  addList: (boardId: string, title: string) => void;
  updateList: (listId: string, updates: Partial<List>) => void;
  deleteList: (listId: string) => void;
  addCard: (listId: string, title: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, sourceListId: string, destListId: string, destIndex: number) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

const defaultBoards: Board[] = [
  {
    id: '1',
    title: 'Project Management',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    visibility: 'private',
    members: ['1'],
    lists: [
      {
        id: '1',
        title: 'To Do',
        boardId: '1',
        cards: [
          {
            id: '1',
            title: 'Design landing page',
            description: 'Create a beautiful landing page for our product',
            labels: ['design', 'high-priority'],
            members: ['1'],
            dueDate: '2024-01-15',
            checklist: [
              { id: '1', text: 'Create wireframes', completed: true },
              { id: '2', text: 'Design mockups', completed: false }
            ],
            comments: [],
            attachments: []
          }
        ]
      },
      {
        id: '2',
        title: 'In Progress',
        boardId: '1',
        cards: [
          {
            id: '2',
            title: 'Implement authentication',
            labels: ['development'],
            members: ['1'],
            checklist: [],
            comments: [],
            attachments: []
          }
        ]
      },
      {
        id: '3',
        title: 'Done',
        boardId: '1',
        cards: []
      }
    ],
    activity: []
  }
];

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);

  useEffect(() => {
    const savedBoards = localStorage.getItem('trello-boards');
    if (savedBoards) {
      setBoards(JSON.parse(savedBoards));
    } else {
      setBoards(defaultBoards);
      localStorage.setItem('trello-boards', JSON.stringify(defaultBoards));
    }
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem('trello-boards', JSON.stringify(boards));
    }
  }, [boards]);

  const createBoard = (title: string, background: string): string => {
    const newBoard: Board = {
      id: Date.now().toString(),
      title,
      background,
      visibility: 'private',
      members: ['1'],
      lists: [],
      activity: []
    };

    setBoards(prev => [...prev, newBoard]);
    return newBoard.id;
  };

  const deleteBoard = (boardId: string) => {
    setBoards(prev => prev.filter(board => board.id !== boardId));
    if (currentBoard?.id === boardId) {
      setCurrentBoard(null);
    }
  };

  const updateBoard = (updatedBoard: Board) => {
    setBoards(prev => prev.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ));
    if (currentBoard?.id === updatedBoard.id) {
      setCurrentBoard(updatedBoard);
    }
  };

  const addList = (boardId: string, title: string) => {
    const newList: List = {
      id: Date.now().toString(),
      title,
      cards: [],
      boardId
    };

    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, lists: [...board.lists, newList] }
        : board
    ));
  };

  const updateList = (listId: string, updates: Partial<List>) => {
    setBoards(prev => prev.map(board => ({
      ...board,
      lists: board.lists.map(list => 
        list.id === listId ? { ...list, ...updates } : list
      )
    })));
  };

  const deleteList = (listId: string) => {
    setBoards(prev => prev.map(board => ({
      ...board,
      lists: board.lists.filter(list => list.id !== listId)
    })));
  };

  const addCard = (listId: string, title: string) => {
    const newCard: Card = {
      id: Date.now().toString(),
      title,
      labels: [],
      members: [],
      checklist: [],
      comments: [],
      attachments: []
    };

    setBoards(prev => prev.map(board => ({
      ...board,
      lists: board.lists.map(list => 
        list.id === listId 
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    })));
  };

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    setBoards(prev => prev.map(board => ({
      ...board,
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      }))
    })));
  };

  const deleteCard = (cardId: string) => {
    setBoards(prev => prev.map(board => ({
      ...board,
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards.filter(card => card.id !== cardId)
      }))
    })));
  };

  const moveCard = (cardId: string, sourceListId: string, destListId: string, destIndex: number) => {
    setBoards(prev => prev.map(board => {
      const sourceList = board.lists.find(list => list.id === sourceListId);
      const destList = board.lists.find(list => list.id === destListId);
      const card = sourceList?.cards.find(card => card.id === cardId);

      if (!card || !sourceList || !destList) return board;

      const newSourceCards = sourceList.cards.filter(c => c.id !== cardId);
      const newDestCards = [...destList.cards];
      newDestCards.splice(destIndex, 0, card);

      return {
        ...board,
        lists: board.lists.map(list => {
          if (list.id === sourceListId) {
            return { ...list, cards: newSourceCards };
          }
          if (list.id === destListId) {
            return { ...list, cards: newDestCards };
          }
          return list;
        })
      };
    }));
  };

  return (
    <BoardContext.Provider value={{
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
      moveCard
    }}>
      {children}
    </BoardContext.Provider>
  );
};