// Base types
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type Label = {
  id: string;
  name: string;
  color: string;
};

export type Comment = {
  id: string;
  text: string;
  user: User;
  createdAt: string;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  isCompleted: boolean;
};

// Card types
export type Card = {
  id: string;
  title: string;
  description: string;
  position: number;
  listId: string;
  members: User[];
  labels: string[];
  dueDate?: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: string[];
};

// List types
export type List = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
};

// Board types
export type Activity = {
  id: string;
  text: string;
  date: string;
  user: User;
};

export type BoardMember = {
  user: User;
  role: 'admin' | 'member';
};

export type Board = {
  id: string;
  title: string;
  description: string;
  background: string;
  visibility: 'private' | 'public';
  isStarred: boolean;
  position: number;
  lists: List[];
  members: BoardMember[];
  owner: User;
  activity: Activity[];
  createdAt: string;
  updatedAt: string;
}; 