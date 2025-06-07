export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  labels: string[];
  members: User[];
  dueDate?: string;
  checklist: { id: string; text: string; completed: boolean }[];
  comments: { id: string; text: string; author: User; date: string }[];
  attachments: string[];
  cover?: string;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
  boardId: string;
}

export interface Board {
  id: string;
  title: string;
  background: string;
  visibility: 'private' | 'team' | 'public';
  owner: User;
  members: { user: User; role: 'admin' | 'member' }[];
  lists: List[];
  activity: { id: string; text: string; date: string; user: User }[];
  isStarred?: boolean;
} 