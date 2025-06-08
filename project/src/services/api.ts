import axios from 'axios';
import type { Board, Card, List, User, Label, ChecklistItem, Comment, Attachment, Activity, BoardMember } from '../types';

// API Response Types
type ApiUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
};

type ApiLabel = {
  id: string;
  name: string;
  color: string;
};

type ApiComment = {
  id: string;
  text: string;
  user: ApiUser;
  createdAt: string;
};

type ApiAttachment = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type ApiChecklistItem = {
  id: string;
  text: string;
  isCompleted: boolean;
};

type ApiCard = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  position: number;
  listId: string;
  list?: string;
  members: ApiUser[];
  labels: ApiLabel[];
  dueDate?: string;
  checklist: ApiChecklistItem[];
  comments: ApiComment[];
  attachments: ApiAttachment[];
};

type ApiList = {
  _id?: string;
  id?: string;
  title: string;
  position: number;
  boardId: string;
  cards: ApiCard[];
};

type ApiActivity = {
  id: string;
  text: string;
  date: string;
  user: ApiUser;
};

type ApiBoardMember = {
  user: ApiUser;
  role: 'admin' | 'member';
};

type ApiBoard = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  background: string;
  visibility: 'private' | 'public';
  isStarred: boolean;
  position: number;
  lists: ApiList[];
  members: ApiBoardMember[];
  owner: ApiUser;
  activity: ApiActivity[];
  createdAt: string;
  updatedAt: string;
};

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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication required. Please log in.'));
    }
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

// Transform API types to frontend types
const transformUser = (apiUser: ApiUser): User => {
  if (!apiUser) {
    console.error('Invalid user data received:', apiUser);
    return {
      id: 'unknown',
      name: 'Unknown User',
      email: 'unknown@example.com',
      avatar: undefined
    };
  }
  return {
    id: apiUser._id?.toString() || apiUser.id?.toString() || 'unknown',
    name: apiUser.name || 'Unknown User',
    email: apiUser.email || 'unknown@example.com',
    avatar: apiUser.avatar
  };
};

const transformLabel = (apiLabel: ApiLabel): Label => ({
  id: apiLabel.id,
  name: apiLabel.name,
  color: apiLabel.color
});

const transformChecklistItem = (apiItem: ApiChecklistItem): ChecklistItem => ({
  id: apiItem.id,
  text: apiItem.text,
  isCompleted: apiItem.isCompleted
});

const transformComment = (apiComment: ApiComment): Comment => ({
  id: apiComment.id,
  text: apiComment.text,
  user: transformUser(apiComment.user),
  createdAt: apiComment.createdAt
});

const transformAttachment = (apiAttachment: ApiAttachment): Attachment => ({
  id: apiAttachment.id,
  name: apiAttachment.name,
  url: apiAttachment.url,
  type: apiAttachment.type
});

const transformCard = (apiCard: ApiCard): Card => ({
  id: apiCard._id?.toString() || apiCard.id?.toString() || 'unknown',
  title: apiCard.title || 'Untitled Card',
  description: apiCard.description || '',
  position: Number(apiCard.position) || 0,
  listId: apiCard.listId || apiCard.list?.toString() || '',
  members: Array.isArray(apiCard.members) ? apiCard.members.map(transformUser) : [],
  labels: Array.isArray(apiCard.labels) ? apiCard.labels.map(label => label.id) : [],
  dueDate: apiCard.dueDate,
  checklist: Array.isArray(apiCard.checklist) ? apiCard.checklist.map(transformChecklistItem) : [],
  comments: Array.isArray(apiCard.comments) ? apiCard.comments.map(transformComment) : [],
  attachments: Array.isArray(apiCard.attachments) ? apiCard.attachments.map(attachment => attachment.url) : []
});

const transformList = (apiList: any): List => ({
  id: apiList._id?.toString() || apiList.id?.toString() || 'unknown',
  title: apiList.title || 'Untitled List',
  position: Number(apiList.position) || 0,
  boardId: apiList.board?._id?.toString() || apiList.boardId?.toString() || '',
  cards: (apiList.cards || []).map(transformCard)
});

const transformActivity = (apiActivity: ApiActivity): Activity => ({
  id: apiActivity.id,
  text: apiActivity.text,
  date: apiActivity.date,
  user: transformUser(apiActivity.user)
});

const transformBoardMember = (apiMember: any): BoardMember => {
  if (!apiMember) {
    console.error('Invalid board member data received:', apiMember);
    return {
      user: transformUser({
        name: 'Unknown User',
        email: 'unknown@example.com'
      }),
      role: 'member'
    };
  }

  // Handle flat member format (where user fields are directly on the member object)
  if (apiMember.name && apiMember.email) {
    return {
      user: transformUser({
        id: apiMember.id,
        name: apiMember.name,
        email: apiMember.email,
        avatar: apiMember.avatar
      }),
      role: apiMember.role || 'member'
    };
  }

  // Handle nested user format
  if (apiMember.user) {
    return {
      user: transformUser(apiMember.user),
      role: apiMember.role || 'member'
    };
  }

  // Fallback for unknown format
  console.error('Unknown member format:', apiMember);
  return {
    user: transformUser({
      name: 'Unknown User',
      email: 'unknown@example.com'
    }),
    role: 'member'
  };
};

