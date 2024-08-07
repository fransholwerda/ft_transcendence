import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Pong.css';
import { Constants } from '../../shared/constants';
import { useLocation } from 'react-router-dom';

const ptSock = io(`${Constants.BACKEND_HOST_URL}/pongtest`, {
	transports: ['websocket'],
});

const Pong: React.FC = () => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [opponent, setOpponent] = useState<string | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);
	const location = useLocation();

	useEffect(() => {
		ptSock.on('gameStart', ({ roomId, opponent }) => {
			console.log('Game started');
			console.log('Room ID:', roomId);
			console.log('Me:', ptSock.id);
			console.log('Opponent:', opponent);
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

		const curUrlPath = location.pathname;
		console.log('Current URL path:', curUrlPath);
		const areAtPongpage = curUrlPath.includes('/pong');

		if (!areAtPongpage) {
			console.log('Not at pong page');
			leaveQueue();
		}

		return () => {
			console.log('Pong component unmounted');
			if (location.pathname.includes('/pong')) {
				leaveQueue();
			}
			ptSock.off('gameStart');
			ptSock.off('opponentLeft');			
		};
	}, [location.pathname]);

	const joinQueue = () => {
		console.log('Joining queue');
		ptSock.emit('joinQueue');
		setInQueue(true);
	};

	const leaveQueue = () => {
		console.log('Leaving queue');
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
