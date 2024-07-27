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
	const [inQueue, setInQueue] = useState(false); // Step 1: Add inQueue state

	useEffect(() => {
		pongSocket.on('pong', (pongs: Conn[]) => {
			setPongs(pongs);
		});

		// Listen for queue updates
		pongSocket.on('queue-update', (queue: string[]) => {
			// Ensure pongSocket.id is defined before using it
			const isSocketInQueue = pongSocket.id ? queue.includes(pongSocket.id) : false;
			setInQueue(isSocketInQueue);
		});

		pongSocket.emit('request-Pong');

		return () => {
			pongSocket.off('pong');
			pongSocket.off('queue-update'); // Clean up listener
		};
	}, []);

	const joinQueue = () => { // Step 3: Define joinQueue function
		pongSocket.emit('join-queue');
	};

	const leaveQueue = () => { // Step 3: Define leaveQueue function
		pongSocket.emit('leave-queue');
	};

	// Step 4: Update the return statement
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
			{inQueue ? (
				<button onClick={leaveQueue}>Leave Queue</button>
			) : (
				<button onClick={joinQueue}>Join Queue</button>
			)}
		</div>
	);
};

export default Pong;