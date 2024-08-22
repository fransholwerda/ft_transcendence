import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';
// import { Constants } from '../../shared/constants';
import { User } from '../PageManager';
import ChatUI from './ChatUI.tsx';
// import Popup from 'reactjs-popup';

interface ChatProps {
  user: User;
  socket: Socket;
}

const Chat: React.FC<ChatProps> = ({ user, socket }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update with user validation from backend?
    socket.on('chatJoined', () => {
      setIsConnected(true);
      setLoading(false);
    })

    socket.on('chatError', ({ message }: { message: string }) => {
      alert(message);
    });

    return () => {
      socket.off('chatJoined');
      socket.off('chatError');
    };
  });

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    
    socket.emit('joinChat', { username: user.username });
  };

  return (
    <div className="chat-container-wrapper">
      {!isConnected && (
        <div className="overlay">
          <button onClick={handleConnect} disabled={loading} className="connect-button">
            {loading ? 'Connecting...' : 'Connect to Chat'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
      {isConnected && (
        <ChatUI
          socket={socket}
          user={user}
        />
      )}
    </div>
  );
}

export default Chat;
