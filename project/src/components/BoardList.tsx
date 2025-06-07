import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, X } from 'lucide-react';
import { useBoard } from '../contexts/BoardContext';

interface List {
  id: string;
  title: string;
  cards: any[];
  boardId: string;
}

interface BoardListProps {
  list: List;
  onCardClick: (cardId: string) => void;
}

const BoardList: React.FC<BoardListProps> = ({ list, onCardClick }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  
  const { addCard, updateList, deleteList } = useBoard();

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setShowAddCard(false);
    }
  };

  const handleUpdateTitle = () => {
    if (editTitle.trim() && editTitle !== list.title) {
      updateList(list.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = () => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      deleteList(list.id);
    }
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

  return (
    <div className="min-w-72 flex-shrink-0">
      <div className="bg-gray-100 rounded-lg p-3">
        {/* List Header */}
        <div className="flex items-center justify-between mb-3">
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
              className="flex-1 px-2 py-1 text-sm font-medium bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="flex-1 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
            >
              {list.title}
            </h3>
          )}
          
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {list.cards.length}
            </span>
            <button
              onClick={handleDeleteList}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <Droppable droppableId={list.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 min-h-1 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
              }`}
            >
              {list.cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => onCardClick(card.id)}
                      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow border-2 border-transparent ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                      }`}
                    >
                      {/* Card Cover */}
                      {card.cover && (
                        <div 
                          className="w-full h-20 rounded-md mb-3"
                          style={{ background: card.cover }}
                        ></div>
                      )}
                      
                      {/* Card Labels */}
                      {card.labels && card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {card.labels.map((label: string, idx: number) => (
                            <span
                              key={idx}
                              className={`${getLabelColor(label)} text-white text-xs px-2 py-1 rounded-full`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Card Title */}
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {card.title}
                      </h4>
                      
                      {/* Card Description Preview */}
                      {card.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {card.description}
                        </p>
                      )}
                      
                      {/* Card Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Due Date */}
                          {card.dueDate && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {new Date(card.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          
                          {/* Checklist Progress */}
                          {card.checklist && card.checklist.length > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {card.checklist.filter((item: any) => item.completed).length}/{card.checklist.length}
                            </span>
                          )}
                          
                          {/* Comments Count */}
                          {card.comments && card.comments.length > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              💬 {card.comments.length}
                            </span>
                          )}
                        </div>
                        
                        {/* Card Members */}
                        {card.members && card.members.length > 0 && (
                          <div className="flex -space-x-1">
                            {card.members.slice(0, 3).map((memberId: string, idx: number) => (
                              <div
                                key={memberId}
                                className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                              >
                                U{idx + 1}
                              </div>
                            ))}
                            {card.members.length > 3 && (
                              <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                                +{card.members.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Card */}
        <div className="mt-3">
          {showAddCard ? (
            <div className="space-y-2">
              <textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCard();
                  }
                }}
                placeholder="Enter a title for this card..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddCard}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Add card
                </button>
                <button
                  onClick={() => {
                    setShowAddCard(false);
                    setNewCardTitle('');
                  }}
                  className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full text-left text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md p-2 flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add a card</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardList;