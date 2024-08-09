import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Tabs.css';
import { Constants } from '../../shared/constants';
// import Popup from 'reactjs-popup';

const socket = io(`${Constants.BACKEND_HOST_URL}/chat`, {
  transports: ['websocket']
});

interface Tab {
  id: number;
  title: string;
  content: string;
}

const Tabs: React.FC = () => {
  const [channels, setChannels] = useState<Tab[]>([]);
  const [dms, setDms] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number>(0);
  const [activeType, setActiveType] = useState<'channel' | 'dm'>('channel');
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newDmName, setNewDmName] = useState<string>('');
  const [messages, setMessages] = useState<{ channel: string, message: string, username: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [username, setUsername] = useState<string>('User');

  useEffect(() => {
    socket.on('channelCreated', ({ channel }: { channel: string }) => {
      const newId = channels.length ? channels[channels.length - 1].id + 1 : 1;
      setChannels(prevChannels => [...prevChannels, { id: newId, title: channel, content: `Content of ${channel}` }]);
      setActiveTabId(newId);
      setActiveType('channel');
    });

    socket.on('channelJoined', ({ channel }: { channel: string }) => {
      const newId = channels.length ? channels[channels.length - 1].id + 1 : 1;
      setChannels(prevChannels => [...prevChannels, { id: newId, title: channel, content: `Content of ${channel}` }]);
      setActiveTabId(newId);
      setActiveType('channel');
    });

    socket.on('dmCreated', ({ dm }: { dm: string }) => {
      const newId = dms.length ? dms[dms.length - 1].id + 1 : 101;
      setDms(prevDms => [...prevDms, { id: newId, title: dm, content: `Content of ${dm}` }]);
      setActiveTabId(newId);
      setActiveType('dm');
    });

    socket.on('dmJoined', ({ dm }: { dm: string }) => {
      const newId = dms.length ? dms[dms.length - 1].id + 1 : 101;
      setDms(prevDms => [...prevDms, { id: newId, title: dm, content: `Content of ${dm}` }]);
      setActiveTabId(newId);
      setActiveType('dm');
    });

    socket.on('channelError', ({ message }: { message: string }) => {
      alert(message);
    });

    socket.on('message', ({ channel, message, username }: { channel: string, message: string, username: string }) => {
      setMessages(prevMessages => [...prevMessages, { channel, message, username }]);
    });

    return () => {
      socket.off('channelCreated');
      socket.off('channelJoined');
      socket.off('dmCreated');
      socket.off('dmJoined');
      socket.off('channelError');
      socket.off('message');
    };
  }, [channels, dms]);

  const joinChannel = () => {
    if (!newChannelName.trim()) return;
    socket.emit('joinChannel', { channel: '#' + newChannelName });
    setNewChannelName('');
  };

  const joinDM = () => {
    if (!newDmName.trim()) return;
    socket.emit('joinDM', { user: username, targetUser: newDmName})
    setNewDmName('');
  }

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    const activeTab = channels.find(channel => channel.id === activeTabId) || dms.find(dm => dm.id === activeTabId);
    if (activeTab) {
      socket.emit('sendMessage', { channel: activeTab.title, message: currentMessage, username });
      setCurrentMessage('');
    }
  };

  const deleteTab = (id: number, type: 'channel' | 'dm', title: string) => {
    if (type === 'channel') {
      socket.emit('leaveChannel', { channel: title })
      const newChannels = channels.filter(channel => channel.id !== id);
      setChannels(newChannels);
      if (activeTabId === id && newChannels.length) {
        setActiveTabId(newChannels[0].id);
        setActiveType('channel');
      } else if (!newChannels.length && dms.length) {
        setActiveTabId(dms[0].id);
        setActiveType('dm');
      } else if (!newChannels.length) {
        setActiveTabId(0);
      }
    } else {
      socket.emit('leaveDM', { dm: title })
      const newDms = dms.filter(dm => dm.id !== id);
      setDms(newDms);
      if (activeTabId === id && newDms.length) {
        setActiveTabId(newDms[0].id);
        setActiveType('dm');
      } else if (!newDms.length && channels.length) {
        setActiveTabId(channels[0].id);
        setActiveType('channel');
      } else if (!newDms.length) {
        setActiveTabId(0);
      }
    }
  };

  return (
    <div className="Tabs">
      <div className="username">
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
        />
      </div>
      <div className="tab-container">
        <div className="tab-sections">
          <div className="tab-section">
            <div className="tab-header">Channels</div>
            <div className="tab-buttons">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  className={`tab-button ${channel.id === activeTabId && activeType === 'channel' ? 'active' : ''}`}
                  onClick={() => { setActiveTabId(channel.id); setActiveType('channel'); }}
                >
                  {channel.title}
                  <span className="close-button" onClick={(e) => { e.stopPropagation(); deleteTab(channel.id, 'channel', channel.title); }}>×</span>
                </button>
              ))}
            </div>
            <div className="add-tab-form">
              <input 
                type="text" 
                value={newChannelName} 
                onChange={(e) => setNewChannelName(e.target.value)} 
                placeholder="New channel name" 
              />
              <button className="add-tab-button" onClick={joinChannel}>+</button>
            </div>
          </div>
          <div className="tab-section">
            <div className="tab-header">DMs</div>
            <div className="tab-buttons">
              {dms.map(dm => (
                <button
                  key={dm.id}
                  className={`tab-button ${dm.id === activeTabId && activeType === 'dm' ? 'active' : ''}`}
                  onClick={() => { setActiveTabId(dm.id); setActiveType('dm'); }}
                >
                  {dm.title}
                  <span className="close-button" onClick={(e) => { e.stopPropagation(); deleteTab(dm.id, 'dm', dm.title); }}>×</span>
                </button>
              ))}
            </div>
            <div className="add-tab-form">
              <input 
                type="text" 
                value={newDmName} 
                onChange={(e) => setNewDmName(e.target.value)} 
                placeholder="New DM name" 
              />
              <button className="add-tab-button" onClick={() => joinDM}>+</button>
            </div>
          </div>
        </div>
        <div className="tab-content">
          {channels.map(channel => (
            channel.id === activeTabId && <div key={channel.id}>{channel.content}</div>
          ))}
          {dms.map(dm => (
            dm.id === activeTabId && <div key={dm.id}>{dm.content}</div>
          ))}
          <div className="chat-container">
            <div className="messages">
              {messages.filter(msg => {
                const activeTab = channels.find(channel => channel.id === activeTabId) || dms.find(dm => dm.id === activeTabId);
                return activeTab && msg.channel === activeTab.title;
              }).map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
              ))}
            </div>
          </div>
        </div>
        <div className="message-input">
          <input 
            type="text" 
            value={currentMessage} 
            onChange={(e) => setCurrentMessage(e.target.value)} 
            placeholder="Type a message" 
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Tabs;
