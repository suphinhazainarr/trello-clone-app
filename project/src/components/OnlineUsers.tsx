import React from 'react';
import { Users } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const OnlineUsers: React.FC = () => {
  const { onlineUsers, isConnected } = useSocket();

  if (!isConnected || onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-white">
      <Users className="h-4 w-4" />
      <div className="flex -space-x-1">
        {onlineUsers.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="relative w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium border-2 border-white"
            title={user.name}
          >
            {user.avatar || user.name.charAt(0)}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
      <span className="text-sm">{onlineUsers.length} online</span>
    </div>
  );
};

export default OnlineUsers;