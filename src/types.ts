const WebSocket = require("ws");

export type Game = {
    withMachine: boolean;
    humanPlayer?: any;
    evaluator: any;
    startedAt: Date;
}
export type GameCode = string;
export type Games = Map<GameCode, Game>;