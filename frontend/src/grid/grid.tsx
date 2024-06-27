import React from 'react';
import './grid.css';
// import App from '../App';
import Chat from '../chat/Chat'
import GameManager from '../gameManager/GameManager';

const Grid: React.FC = () => {
    return (
        <div className="parent">
            <div className="header"></div>
            <div className="game"><GameManager /></div>
            {/* <div className="chat"><App /></div> */}
			<div className="chat"><Chat /></div>
        </div>
    );
}

export default Grid;
