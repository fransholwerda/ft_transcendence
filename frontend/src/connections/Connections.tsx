import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Connections.css';

interface Connection {
  id: string;
  order: number;
}

const connectionsSocket = io('http://localhost:3003/connections');

const Connections: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    connectionsSocket.on('connections', (connections: Connection[]) => {
      setConnections(connections);
    });

    connectionsSocket.emit('request-connections');

    return () => {
      connectionsSocket.off('connections');
    };
  }, []);

  return (
    <div className="connections-container">
      <h2>Active Connections</h2>
      <ul>
        {connections.map((conn) => (
          <li key={conn.id}>
            {conn.id}: {conn.order}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Connections;
