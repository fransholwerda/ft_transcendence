import React from 'react';
import './grid.css';
import App from '../App';

const Grid: React.FC = () => {
    return (
        <div className="parent">
            <div className="header"></div>
            <div className="game"></div>
            <div className="chat"><App /></div>
        </div>
    );
}

export default Grid;
