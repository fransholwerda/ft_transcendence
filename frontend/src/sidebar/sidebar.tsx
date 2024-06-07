import React from 'react';
import './sidebar.css';

interface SidebarProps {
  messages: { sender: string; text: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ messages }) => {
  return (
    <div style={{ width: '300px', height: '100vh', borderRight: '1px solid #ccc', padding: '10px' }}>
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
