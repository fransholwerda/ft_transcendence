import React from 'react';
import './MainGrid.css';
// import App from '../App';
import Chat from '../chat/Chat'
import GameManager from '../gameManager/GameManager';

const MainGrid: React.FC = () => {
    return (
        <div className="parent">
            <div className="header"></div>
            <div className="game"><GameManager /></div>
            {/* <div className="chat"><App /></div> */}
			<div className="chat"><Chat /></div>
        </div>
    );
}

export default MainGrid;
