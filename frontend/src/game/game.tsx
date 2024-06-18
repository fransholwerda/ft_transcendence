import './game.css';
import React, { useEffect, useRef } from 'react';

// Function to draw the game elements on the canvas
const drawGame = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  // Draw the paddles and ball
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.fillRect(50, 100, 15, 100); // left paddle
  context.fillRect(canvas.width - 65, 100, 15, 100); // right paddle
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2, false); // ball
  context.fill();
};

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    drawGame(context, canvas);
  }, []);

  return (
    <canvas ref={canvasRef} width={800} height={400} />
  );
};

export default Game;
