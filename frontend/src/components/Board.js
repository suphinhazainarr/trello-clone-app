import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import socketService from '../services/socket.service';
import List from './List';
import AddList from './AddList';
import BoardHeader from './BoardHeader';
import { useAuth } from '../contexts/AuthContext';
import { getBoard, updateBoard } from '../services/api';

const Board = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect(token);

    // Join board room
    socketService.joinBoard(id);

    // Set up real-time listeners
    socketService.on('card-created', handleCardCreated);
    socketService.on('card-updated', handleCardUpdated);
    socketService.on('card-deleted', handleCardDeleted);
    socketService.on('card-moved', handleCardMoved);
    socketService.on('user-joined', handleUserJoined);
    socketService.on('user-left', handleUserLeft);

    // Load board data
    loadBoard();

    return () => {
      // Clean up
      socketService.leaveBoard(id);
      socketService.removeAllListeners('card-created');
      socketService.removeAllListeners('card-updated');
      socketService.removeAllListeners('card-deleted');
      socketService.removeAllListeners('card-moved');
      socketService.removeAllListeners('user-joined');
      socketService.removeAllListeners('user-left');
      socketService.disconnect();
    };
  }, [id, token]);

  const loadBoard = async () => {
    try {
      const data = await getBoard(id);
      setBoard(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCardCreated = (card) => {
    setBoard(prevBoard => {
      const list = prevBoard.lists.find(l => l._id === card.list);
      if (list) {
        list.cards.push(card);
      }
      return { ...prevBoard };
    });
  };

  const handleCardUpdated = (updatedCard) => {
    setBoard(prevBoard => {
      const list = prevBoard.lists.find(l => l._id === updatedCard.list);
      if (list) {
        const cardIndex = list.cards.findIndex(c => c._id === updatedCard._id);
        if (cardIndex !== -1) {
          list.cards[cardIndex] = updatedCard;
        }
      }
      return { ...prevBoard };
    });
  };

  const handleCardDeleted = ({ cardId }) => {
    setBoard(prevBoard => {
      const newLists = prevBoard.lists.map(list => ({
        ...list,
        cards: list.cards.filter(card => card._id !== cardId)
      }));
      return { ...prevBoard, lists: newLists };
    });
  };

  const handleCardMoved = ({ card, sourceListId, targetListId }) => {
    setBoard(prevBoard => {
      const newLists = prevBoard.lists.map(list => {
        if (list._id === sourceListId) {
          return {
            ...list,
            cards: list.cards.filter(c => c._id !== card._id)
          };
        }
        if (list._id === targetListId) {
          return {
            ...list,
            cards: [...list.cards, card]
          };
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
  };

  const handleUserJoined = ({ userId, username }) => {
    // Handle user joined notification
    console.log(`${username} joined the board`);
  };

  const handleUserLeft = ({ userId, username }) => {
    // Handle user left notification
    console.log(`${username} left the board`);
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceList = board.lists.find(list => list._id === source.droppableId);
    const destList = board.lists.find(list => list._id === destination.droppableId);
    const card = sourceList.cards[source.index];

    // Optimistically update UI
    handleCardMoved({
      card: { ...card, position: destination.index },
      sourceListId: source.droppableId,
      targetListId: destination.droppableId
    });

    // Emit move event
    socketService.moveCard({
      boardId: id,
      cardId: draggableId,
      sourceListId: source.droppableId,
      targetListId: destination.droppableId,
      newPosition: destination.index
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <div className="board" style={{ backgroundColor: board.background }}>
      <BoardHeader board={board} onUpdate={setBoard} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="lists-container">
          {board.lists.map((list, index) => (
            <List
              key={list._id}
              list={list}
              index={index}
              onCardCreate={(card) => socketService.createCard({ ...card, boardId: id })}
              onCardUpdate={(card) => socketService.updateCard({ ...card, boardId: id })}
              onCardDelete={(cardId) => socketService.deleteCard({ boardId: id, cardId })}
            />
          ))}
          <AddList boardId={id} onListAdd={setBoard} />
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board; 