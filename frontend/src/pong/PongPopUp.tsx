import React from 'react';
import './PongPopUp.css';

interface PongPopUpProps {
    msg1: string;
    msg2: string;
    onClose: () => void;
}

const PongPopUp: React.FC<PongPopUpProps> = ({ msg1, msg2, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h4>Game Over</h4>
                <p>{msg1}</p>
                <p>{msg2}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default PongPopUp;
