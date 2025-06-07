import React, { useState } from 'react';
import socketService from '../services/socket.service';

const CardModal = ({ card, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [comment, setComment] = useState('');

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSave = () => {
    onUpdate({
      title,
      description
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      socketService.addComment({
        boardId: card.board,
        cardId: card._id,
        text: comment
      });
      setComment('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="card-title-input"
          />
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3>Description</h3>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Add a more detailed description..."
              className="description-input"
            />
          </div>

          <div className="section">
            <h3>Comments</h3>
            <div className="comments-list">
              {card.comments && card.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      className="comment-avatar"
                    />
                    <span className="comment-author">{comment.user.username}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="add-comment">
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="Write a comment..."
                className="comment-input"
              />
              <button
                className="add-comment-button"
                onClick={handleAddComment}
                disabled={!comment.trim()}
              >
                Add Comment
              </button>
            </div>
          </div>

          {card.attachments && card.attachments.length > 0 && (
            <div className="section">
              <h3>Attachments</h3>
              <div className="attachments-list">
                {card.attachments.map((attachment, index) => (
                  <div key={index} className="attachment">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      <i className="fas fa-paperclip"></i>
                      {attachment.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="delete-button" onClick={handleDelete}>
            Delete Card
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal; 