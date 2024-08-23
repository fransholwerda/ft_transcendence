import React from 'react';
import { GameSession } from './PongTypes';

interface PongGameProps {
    gameSession: GameSession;
    pongLeaveGame: () => void;
    testIncrement: () => void;
}

const PongGame: React.FC<PongGameProps> = ({ gameSession, pongLeaveGame, testIncrement}) => {
    return (
        <div className="game-info">
            <p>p1 | P2</p>
            <p>clientid: {gameSession.p1.clientid ?? 'N/A'} | {gameSession.p2.clientid ?? 'N/A'}</p>
            <p>userid: {gameSession.p1.userid ?? 'N/A'} | {gameSession.p2.userid ?? 'N/A'}</p>
            <p>username: {gameSession.p1.username ?? 'N/A'} | {gameSession.p2.username ?? 'N/A'}</p>
            <p>score: {gameSession.p1.score ?? 0} | {gameSession.p2.score ?? 'N/A'}</p>
            <p>Room ID: {gameSession.roomId ?? 'N/A'}</p>
            <button className="leave-game-btn" onClick={pongLeaveGame}>
                Leave Game
            </button>
            <button className="test-increment-btn" onClick={testIncrement}>
                Test Increment
            </button>
        </div>
    );
};

export default PongGame;
