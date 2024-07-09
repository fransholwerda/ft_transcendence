import React from 'react';
import './grid.css';
// import App from '../App';
import Chat from '../chat/Chat'
import GameManager from '../gameManager/GameManager';
import Header from '../Login/LoginForm';

const Grid: React.FC = () => {
    return (
        <div className="parent">
            <div className="header"><Header /></div>
            <div className="game"><GameManager /></div>
            {/* <div className="chat"><App /></div> */}
			<div className="chat"><Chat /></div>
        </div>
    );
}

export default Grid;
