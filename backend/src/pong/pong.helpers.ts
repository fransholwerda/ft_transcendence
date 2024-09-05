import { GameSession, User } from './pong.types';
import { pongPrint } from './pong.constants';
import { PongC } from '../../shared/constants';

export function fillGameSession(p1: { clientId: string, user: User }, p2: { clientId: string, user: User }, roomId: string): GameSession {
    pongPrint(`NestJS pong: Filling game session for room ${roomId}`);
    const sesh: GameSession = {
        p1: {
            clientid: p1.clientId,
            userid: p1.user.id,
            username: p1.user.username,
            score: 0,
            paddle: {
                x: 50,
                y: PongC.CANVAS_HEIGHT / 2 - PongC.PADDLE_HEIGHT / 2,
                width: PongC.PADDLE_WIDTH,
                height: PongC.PADDLE_HEIGHT,
                speed: PongC.PADDLE_SPEED
            },
            isKeyDown: false,
            key: ''
        },
        p2: {
            clientid: p2.clientId,
            userid: p2.user.id,
            username: p2.user.username,
            score: 0,
            paddle: {
                x: PongC.CANVAS_WIDTH - 50,
                y: PongC.CANVAS_HEIGHT / 2 - PongC.PADDLE_HEIGHT / 2,
                width: PongC.PADDLE_WIDTH,
                height: PongC.PADDLE_HEIGHT,
                speed: PongC.PADDLE_SPEED
            },
            isKeyDown: false,
            key: ''
        },
        roomId: roomId,
        ball: {
            x: PongC.CANVAS_WIDTH / 2 - PongC.BALL_WIDTH,
            y: PongC.CANVAS_HEIGHT / 2 - PongC.BALL_HEIGHT,
            width: PongC.BALL_WIDTH,
            height: PongC.BALL_HEIGHT,
            speedX: PongC.BALL_SPEEDX,
            speedY: PongC.BALL_SPEEDY
        },
        lastUpdateTime: Date.now()
    };
    return sesh;
}

export function printGameSession(sesh: GameSession) {
    pongPrint(`NestJS pong: Game session ${sesh.roomId}`);
    pongPrint(`NestJS pong: ${sesh.p1.username}:${sesh.p1.score} - ${sesh.p2.username}:${sesh.p2.score}`);
}

export function printQueue(queue: { clientId: string, user: User }[]) {
    pongPrint('NestJS pong: printQueue()');
    queue.forEach((q) => {
        pongPrint(`NestJS pong: ${q.user.username}`);
    });
}

export function printGames(games: GameSession[]) {
    pongPrint('NestJS pong: printGames()');
    games.forEach((game) => {
        pongPrint(`NestJS pong: ${game.p1.username} vs ${game.p2.username}`);
    });
}

export function removeFromQueue(queue: { clientId: string, user: User }[], clientId: string) {
    pongPrint(`NestJS pong: ${clientId} removing client from queue`);
    return queue.filter((q) => q.clientId !== clientId);
}

export function findGameSessionByClientId(games: GameSession[], clientId: string): GameSession | null {
    pongPrint(`NestJS pong: findGameSessionByClientId ${clientId}`);
    const gameSession = games.find((game) => game.p1.clientid === clientId || game.p2.clientid === clientId);
    if (!gameSession) {
        pongPrint(`NestJS pong: Could not find game session for user ${clientId}`);
        return null;
    }
    return gameSession;
}

export function findGameSessionByUserId(games: GameSession[], userId: string): GameSession | null {
    pongPrint(`NestJS pong: findGameSessionByUserId ${userId}`);
    const gameSession = games.find((game) => game.p1.userid === userId || game.p2.userid === userId);
    if (!gameSession) {
        pongPrint(`NestJS pong: Could not find game session for user ${userId}`);
        return null;
    }
    return gameSession;
}

export function isUserInGame(games: GameSession[], userId: string): boolean {
    pongPrint(`NestJS pong: Checking if user ${userId} is in a game`);
    return findGameSessionByUserId(games, userId) !== null;
}

export function getRoomIdByClientId(games: GameSession[], clientId: string): string | null {
    pongPrint(`NestJS pong: Getting room ID by client ID ${clientId}`);
    const gameSession = findGameSessionByClientId(games, clientId);
    if (!gameSession) {
        pongPrint(`NestJS pong: Could not find room ID for client ${clientId}`);
        return null;
    }
    return gameSession.roomId;
}

export function disconnectFromGame(server: any, games: GameSession[], clientId: string) {
    pongPrint(`NestJS pong: ${clientId} disconnecting from game`);
    if (!findGameSessionByClientId(games, clientId)) {
        pongPrint(`NestJS pong: disconnectFromGame: Could not find game session for client ${clientId}`);
        return;
    }
    server.socketsLeave(clientId);
}

export function removeGameSession(games: GameSession[], roomId: string) {
    pongPrint(`NestJS pong: Removing game session for room ${roomId}`);
    return games.filter((game) => game.roomId !== roomId);
}