const transformBoard = (apiBoard: ApiBoard): Board => {
  console.log('Transforming board data:', apiBoard);
  
  if (!apiBoard) {
    console.error('Invalid board data received');
    throw new Error('Invalid board data received');
  }

  try {
    // Create a base board with required fields and safe defaults
    const board: Board = {
      id: apiBoard._id?.toString() || apiBoard.id?.toString() || 'unknown',
      title: apiBoard.title || 'Untitled Board',
      description: apiBoard.description || '',
      background: apiBoard.background || '#026AA7',
      visibility: apiBoard.visibility || 'private',
      isStarred: !!apiBoard.isStarred,
      position: Number(apiBoard.position) || 0,
      lists: [],
      members: [],
      owner: transformUser(apiBoard.owner || { name: 'Unknown', email: 'unknown@example.com' }),
      activity: [],
      createdAt: apiBoard.createdAt || new Date().toISOString(),
      updatedAt: apiBoard.updatedAt || new Date().toISOString()
    };

    // Safely transform arrays with null checks
    if (Array.isArray(apiBoard.lists)) {
      board.lists = apiBoard.lists.map(list => transformList(list)).filter(Boolean);
    }

    if (Array.isArray(apiBoard.members)) {
      board.members = apiBoard.members.map(member => transformBoardMember(member)).filter(Boolean);
    }

    if (Array.isArray(apiBoard.activity)) {
      board.activity = apiBoard.activity.map(activity => transformActivity(activity)).filter(Boolean);
    }

    return board;
  } catch (error) {
    console.error('Error transforming board:', error, 'Board data:', apiBoard);
    throw error;
  }
};

// Board API calls
export const createBoard = async (data: { title: string; background: string }): Promise<Board> => {
  const response = await api.post('/boards', {
    ...data,
    position: 65535 // Default to end of list
  });
  return transformBoard(response.data);
};

export const getBoards = async (): Promise<Board[]> => {
  try {
    console.log('API: Fetching boards...');
    const response = await api.get('/boards');
    console.log('API: Raw boards response:', JSON.stringify(response.data, null, 2));

    if (!Array.isArray(response.data)) {
      console.error('API: Invalid boards data received - not an array:', response.data);
      return [];
    }

    // Transform the boards data with safe fallbacks
    const transformedBoards = response.data
      .map((board: ApiBoard): Board | null => {
        try {
          return transformBoard(board);
        } catch (error) {
          console.error('Error transforming board:', error, 'Board data:', board);
          return null;
        }
      })
      .filter((board): board is Board => board !== null);

    console.log('API: Transformed boards:', transformedBoards);
    return transformedBoards;
  } catch (error) {
    console.error('API: Error fetching boards:', error);
    throw error;
  }
};

export const apiGetBoard = async (boardId: string): Promise<Board> => {
  try {
    console.log('API: Fetching board', boardId);
    const response = await api.get(`/boards/${boardId}`);
    console.log('API: Raw board response:', JSON.stringify(response.data, null, 2));
    
    const board = response.data;
    if (!board) {
      throw new Error('No board data received');
    }

    if (!board._id && !board.id) {
      console.error('Invalid board data - missing ID:', board);
      throw new Error('Invalid board data - missing ID');
    }

    return transformBoard(board);
  } catch (error) {
    console.error('API: Error fetching board:', error);
    throw error;
  }
};

export const updateBoard = async (id: string, data: Partial<Board>): Promise<Board> => {
  if (!id || id === 'undefined') {
    throw new Error('Invalid board ID');
  }
  const response = await api.patch(`/boards/${id}`, data);
  return transformBoard(response.data);
};

export const deleteBoard = async (id: string): Promise<void> => {
  if (!id || id === 'undefined') {
    throw new Error('Invalid board ID');
  }
  await api.delete(`/boards/${id}`);
};

// List API calls
export const createList = async (boardId: string, data: { title: string }): Promise<List> => {
  try {
    if (!boardId || boardId === 'undefined') {
      throw new Error('Invalid board ID');
    }
    if (!data.title || !data.title.trim()) {
      throw new Error('List title is required');
    }

    console.log('Creating list:', { boardId, data });
    const response = await api.post(`/boards/${boardId}/lists`, {
      ...data,
      position: 65535 // Default to end of list
    });
    console.log('List created:', response.data);
    
    return transformList(response.data);
  } catch (error: any) {
    console.error('Error creating list:', error);
    throw new Error('Error creating list: ' + (error?.message || 'Unknown error'));
  }
};

export const updateList = async (id: string, data: Partial<List>): Promise<List> => {
  const response = await api.patch(`/lists/${id}`, data);
  return transformList(response.data);
};

export const deleteList = async (id: string): Promise<void> => {
  await api.delete(`/lists/${id}`);
};

// Card API calls
export const apiCreateCard = async (listId: string, data: { title: string }): Promise<Card> => {
  try {
    console.log('API: Creating card for list', listId, 'with data:', data);
    const response = await api.post(`/lists/${listId}/cards`, {
      ...data,
      listId,
      position: 65535 // Default to end of list
    });
    console.log('API: Raw card response:', response.data);
    
    const card = response.data as ApiCard;
    return transformCard(card);
  } catch (error) {
    console.error('API: Error creating card:', error);
    throw error;
  }
};

export const updateCard = async (id: string, data: Partial<Card>): Promise<Card> => {
  const response = await api.patch(`/cards/${id}`, data);
  return transformCard(response.data);
};

export const deleteCard = async (id: string): Promise<void> => {
  await api.delete(`/cards/${id}`);
};

export const moveCard = async (cardId: string, sourceListId: string, destListId: string, destIndex: number): Promise<Card> => {
  const response = await api.post(`/cards/${cardId}/move`, {
    sourceListId,
    destListId,
    position: destIndex * 65535 // Convert index to position
  });
  return transformCard(response.data);
}; 