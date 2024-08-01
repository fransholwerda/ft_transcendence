import React, { useState } from 'react';
import './Tabs.css';

interface Tab {
  id: number;
  title: string;
  content: string;
}

const Tabs: React.FC = () => {
  const [channels, setChannels] = useState<Tab[]>([
    { id: 1, title: 'Channel 1', content: 'Content of Channel 1' },
  ]);
  const [dms, setDms] = useState<Tab[]>([
    { id: 101, title: 'DM 1', content: 'Content of DM 1' },
  ]);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  const [activeType, setActiveType] = useState<'channel' | 'dm'>('channel');
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newDmName, setNewDmName] = useState<string>('');

  const addChannel = () => {
    if (!newChannelName.trim()) return;
    const newId = channels.length ? channels[channels.length - 1].id + 1 : 1;
    setChannels([...channels, { id: newId, title: newChannelName, content: `Content of ${newChannelName}` }]);
    setActiveTabId(newId);
    setActiveType('channel');
    setNewChannelName('');
  };

  const addDm = () => {
    if (!newDmName.trim()) return;
    const newId = dms.length ? dms[dms.length - 1].id + 1 : 101;
    setDms([...dms, { id: newId, title: newDmName, content: `Content of ${newDmName}` }]);
    setActiveTabId(newId);
    setActiveType('dm');
    setNewDmName('');
  };

  const deleteTab = (id: number, type: 'channel' | 'dm') => {
    if (type === 'channel') {
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

  const handleTabClick = (id: number, type: 'channel' | 'dm') => {
    setActiveTabId(id);
    setActiveType(type);
  };

  return (
    <div className="Tabs">
      <div className="tab-container">
        <div className="tab-sections">
          <div className="tab-section">
            <div className="tab-header">Channels</div>
            <div className="tab-buttons">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  className={`tab-button ${channel.id === activeTabId && activeType === 'channel' ? 'active' : ''}`}
                  onClick={() => handleTabClick(channel.id, 'channel')}
                >
                  {channel.title}
                  <span className="close-button" onClick={(e) => { e.stopPropagation(); deleteTab(channel.id, 'channel'); }}>×</span>
                </button>
              ))}
              <div className="add-tab-form">
                <input 
                  type="text" 
                  value={newChannelName} 
                  onChange={(e) => setNewChannelName(e.target.value)} 
                  placeholder="New channel name" 
                />
                <button className="add-tab-button" onClick={addChannel}>+</button>
              </div>
            </div>
          </div>
          <div className="tab-section">
            <div className="tab-header">DMs</div>
            <div className="tab-buttons">
              {dms.map(dm => (
                <button
                  key={dm.id}
                  className={`tab-button ${dm.id === activeTabId && activeType === 'dm' ? 'active' : ''}`}
                  onClick={() => handleTabClick(dm.id, 'dm')}
                >
                  {dm.title}
                  <span className="close-button" onClick={(e) => { e.stopPropagation(); deleteTab(dm.id, 'dm'); }}>×</span>
                </button>
              ))}
              <div className="add-tab-form">
                <input 
                  type="text" 
                  value={newDmName} 
                  onChange={(e) => setNewDmName(e.target.value)} 
                  placeholder="New DM name" 
                />
                <button className="add-tab-button" onClick={addDm}>+</button>
              </div>
            </div>
          </div>
        </div>
        <div className="tab-content">
          {activeType === 'channel' && channels.map(channel => (
            channel.id === activeTabId && <div key={channel.id}>{channel.content}</div>
          ))}
          {activeType === 'dm' && dms.map(dm => (
            dm.id === activeTabId && <div key={dm.id}>{dm.content}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tabs;
