import type WebSocket from "ws";

export type Game = {
    withMachine: boolean;
    humanPlayer?: WebSocket;
    evaluator: WebSocket;
    startedAt?: Date;
    initedAt: Date;
}
export type GameCode = string;
export type Games = Map<GameCode, Game>;