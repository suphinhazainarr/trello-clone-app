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

// Board API calls
export const createBoard = async (data: { title: string; background: string }) => {
  const response = await api.post('/boards', data);
  return response.data;
};

export const getBoards = async () => {
  const response = await api.get('/boards');
  return response.data;
};

export const getBoard = async (boardId: string): Promise<Board> => {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
};

export const updateBoard = async (id: string, data: any) => {
  const response = await api.patch(`/boards/${id}`, data);
  return response.data;
};

export const deleteBoard = async (id: string) => {
  await api.delete(`/boards/${id}`);
};

// List API calls
export const createList = async (boardId: string, data: { title: string }) => {
  const response = await api.post(`/boards/${boardId}/lists`, data);
  return response.data;
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