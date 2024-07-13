import React from 'react';
import './MainGrid.css';
import Chat from '../chat/Chat'
import GameManager from '../gameManager/GameManager';
import MainHeader from '../mainHeader/MainHeader';

const MainGrid: React.FC = () => {
    return (
        <div className="parent">
            <div className="header"><MainHeader /></div>
            <div className="game"><GameManager /></div>
			<div className="chat"><Chat /></div>
        </div>
    );
}

export default MainGrid;
