import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import CardModal from './CardModal';

const Card = ({ card, index, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleUpdate = (updates) => {
    onUpdate({
      ...card,
      ...updates
    });
  };

  const handleDelete = () => {
    onDelete(card._id);
  };

  return (
    <>
      <Draggable draggableId={card._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`card ${snapshot.isDragging ? 'dragging' : ''}`}
            onClick={handleClick}
          >
            <div className="card-content">
              <h4>{card.title}</h4>
              {card.description && (
                <p className="card-description">{card.description}</p>
              )}
              {card.labels && card.labels.length > 0 && (
                <div className="card-labels">
                  {card.labels.map((label, index) => (
                    <span
                      key={index}
                      className="label"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.text}
                    </span>
                  ))}
                </div>
              )}
              {card.dueDate && (
                <div className="card-due-date">
                  <i className="far fa-clock"></i>
                  {new Date(card.dueDate).toLocaleDateString()}
                </div>
              )}
              {card.members && card.members.length > 0 && (
                <div className="card-members">
                  {card.members.map((member) => (
                    <img
                      key={member._id}
                      src={member.avatar}
                      alt={member.username}
                      className="member-avatar"
                    />
                  ))}
                </div>
              )}
              {card.attachments && card.attachments.length > 0 && (
                <div className="card-attachments">
                  <i className="fas fa-paperclip"></i>
                  {card.attachments.length}
                </div>
              )}
              {card.comments && card.comments.length > 0 && (
                <div className="card-comments">
                  <i className="far fa-comment"></i>
                  {card.comments.length}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {isModalOpen && (
        <CardModal
          card={card}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default Card; 