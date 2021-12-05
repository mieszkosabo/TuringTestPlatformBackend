import type WebSocket from "ws";

export type Game = {
  withMachine: boolean;
  humanPlayer?: WebSocket;
  evaluator: WebSocket;
  startedAt?: Date;
  initedAt: Date;
};
export type GameCode = string;
export type Games = Map<GameCode, Game>;
export type ServerMessage =
  | {
      message: "NEW_GAME";
      payload: {
        code: GameCode;
      };
    }
  | {
      message: "GAME_START";
      payload: {
        withMachine?: boolean;
      };
    }
  | {
      message: "NEW_MESSAGE";
      payload: {
        text: string;
      };
    }
  | {
      message: "GAME_END";
      payload: {
        wasMachine: boolean;
      };
    };

export type ClientMessage =
  | {
      message: "INIT";
      payload: {
        withHuman?: boolean;
      };
    }
  | {
      message: "JOIN";
      payload: {
        code: GameCode;
      };
    }
  | {
      message: "MESSAGE";
      payload: {
        code: GameCode;
        text: string;
        fromEvaluator: boolean;
      };
    };
