import axios from 'axios';
import { Board } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trello-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(error.response.data.message || 'Server error');
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      throw new Error('Network error - no response from server');
    } else {
      // Error setting up request
      console.error('Request Error:', error.message);
      throw new Error('Error setting up request');
    }
  }
);

// Board API calls
export const createBoard = async (data: { title: string; background: string }) => {
  const response = await api.post('/boards', data);
  return response.data;
};

export const getBoards = async () => {
  try {
    console.log('Fetching boards from API...');
    const response = await api.get('/boards');
    console.log('API response:', response);
    if (!response.data) {
      console.error('No data received from API');
      return [];
    }
    // Ensure we have valid board data
    const boards = response.data.map((board: any) => ({
      ...board,
      id: board.id || board._id, // Handle both id formats
      lists: board.lists || [],
      members: board.members || [],
      visibility: board.visibility || 'private',
      background: board.background || '#026AA7'
    }));
    console.log('Processed boards:', boards);
    return boards;
  } catch (error) {
    console.error('Error fetching boards:', error);
    return [];
  }
};

export const getBoard = async (boardId: string): Promise<Board> => {
  if (!boardId || boardId === 'undefined') {
    throw new Error('Invalid board ID');
  }
  const response = await api.get(`/boards/${boardId}`);
  if (!response.data) {
    throw new Error('Board not found');
  }
  return response.data;
};

export const updateBoard = async (id: string, data: any) => {
  if (!id || id === 'undefined') {
    throw new Error('Invalid board ID');
  }
  const response = await api.patch(`/boards/${id}`, data);
  return response.data;
};

export const deleteBoard = async (id: string) => {
  if (!id || id === 'undefined') {
    throw new Error('Invalid board ID');
  }
  await api.delete(`/boards/${id}`);
};

// List API calls
export const createList = async (boardId: string, data: { title: string }) => {
  try {
    if (!boardId || boardId === 'undefined') {
      throw new Error('Invalid board ID');
    }
    if (!data.title || !data.title.trim()) {
      throw new Error('List title is required');
    }

    console.log('Creating list:', { boardId, data });
    const response = await api.post(`/boards/${boardId}/lists`, data);
    console.log('List created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating list:', error);
    throw new Error('Error creating list: ' + (error?.message || 'Unknown error'));
  }
};

export const updateList = async (id: string, data: any) => {
  const response = await api.patch(`/lists/${id}`, data);
  return response.data;
};

export const deleteList = async (id: string) => {
  await api.delete(`/lists/${id}`);
};

// Card API calls
export const createCard = async (listId: string, data: { title: string }) => {
  if (!listId || listId === 'undefined') {
    throw new Error('Invalid list ID');
  }
  if (!data.title || !data.title.trim()) {
    throw new Error('Card title is required');
  }
  
  const response = await api.post(`/lists/${listId}/cards`, data);
  return response.data;
};

export const updateCard = async (id: string, data: any) => {
  const response = await api.patch(`/cards/${id}`, data);
  return response.data;
};

export const deleteCard = async (id: string) => {
  await api.delete(`/cards/${id}`);
};

export const moveCard = async (cardId: string, sourceListId: string, destListId: string, destIndex: number) => {
  const response = await api.post(`/cards/${cardId}/move`, {
    sourceListId,
    destListId,
    destIndex
  });
  return response.data;
}; 