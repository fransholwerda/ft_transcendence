import React from 'react';
import './grid.css';

const Grid: React.FC = () => {
    return (
        <div className="parent">
            <div className="header"></div>
            <div className="game"></div>
            <div className="chat"></div>
        </div>
    );
}

export default Grid;
