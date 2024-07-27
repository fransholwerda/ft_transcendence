import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Pong.css';

interface Conn {
  id: string;
  order: number;
}

const pongSocket = io('http://localhost:3003/pong', {
  transports: ['websocket'],
});

const Pong: React.FC = () => {
  const [pongs, setPongs] = useState<Conn[]>([]);

  useEffect(() => {
    pongSocket.on('pong', (pongs: Conn[]) => {
      setPongs(pongs);
    });

    pongSocket.emit('request-Pong');

    return () => {
      pongSocket.off('pong');
    };
  }, []);

  return (
    <div className="pongs-container">
      <h2>Active Pongs</h2>
      <ul>
        {pongs.map((conn) => (
          <li key={conn.id}>
            {conn.id}: {conn.order}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pong;
