import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'due' | 'activity';
  title: string;
  message: string;
  boardId?: string;
  cardId?: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned',
      message: 'John mentioned you in "Design Review"',
      boardId: '1',
      cardId: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      avatar: 'JD'
    },
    {
      id: '2',
      type: 'assignment',
      title: 'New assignment',
      message: 'You were assigned to "Fix login bug"',
      boardId: '1',
      cardId: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      avatar: 'JS'
    },
    {
      id: '3',
      type: 'due',
      title: 'Due reminder',
      message: '"Landing page design" is due tomorrow',
      boardId: '1',
      cardId: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};