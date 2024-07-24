import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';
import MessageInput from './MessageInput';
import Messages from './Messages';

const chatSocket = io('http://localhost:3000/chat');

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatSocket.on('message', (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      chatSocket.off('message');
    };
  }, []);

  const sendMessage = (message: string) => {
    if (message.trim().length > 0) {
      chatSocket.emit('message', message);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-box">
        <Messages messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <div className="input-box">
        <MessageInput send={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;
