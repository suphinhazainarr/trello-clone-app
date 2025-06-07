import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  boardId?: string;
  cardId?: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: OnlineUser[];
  isConnected: boolean;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
  joinCard: (cardId: string) => void;
  leaveCard: (cardId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // In a real app, this would connect to your Socket.IO server
      // For demo purposes, we'll simulate the connection
      const mockSocket = {
        emit: (event: string, data: any) => {
          console.log('Socket emit:', event, data);
        },
        on: (event: string, callback: Function) => {
          console.log('Socket listening to:', event);
        },
        off: (event: string, callback?: Function) => {
          console.log('Socket off:', event);
        },
        disconnect: () => {
          console.log('Socket disconnected');
        }
      } as any;

      setSocket(mockSocket);
      setIsConnected(true);

      // Simulate some online users
      setOnlineUsers([
        { id: '1', name: 'John Doe', avatar: 'JD' },
        { id: '2', name: 'Jane Smith', avatar: 'JS' },
        { id: '3', name: 'Mike Johnson', avatar: 'MJ' }
      ]);

      return () => {
        mockSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user]);

  const joinBoard = (boardId: string) => {
    if (socket) {
      socket.emit('join-board', { boardId, user });
    }
  };

  const leaveBoard = (boardId: string) => {
    if (socket) {
      socket.emit('leave-board', { boardId, user });
    }
  };

  const joinCard = (cardId: string) => {
    if (socket) {
      socket.emit('join-card', { cardId, user });
    }
  };

  const leaveCard = (cardId: string) => {
    if (socket) {
      socket.emit('leave-card', { cardId, user });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isConnected,
      joinBoard,
      leaveBoard,
      joinCard,
      leaveCard
    }}>
      {children}
    </SocketContext.Provider>
  );
};