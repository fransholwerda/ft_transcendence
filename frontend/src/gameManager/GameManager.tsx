import React from 'react';
import './GameManager.css';
import Game from '../game/game';

const GameManager: React.FC = () => {
	return (
		<div className="game-manager-container">
			<div className="game-controls">
				<button>Look for Game</button>
				<button>Start Game</button>
				<button>Leave Game</button>
			</div>
			<div className="game-content">
				<Game />
			</div>
		</div>
	);
}

export default GameManager;
