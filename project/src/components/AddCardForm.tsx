import React, { useState } from 'react';
import { useBoard } from '../contexts/BoardContext';

interface AddCardFormProps {
  listId: string;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ listId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { addCard } = useBoard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setError(null);
      await addCard(listId, title.trim());
      setTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding card:', err);
      setError(err instanceof Error ? err.message : 'Failed to add card');
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full text-left text-gray-600 hover:text-gray-800 mt-2 p-2 rounded hover:bg-gray-200"
      >
        + Add a card
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for this card..."
        className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        rows={3}
        autoFocus
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      <div className="flex space-x-2 mt-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!title.trim()}
        >
          Add Card
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setTitle('');
            setError(null);
          }}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddCardForm; 