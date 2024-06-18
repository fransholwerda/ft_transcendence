import './game.css';
import React, { useEffect, useRef } from 'react';

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dy: number;
}

class Paddle implements Paddle {
  constructor(x: number, y: number, width: number, height: number, speed: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.dy = 0;
  }

  moveUp() {
    this.dy = -this.speed;
  }

  moveDown() {
    this.dy = this.speed;
  }

  stop() {
    this.dy = 0;
  }

  update(canvas: HTMLCanvasElement) {
    this.y += this.dy;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white';
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
}

class Ball implements Ball {
  constructor(x: number, y: number, radius: number, speedX: number, speedY: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fill();
  }

  update(canvas: HTMLCanvasElement, leftPaddle: Paddle, rightPaddle: Paddle, score: Score) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.speedY = -this.speedY;
    }

    if (
      this.x - this.radius < leftPaddle.x + leftPaddle.width &&
      this.y > leftPaddle.y &&
      this.y < leftPaddle.y + leftPaddle.height
    ) {
      this.speedX = -this.speedX;
    }

    if (
      this.x + this.radius > rightPaddle.x &&
      this.y > rightPaddle.y &&
      this.y < rightPaddle.y + rightPaddle.height
    ) {
      this.speedX = -this.speedX;
    }

    if (this.x - this.radius < 0) {
      score.right += 1;
      this.reset(canvas);
    } else if (this.x + this.radius > canvas.width) {
      score.left += 1;
      this.reset(canvas);
    }
  }

  reset(canvas: HTMLCanvasElement) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speedX = -this.speedX;
  }
}

interface Score {
  left: number;
  right: number;
}

class Score implements Score {
  left = 0;
  right = 0;

  draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.fillStyle = 'white';
    context.font = '48px sans-serif';
    context.fillText(this.left.toString(), canvas.width / 4, 50);
    context.fillText(this.right.toString(), (canvas.width / 4) * 3, 50);
  }
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const paddleWidth = 15;
    const paddleHeight = 100;
    const paddleSpeed = 5;

    const leftPaddle = new Paddle(50, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, paddleSpeed);
    const rightPaddle = new Paddle(canvas.width - 50 - paddleWidth, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, paddleSpeed);
    const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 4);
    const score = new Score();

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
          leftPaddle.moveUp();
          break;
        case 's':
          leftPaddle.moveDown();
          break;
        case 'ArrowUp':
          rightPaddle.moveUp();
          break;
        case 'ArrowDown':
          rightPaddle.moveDown();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 's':
          leftPaddle.stop();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          rightPaddle.stop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);

      leftPaddle.update(canvas);
      rightPaddle.update(canvas);
      leftPaddle.draw(context);
      rightPaddle.draw(context);
      ball.update(canvas, leftPaddle, rightPaddle, score);
      ball.draw(context);
      score.draw(context, canvas);

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={800} height={400} />
  );
};

export default Game;
