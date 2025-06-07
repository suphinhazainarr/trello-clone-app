import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';
import AddCard from './AddCard';

const List = ({ list, index, onCardCreate, onCardUpdate, onCardDelete }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddCard = (title) => {
    onCardCreate({
      title,
      listId: list._id,
      position: list.cards.length
    });
    setIsAddingCard(false);
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list"
        >
          <div className="list-header" {...provided.dragHandleProps}>
            <h3>{list.title}</h3>
          </div>

          <Droppable droppableId={list._id} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="cards-container"
              >
                {list.cards.map((card, index) => (
                  <Card
                    key={card._id}
                    card={card}
                    index={index}
                    onUpdate={onCardUpdate}
                    onDelete={onCardDelete}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {isAddingCard ? (
            <AddCard
              onAdd={handleAddCard}
              onCancel={() => setIsAddingCard(false)}
            />
          ) : (
            <button
              className="add-card-button"
              onClick={() => setIsAddingCard(true)}
            >
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default List; 