import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, User, CheckSquare, MessageSquare, Paperclip, Eye, Archive, Copy, Move } from 'lucide-react';
import { useBoard } from '../contexts/BoardContext';
import { format } from 'date-fns';

interface CardModalProps {
  cardId: string;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ cardId, onClose }) => {
  const { currentBoard, updateCard, deleteCard } = useBoard();
  const [card, setCard] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    if (currentBoard) {
      const foundCard = currentBoard.lists
        .flatMap(list => list.cards)
        .find(c => c.id === cardId);
      
      if (foundCard) {
        setCard(foundCard);
        setEditTitle(foundCard.title);
        setEditDescription(foundCard.description || '');
      }
    }
  }, [cardId, currentBoard]);

  const handleUpdateTitle = () => {
    if (editTitle.trim() && editTitle !== card.title) {
      updateCard(cardId, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = () => {
    updateCard(cardId, { description: editDescription });
    setIsEditingDescription(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: 'Current User',
        date: new Date().toISOString()
      };
      
      updateCard(cardId, {
        comments: [...(card.comments || []), comment]
      });
      setNewComment('');
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const item = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false
      };
      
      updateCard(cardId, {
        checklist: [...(card.checklist || []), item]
      });
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    const newChecklist = card.checklist.map((item: any) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateCard(cardId, { checklist: newChecklist });
  };

  const handleDeleteCard = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(cardId);
      onClose();
    }
  };

  const handleSetDueDate = () => {
    const date = prompt('Enter due date (YYYY-MM-DD):');
    if (date) {
      updateCard(cardId, { dueDate: date });
    }
  };

  const addLabel = (label: string) => {
    const newLabels = card.labels ? [...card.labels, label] : [label];
    updateCard(cardId, { labels: newLabels });
  };

  const removeLabel = (labelToRemove: string) => {
    const newLabels = card.labels.filter((label: string) => label !== labelToRemove);
    updateCard(cardId, { labels: newLabels });
  };

  const getLabelColor = (label: string) => {
    const colors: { [key: string]: string } = {
      'high-priority': 'bg-red-500',
      'medium-priority': 'bg-yellow-500',
      'low-priority': 'bg-green-500',
      'design': 'bg-purple-500',
      'development': 'bg-blue-500',
      'bug': 'bg-red-600',
      'feature': 'bg-green-600',
    };
    return colors[label] || 'bg-gray-500';
  };

  if (!card) {
    return null;
  }

  const completedItems = card.checklist?.filter((item: any) => item.completed).length || 0;
  const totalItems = card.checklist?.length || 0;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mt-8 mb-8">
        {/* Card Cover */}
        {card.cover && (
          <div 
            className="w-full h-32 rounded-t-lg"
            style={{ background: card.cover }}
          ></div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  className="text-xl font-semibold w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -ml-2"
                >
                  {card.title}
                </h2>
              )}
              
              <p className="text-sm text-gray-600 mt-1">
                in list <span className="font-medium">To Do</span>
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Labels</h3>
                <div className="flex flex-wrap gap-1">
                  {card.labels.map((label: string, idx: number) => (
                    <span
                      key={idx}
                      onClick={() => removeLabel(label)}
                      className={`${getLabelColor(label)} text-white text-sm px-3 py-1 rounded cursor-pointer hover:opacity-80`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            {card.dueDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Due Date</h3>
                <div className="bg-gray-100 px-3 py-2 rounded inline-block">
                  <span className="text-sm text-gray-700">
                    {format(new Date(card.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  Edit
                </button>
              </div>
              
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add a more detailed description..."
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={handleUpdateDescription}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingDescription(false)}
                      className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !card.description && setIsEditingDescription(true)}
                  className={`text-sm ${
                    card.description 
                      ? 'text-gray-700' 
                      : 'text-gray-500 cursor-pointer hover:bg-gray-50 py-2 px-3 rounded'
                  }`}
                >
                  {card.description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Checklist</h3>
                {totalItems > 0 && (
                  <span className="text-xs text-gray-500">
                    {completedItems}/{totalItems} completed
                  </span>
                )}
              </div>
              
              {totalItems > 0 && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-3">
                {card.checklist?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm flex-1 ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="Add an item"
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddChecklistItem}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Activity</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    CU
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    {newComment && (
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={handleAddComment}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setNewComment('')}
                          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {card.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {comment.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.date), 'MMM d at h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-48 p-6 border-l border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add to card</h3>
            
            <div className="space-y-2 mb-6">
              <button
                onClick={() => addLabel('high-priority')}
                className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors"
              >
                <Tag className="h-4 w-4" />
                <span>Labels</span>
              </button>
              
              <button
                onClick={handleSetDueDate}
                className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Due date</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors">
                <User className="h-4 w-4" />
                <span>Members</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors">
                <CheckSquare className="h-4 w-4" />
                <span>Checklist</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors">
                <Paperclip className="h-4 w-4" />
                <span>Attachment</span>
              </button>
            </div>

            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
            
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors">
                <Move className="h-4 w-4" />
                <span>Move</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors">
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded px-2 py-2 transition-colors">
                <Archive className="h-4 w-4" />
                <span>Archive</span>
              </button>
              
              <button
                onClick={handleDeleteCard}
                className="w-full flex items-center space-x-2 text-left text-sm text-red-600 hover:bg-red-50 rounded px-2 py-2 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;