import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../PageManager';
import { GameSession } from './PongTypes';
import { pongPrint } from './PongUtils';

// GAMESTART
export const ufGameStart = (
	pSock: Socket,
	user: User,
	setInQueue: React.Dispatch<React.SetStateAction<boolean>>,
	setInGame: React.Dispatch<React.SetStateAction<boolean>>,
	setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>
) => {
	useEffect(() => {
		const handleGameStart = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx: game start received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx: No game session found`);
				return;
			}
			pongPrint(`pong.tsx: Game started`);
			pongPrint(`pong.tsx: Username: ${user.username} Room ID: ${sesh.roomId}`);

			setInQueue(false);
			setInGame(true);
			setGameSession(sesh);
		};

		pSock.on('gameStart', handleGameStart);
		return () => {
			pongPrint(`pong.tsx: gameStart useEffect return ${user.username}`);
			pSock.off('gameStart', handleGameStart);
		};
	}, [pSock, user, setInQueue, setInGame, setGameSession]);
};

// QUEUESTATUS
export const ufQueueStatus = (
	pSock: Socket,
	user: User,
	setInQueue: React.Dispatch<React.SetStateAction<boolean>>
) => {
	useEffect(() => {
		const handleQueueStatus = ({ success, message }: { success: boolean; message: string }) => {
			pongPrint(`pong.tsx: Queue status: ${success}, ${message}, ${user.username}`);
			if (success) {
				pongPrint(`pong.tsx: Successfully joined queue ${user.id}`);
				setInQueue(true);
			} else {
				pongPrint(`pong.tsx: Failed to join queue ${user.id}`);
				alert(message);
			}
		};

		pSock.on('queueStatus', handleQueueStatus);
		return () => {
			pongPrint(`pong.tsx: queueStatus useEffect return ${user.username}`);
			pSock.off('queueStatus', handleQueueStatus);
		};
	}, [pSock, user, setInQueue]);
};

// ROUTELEAVEGAME
export const ufRouteLeaveGame = (
	pSock: Socket,
	user: User,
	setInQueue: React.Dispatch<React.SetStateAction<boolean>>,
	setInGame: React.Dispatch<React.SetStateAction<boolean>>,
	setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>
) => {
	useEffect(() => {
		const handleRouteLeaveGame = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx routeLeaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx routeLeaveGame: No game session found`);
				return;
			}
			pongPrint(`pong.tsx routeLeaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		};

		pSock.on('routeLeaveGame', handleRouteLeaveGame);
		return () => {
			pongPrint(`pong.tsx: routeLeaveGame useEffect return ${user.username}`);
			pSock.off('routeLeaveGame', handleRouteLeaveGame);
		};
	}, [pSock, user, setInQueue, setInGame, setGameSession]);
};

// PONGLEAVEGAME
export const ufPongLeaveGame = (
	pSock: Socket,
	user: User,
	setInQueue: React.Dispatch<React.SetStateAction<boolean>>,
	setInGame: React.Dispatch<React.SetStateAction<boolean>>,
	setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>
) => {
	useEffect(() => {
		const handlePongLeaveGame = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx pongLeaveGame: received from server`);
			if (!sesh) {
				pongPrint(`pong.tsx pongLeaveGame: No game session found`);
				return;
			}
			pongPrint(`pong.tsx pongLeaveGame: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			alert(`${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
			setInGame(false);
			setInQueue(false);
			setGameSession(null);
		};

		pSock.on('pongLeaveGame', handlePongLeaveGame);
		return () => {
			pongPrint(`pong.tsx: pongLeaveGame useEffect return ${user.username}`);
			pSock.off('pongLeaveGame', handlePongLeaveGame);
		};
	}, [pSock, user, setInQueue, setInGame, setGameSession]);
};

// ----------------- TEST SCORE INCREMENT -----------------
export const ufTestIncrement = (
	pSock: Socket,
	setGameSession: React.Dispatch<React.SetStateAction<GameSession | null>>
) => {
	useEffect(() => {
		const handleTestIncrement = ({ sesh }: { sesh: GameSession }) => {
			pongPrint(`pong.tsx: testIncrement received from server`);
			setGameSession(sesh);
		};
	
		pSock.on('testIncrement', handleTestIncrement);
		return () => {
			pSock.off('testIncrement', handleTestIncrement);
		};
	}, [pSock, setGameSession]);
};
// ----------------- TEST SCORE INCREMENT -----------------
