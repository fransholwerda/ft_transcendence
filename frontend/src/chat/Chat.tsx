import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';
// import { Constants } from '../../shared/constants';
import { User } from '../PageManager';
import ChatUI from './ChatUI.tsx';
// import Popup from 'reactjs-popup';
import { useNavigate } from 'react-router-dom';

interface ChatProps {
  user: User;
  socket: Socket;
}

interface InvitationData {
  player1SocketID: string;
  player1ID: number;
  player1Username: string;
}

const Chat: React.FC<ChatProps> = ({ user, socket }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);  // For game invite modal
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Update with user validation from backend?
    socket.on('chatJoined', () => {
      setIsConnected(true);
      setLoading(false);
    })

    socket.on('chatAlert', ({ message }: { message: string }) => {
      alert(message);
    });

    socket.on('inviteToGame', ({ player1SocketID, player1ID, player1Username }: InvitationData) => {
      setInvitationData({ player1SocketID, player1ID, player1Username });
      setIsInviteModalOpen(true);
    });

    socket.on('closeInvitationModal', () => {
      setIsInviteModalOpen(false);
    });

    socket.on('profilePage', ({ targetUserID }) => {
      navigate(`/profile/${targetUserID}`);
    });

    return () => {
      socket.off('chatJoined');
      socket.off('chatAlert');
    };
  });

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    
    socket.emit('joinChat', { userId: user.id, username: user.username });
  };

  const handleAcceptInvite = (gameType: number) => {
    if (invitationData) {
      socket.emit('invitedMatch', {
        player1SocketID: invitationData.player1SocketID,
        player1ID: invitationData.player1ID,
        player1Username: invitationData.player1Username,
        player2SocketID: socket.id,
        player2ID: user.id,
        player2Username: user.username,
        gameType: gameType
      });
      // setIsInviteModalOpen(false);
      socket.emit('closeInvitationModal');
    }
  };

  const handleDenyInvite = () => {
    setIsInviteModalOpen(false);
    socket.emit('closeInvitationModal');
    // Additional logic for denying the invite can go here (e.g., notifying the server) !!!
  };

  return (
    <div className="chat-container-wrapper">
      {isInviteModalOpen && invitationData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1>Game Invitation</h1>
            <p>{invitationData.player1Username} <h1>has invited you to play pong. Do you accept?</h1></p>
            <button onClick={() => handleAcceptInvite(1)}><h3>Accept (Normal game)</h3></button>
            <button onClick={() => handleAcceptInvite(2)}><h3>Accept (Speed game)</h3></button>
            <button onClick={handleDenyInvite}><h3>Deny</h3></button>
          </div>
        </div>
      )}

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
