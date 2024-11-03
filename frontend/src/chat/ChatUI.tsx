import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import './ChatUI.css';
import { User } from '../PageManager';
import Popup from 'reactjs-popup';
import { ActionType, ChannelType } from './chat.enum';

interface Tab {
  id: number;
  title: string;
  content: string;
}

interface ChatUIProps {
  socket: Socket;
  user: User;
  ignoreList: string[];
}

const ChatUI: React.FC<ChatUIProps> = ({ socket, user, ignoreList }) => {
  const [channels, setChannels] = useState<Tab[]>([]);
  const [dms, setDms] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number>(0);
  const [activeType, setActiveType] = useState<'channel' | 'dm'>('channel');
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [inviteUser, setInviteUser] = useState<string>('');
  const [channelPassword, setChannelPassword] = useState<string>('');
  const [protectedPassword, setProtectedPassword] = useState<string>('');
  const [newDmName, setNewDmName] = useState<string>('');
  const [messages, setMessages] = useState<{ channel: string, message: string, username: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('channelCreated', ({ channel }: { channel: string }) => {
      const newId = channels.length ? channels[channels.length - 1].id + 1 : 1;
      setChannels(prevChannels => [...prevChannels, { id: newId, title: channel, content: `` }]);
      setActiveTabId(newId);
      setActiveType('channel');
    });

    socket.on('channelJoined', ({ channel }: { channel: string }) => {
      setChannels(prevChannels => {
        const newId = prevChannels.length ? prevChannels[prevChannels.length - 1].id + 1 : 1;
        const updatedChannels = [...prevChannels, { id: newId, title: channel, content: '' }];

        setActiveTabId(newId);
        setActiveType('channel');
        
        return updatedChannels;
      });
    });
    

    socket.on('channelLeft', ({ channel }: { channel: string }) => {
      setChannels(prevChannels => {
        const updatedChannels = prevChannels.filter(c => c.title !== channel);
        
        if (updatedChannels.length) {
          setActiveTabId(updatedChannels[0].id);
          setActiveType('channel');
        } else if (dms.length) {
          setActiveTabId(dms[0].id);
          setActiveType('dm');
        } else {
          setActiveTabId(0);
        }
    
        return updatedChannels;
      });
    
      setMessages(prevMessages => prevMessages.filter(msg => msg.channel !== channel));
    });

    socket.on('dmCreated', ({ dm }: { dm: string }) => {
      const existingDm = dms.find((existing) => existing.title === dm);
    
      if (existingDm) {
        setActiveTabId(existingDm.id);
      } else {
        const newId = dms.length ? dms[dms.length - 1].id + 1 : 101;
        setDms(prevDms => [...prevDms, { id: newId, title: dm, content: `` }]);
        setActiveTabId(newId);
      }
    
      setActiveType('dm');
    });
    

    socket.on('dmJoined', ({ dm }: { dm: string }) => {
      let newId: number | undefined;
      setDms(prevDms => {
        const dmExists = prevDms.some(existingDm => existingDm.title === dm);

        if (dmExists) {
          return prevDms;
        }
        newId = prevDms.length ? prevDms[prevDms.length - 1].id + 1 : 101;
        const newDm = { id: newId, title: dm, content: `` };

        return [...prevDms, newDm];
      });
      if (newId !== undefined) {
        setActiveTabId(newId);
        setActiveType('dm');
      }
    });

    socket.on('message', ({ channel, message, username }: { channel: string, message: string, username: string }) => {
      if (ignoreList.includes(username)) {
        return;
      }
      setMessages(prevMessages => [...prevMessages, { channel, message, username }]);
    });

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    return () => {
      socket.off('channelCreated');
      socket.off('channelJoined');
      socket.off('channelLeft');
      socket.off('dmCreated');
      socket.off('dmJoined');
      socket.off('message');
    };
  }, [channels, dms, ignoreList]);

  const handleKeyDown = (inputType: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputType === 'message') {
        sendMessage();
      } else if (inputType === 'channel') {
        joinChannel();
      } else if (inputType === 'DM') {
        joinDM();
      }
    }
  }

  const joinChannel = () => {
    const validChannelName = /^[a-zA-Z0-9-_]+$/;
    if (!newChannelName.trim()) return;
    if (!validChannelName.test(newChannelName)) {
      alert('Channel name can only contain alphanumeric characters, dashes (-), and underscores (_).');
      return;
    }
    socket.emit('joinChannel', { channel: newChannelName, password: channelPassword });
    setNewChannelName('');
    setChannelPassword('');
  };

  const joinDM = () => {
    if (!newDmName.trim()) return;
    const dmExists = dms.some(dm => dm.title === newDmName.trim());
    if (newDmName.trim() === user.username) {
      alert(`You can't create a DM with yourself.`);
      return;
    } else if (dmExists) {
      alert(`You already have a DM open with this user`);
      return;
    }
    socket.emit('joinDM', { user: user.username, targetUser: newDmName.trim()})
    setNewDmName('');
  }

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    const activeTab = channels.find(channel => channel.id === activeTabId) || dms.find(dm => dm.id === activeTabId);
    if (activeTab) {
      socket.emit('sendMessage', { channel: activeTab.title, message: currentMessage, username: user.username });
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

  const channelInviteUser = (title: string, userInvite: string) => {
    socket.emit('channelInviteUser', { channel: title, userInvite: userInvite });
    setInviteUser('');
  }

  const setChannelType = (title: string, type: number, password: string) => {
    if (password == '') {
      socket.emit ('setChannelType', { channel: title, type: type });
    } else {
    socket.emit ('setChannelType', { channel: title, type: type, password: password });
    }
    setProtectedPassword('');
  }

  const handleUserAction = (action: number, username: string) => {
    const activeTab = channels.find(channel => channel.id === activeTabId) || dms.find(dm => dm.id === activeTabId);
    switch (action) {
      case ActionType.Profile:
        socket.emit('actionUser', { targetUser: username, action: action });
        break;
      case ActionType.AddFriend:
            socket.emit('actionUser', { targetUser: username, action: action });
            break;
      case ActionType.Invite:
        socket.emit('actionUser', { targetUser: username, action: action });
        break;
      case ActionType.Ignore:
        socket.emit('actionUser', { targetUser: username, action: action });
        break;
      default:
        socket.emit('channelActionUser', { channel: activeTab?.title, targetUser: username, action: action });
    }
  };

  return (
    <div className="Chat">
      <div className="chat-container">
        <div className="chat-sections">
          <div className="chat-section">
            <div className="chat-header">Channels</div>
            <div className="chat-buttons">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  className={`chat-button ${channel.id === activeTabId && activeType === 'channel' ? 'active' : ''}`}
                  onClick={() => { setActiveTabId(channel.id); setActiveType('channel'); }}
                >
                  <Popup className='chat-channel-popup' trigger={<span>⚙</span>}>
                    <div className='chat-channel-popup-content'>
                      <span className="close-button" onClick={(e) => { e.stopPropagation(); deleteTab(channel.id, 'channel', channel.title); }}>Close Channel</span>
                      <span className="public-button" onClick={(e) => { e.stopPropagation(); setChannelType(channel.title, ChannelType.Public, ""); }}>Set Public</span>
                      <span className="private-button" onClick={(e) => { e.stopPropagation(); setChannelType(channel.title, ChannelType.Private, ""); }}>Set Private</span>
                      <span className="invite-button" onClick={(e) => { e.stopPropagation(); channelInviteUser(channel.title, inviteUser)}}>Invite user</span>
                      <input
                        type="text"
                        value={inviteUser}
                        onChange={(e) => setInviteUser(e.target.value)}
                        placeholder="Invite user"
                      />
                      <span className="password-button" onClick={(e) => { e.stopPropagation(); setChannelType(channel.title, ChannelType.Protected, protectedPassword); }}>Set Password</span>
                      <input
                        type="password"
                        value={protectedPassword}
                        onChange={(e) => setProtectedPassword(e.target.value)}
                        placeholder="Password"
                      />
                    </div>
                  </Popup>
                  {channel.title}
                </button>
              ))}
            </div>
            <div className="add-channel-form">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => handleKeyDown('channel', e)}
                placeholder="New channel name"
              />
            </div>
            <div className="add-channel-form">
              <input
                type="password"
                value={channelPassword}
                onChange={(e) => setChannelPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown('channel', e)}
                placeholder="Password"
              />
            </div>
          </div>
          <div className="chat-section">
            <div className="chat-header">DMs</div>
            <div className="chat-buttons">
              {dms.map(dm => (
                <button
                  key={dm.id}
                  className={`chat-button ${dm.id === activeTabId && activeType === 'dm' ? 'active' : ''}`}
                  onClick={() => { setActiveTabId(dm.id); setActiveType('dm'); }}
                >
                  <Popup className='chat-channel-popup' trigger={<span>⚙</span>}>
                    <span className="close-button" onClick={(e) => { e.stopPropagation(); deleteTab(dm.id, 'dm', dm.title); }}>Close DM</span>
                    <span className="invite-button" onClick={() => handleUserAction(ActionType.Invite, dm.title.substring(1))}>Invite to Game</span>
                  </Popup>
                  {dm.title}
                </button>
              ))}
            </div>
            <div className="add-dm-form">
              <input
                type="text"
                value={newDmName}
                onChange={(e) => setNewDmName(e.target.value)}
                onKeyDown={(e) => handleKeyDown('DM', e)}
                placeholder="New DM name"
              />
            </div>
          </div>
        </div>
        <div className="chat-content">
          <div className="chat-message-container">
            {channels.map(channel => (
              channel.id === activeTabId && <div key={channel.id}>{channel.content}</div>
            ))}
            {dms.map(dm => (
              dm.id === activeTabId && <div key={dm.id}>{dm.content}</div>
            ))}
            <div className="messages" ref={scrollRef}>
              {messages.filter(msg => {
                const activeTab = channels.find(channel => channel.id === activeTabId) || dms.find(dm => dm.id === activeTabId);
                return activeTab && msg.channel === activeTab.title;
              }).map((msg, index) => (
                <div key={index} className="message">
                  <Popup
                    trigger={<button className="username-button">{msg.username}</button>}
                    position="right center"
                    on="click"
                    closeOnDocumentClick
                    mouseLeaveDelay={300}
                    mouseEnterDelay={0}
                    contentStyle={{ padding: '10px', border: 'none' }}
                    arrow={false}
                  >
                    <div className="user-actions-popup">
                    {msg.username !== user.username ? (
                      <>
                          {activeType === 'channel' ? (
                            <>
                              <button onClick={() => handleUserAction(ActionType.Profile, msg.username)}>Profile</button>
                              <button onClick={() => handleUserAction(ActionType.AddFriend, msg.username)}>Add Friend</button>
                              <button onClick={() => handleUserAction(ActionType.Invite, msg.username)}>Invite</button>
                              <button onClick={() => handleUserAction(ActionType.Ignore, msg.username)}>Ignore</button>
                              <button onClick={() => handleUserAction(ActionType.Kick, msg.username)}>Kick</button>
                              <button onClick={() => handleUserAction(ActionType.Mute, msg.username)}>Mute</button>
                              <button onClick={() => handleUserAction(ActionType.Unmute, msg.username)}>Unmute</button>
                              <button onClick={() => handleUserAction(ActionType.Ban, msg.username)}>Ban</button>
                              <button onClick={() => handleUserAction(ActionType.Promote, msg.username)}>Promote</button>
                              <button onClick={() => handleUserAction(ActionType.Demote, msg.username)}>Demote</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleUserAction(ActionType.Profile, msg.username)}>Profile</button>
                              <button onClick={() => handleUserAction(ActionType.AddFriend, msg.username)}>Add Friend</button>
                              <button onClick={() => handleUserAction(ActionType.Invite, msg.username)}>Invite</button>
                              <button onClick={() => handleUserAction(ActionType.Ignore, msg.username)}>Ignore</button>
                            </>
                          )}
                      </>
                    ) : (
                      // Optional: You can add a button or message for your own username here if needed
                      <button onClick={() => alert('This is your own message!')}>This is you</button>
                    )}
                    </div>
                  </Popup>
                  {': ' + msg.message}
                </div>
              ))}
            </div>
          </div>
          <div className="message-input">
            <input
              className="message-input-textbox"
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => handleKeyDown('message', e)}
              placeholder="Type a message"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
