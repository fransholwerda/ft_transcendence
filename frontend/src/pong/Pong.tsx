import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './Pong.css';
import { Constants } from '../../shared/constants';
import { useLocation } from 'react-router-dom';
import { User } from '../PageManager';

const pSock = io(`${Constants.BACKEND_HOST_URL}/pong`, {
	transports: ['websocket'],
});

interface PongProps {
	user: User;
}

// at the top display username and client id
// add a gameover screen
// add a check for if username is already in queue or game
// if so, dont let them join queue or trigger inQueue

// just use socket on and emit to communicate

// add user to this and use it to display the user's name in the game
// make it that you cant play against yourself
// and make it that you cant be in queue for multiple games at once

// why does the user not get sent back to the !inQueue && !inGame when they receive 'opponentLeft'?

// in gameover window, it shows both names and their scores points under their names
// prob have winner in green and loser in red
// and have winner, loser under their names
// the names, userids, scores will be saved in an object
// that object is sent to the backend to save the game data
// add a queue button to go to the inQueue screen

const Pong: React.FC<PongProps> = ({ user }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [opponent, setOpponent] = useState<string | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);
	const location = useLocation();

	useEffect(() => {
		pSock.on('gameStart', ({ roomId, opponent }) => {
			console.log('Game started');
			console.log('Room ID:', roomId);
			console.log('My Client ID:', pSock.id);
			console.log('My Username:', user.display_name);
			console.log('Opponent:', opponent);
			setInQueue(false);
			setInGame(true);
			setOpponent(opponent);
			setRoomId(roomId);
		});

		pSock.on('opponentLeft', () => {
			console.log('Opponent left');
			setInQueue(false);
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
			leaveGame();
		}

		return () => {
			console.log('Pong component unmounted');
			if (location.pathname.includes('/pong')) {
				leaveQueue();
				leaveGame();
			}
			pSock.off('gameStart');
			pSock.off('opponentLeft');			
		};
	}, [location.pathname]);

	const joinQueue = () => {
		console.log('Joining queue');
		pSock.emit('joinQueue', { username: user.display_name });
		setInQueue(true);
	};

	const leaveQueue = () => {
		console.log('Leaving queue');
		pSock.emit('leaveQueue');
		setInQueue(false);
	};

	const leaveGame = () => {
		console.log('Leaving game');
		pSock.emit('leaveGame');
		setInQueue(false);
		setInGame(false);
		setOpponent(null);
		setRoomId(null);
	};

	return (
		<div className="pong-container">
			<h2>Pong Game</h2>
			<h3>Client ID: {pSock.id}</h3>
			<h3>Username: {user.display_name}</h3>
			<div className="pong-card">
				{!inQueue && !inGame && (
					<button className="join-queue-btn" onClick={joinQueue}>Join Queue</button>
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
						<p>Your Name: {user.display_name}</p>
						<button className="leave-game-btn" onClick={leaveGame}>
							Leave Game
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Pong;
