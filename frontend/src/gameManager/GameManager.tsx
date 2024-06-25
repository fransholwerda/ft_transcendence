import React, { useState } from 'react';
import './GameManager.css';
import Game from '../game/game';

const GameManager: React.FC = () => {
	const [startGame, setStartGame] = useState(false);
	const [isGameInProgress, setIsGameInProgress] = useState(false);

	const handleStartGame = () => {
		if (!isGameInProgress) {
			setStartGame(true); // Start or restart the game
			setIsGameInProgress(true); // Mark the game as in progress
		}
	};

	// Function to be called when the game ends
	const handleGameEnd = () => {
		setIsGameInProgress(false);
		setStartGame(false); // Reset startGame to allow for restart
	};

	return (
		<div className="game-manager-container">
			<div className="game-controls">
				<button>Look for Game</button>
				<button onClick={handleStartGame}>(Re)Start Game</button>
				<button>Leave Game</button>
			</div>
			<div className="game-content">
				<Game start={startGame} onGameEnd={handleGameEnd} />
			</div>
		</div>
	);
}

export default GameManager;
