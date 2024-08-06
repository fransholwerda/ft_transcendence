import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Pong.css';
import { Constants } from '../../shared/constants';

const ptSock = io(`${Constants.BACKEND_HOST_URL}/pongtest`, {
	transports: ['websocket'],
});

const Pong: React.FC = () => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [opponent, setOpponent] = useState<string | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);

	useEffect(() => {
		ptSock.on('gameStart', ({ roomId, opponent }) => {
			setInQueue(false);
			setInGame(true);
			setOpponent(opponent);
			setRoomId(roomId);
		});

		ptSock.on('opponentLeft', () => {
			setInGame(false);
			setOpponent(null);
			setRoomId(null);
		});

		return () => {
			ptSock.off('gameStart');
			ptSock.off('opponentLeft');
		};
	}, []);

	const joinQueue = () => {
		ptSock.emit('joinQueue');
		setInQueue(true);
	};

	const leaveQueue = () => {
		ptSock.emit('leaveQueue');
		setInQueue(false);
	};

	return (
		<div className="pongs-container">
			<div className="pong-card">
				<h2>Pong Game</h2>
				{!inQueue && !inGame && (
					<button onClick={joinQueue}>Join Queue</button>
				)}
				{inQueue && (
					<>
						<p>Waiting for opponent...</p>
						<button className="leave-queue-btn" onClick={leaveQueue}>
							Leave Queue
						</button>
					</>
				)}
				{inGame && (
					<div className="game-info">
						<p>Game started!</p>
						<p>Room ID: {roomId}</p>
						<p>Opponent: {opponent}</p>
						{/* Add your game component here */}
					</div>
				)}
			</div>
		</div>
	);
};

export default Pong;
