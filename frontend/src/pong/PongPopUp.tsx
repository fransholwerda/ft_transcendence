import React from 'react';
import './PongPopUp.css';

interface PongPopUpProps {
    endStatus: string;
    winner: string;
    score: string;
    onClose: () => void;
}

const PongPopUp: React.FC<PongPopUpProps> = ({ endStatus, winner, score, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h4>{endStatus}</h4>
                <p>{winner}</p>
                <p>{score}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default PongPopUp;
