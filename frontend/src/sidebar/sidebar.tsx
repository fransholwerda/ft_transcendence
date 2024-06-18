import React from 'react';
import './sidebar.css';

interface SidebarProps {
  messages: { sender: string; text: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ messages }) => {
  return (
    <div>
      <h2>Chat Messages</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {messages.map((message, index) => (
          <li key={index}>
            <strong>{message.sender}: </strong>
            {message.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
