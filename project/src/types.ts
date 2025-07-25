export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Comment {
  id: string;
  text: string;
  user: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Activity {
  id: string;
  text: string;
  date: string;
  user: User;
}

export interface BoardMember {
  user: User;
  role: 'admin' | 'member';
}

export interface Card {
  id: string;
  title: string;
  description: string;
  position: number;
  listId: string;
  labels: string[];
  members: User[];
  dueDate?: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: string[];
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
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
} 