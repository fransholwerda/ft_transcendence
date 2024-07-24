import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const chatSocket = io('http://localhost:3000/chat');

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
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

  const sendMessage = () => {
    if (message.trim().length > 0) {
      chatSocket.emit('message', message);
    }
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="messages-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-box">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
