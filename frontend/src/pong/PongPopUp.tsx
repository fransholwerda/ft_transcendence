import React from 'react';
import './PongPopUp.css';

interface PongPopUpProps {
    message: string;
    onClose: () => void;
}

const PongPopUp: React.FC<PongPopUpProps> = ({ message, onClose }) => {
    return (
        <div className="pongPopUp-overlay">
            <div className="pongPopUp-content">
                <h4>Game Over</h4>
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default PongPopUp;
