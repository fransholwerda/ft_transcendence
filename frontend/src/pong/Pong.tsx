import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Pong.css';

interface Conn {
	id: string;
	order: number;
}

interface PongProps {
	username: string;
}

const ptSock = io('http://localhost:3003/pongtest', {
	transports: ['websocket'],
});

const Pong: React.FC<PongProps> = ({ username }) => {
	const [pongs, setPongs] = useState<Conn[]>([]);
	const [inQueue, setInQueue] = useState(false);
	const [queue, setQueue] = useState<string[]>([]);

	useEffect(() => {
		ptSock.on('pong', (pongs: Conn[]) => {
			setPongs(pongs);
		});

		// Listen for queue updates
		ptSock.on('queue-update', (queue: string[]) => {
			// Ensure ptSock.id is defined before using it
			let isSocketInQueue = false;
			if (ptSock.id) {
				isSocketInQueue = queue.includes(ptSock.id);
			}
			setInQueue(isSocketInQueue);
			setQueue(queue);
		});

		ptSock.emit('request-Pong');

		return () => {
			ptSock.off('pong');
			ptSock.off('queue-update');
			ptSock.off('connect')
		};
	}, []);

	const joinQueue = () => {
		ptSock.emit('join-queue');
	};

	const leaveQueue = () => {
		ptSock.emit('leave-queue');
	};

	return (
		<div className="pongs-container">
			<h2>{username}</h2>
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
			<div className="queue-container">
				<h2>Queue</h2>
				<ul>
					{queue.map((clientId) => (
						<li key={clientId}>{clientId}</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default Pong;
