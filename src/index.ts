import { WebSocketServer } from "ws";
import { PORT, TEST_DURATION } from "./const";
import { GameMessage, Games, ServerMessage } from "./types";
import {
  createNewGame,
  generateCode,
  removeExpiredGames,
  parseMessage,
  sendMessage,
} from "./utils";

const wss = new WebSocketServer({ port: PORT });

// an in-memory set of current games
const currentGames: Games = new Map();

// end any expired games
setInterval(() => {
  removeExpiredGames(currentGames);
}, 1000);

// TODO: handle games with GPT-3
wss.on("connection", (ws) => {
  console.log("new connection");
  ws.on("message", (msg) => {
    const message = parseMessage(msg);
    switch (message?.message) {
      case "INIT": {
        const withHuman = message.payload?.withHuman;
        const code = generateCode();
        const game = createNewGame(ws, withHuman);

        currentGames.set(code, game);
        sendMessage(ws, { message: "NEW_GAME", payload: { code } });
        break;
      }
      case "JOIN": {
        const code = message?.payload?.code;
        if (code) {
          const game = currentGames.get(code);
          const { withMachine, evaluator } = game;
          const endTime = new Date().getTime() + TEST_DURATION;
          currentGames.set(code, {
            ...game,
            humanPlayer: ws,
            endTime,
          });

          sendMessage(evaluator, {
            message: "GAME_START",
            payload: { endTime },
          });
          sendMessage(ws, {
            message: "GAME_START",
            payload: { withMachine, endTime },
          });
        }
        break;
      }
      case "MESSAGE": {
        const { code, text, fromEvaluator } = message?.payload;
        const game = currentGames.get(code);
        if (game) {
          const { withMachine, evaluator, humanPlayer, messages } = game;
          const newGameMessage: GameMessage = { text, fromEvaluator };
          const newMessage: ServerMessage = {
            message: "NEW_MESSAGE",
            payload: { text },
          };
          if (fromEvaluator && !withMachine) {
            sendMessage(humanPlayer, newMessage);
          }
          if (!fromEvaluator) {
            sendMessage(evaluator, newMessage);
          }
          currentGames.set(code, {
            ...game,
            messages: [...messages, newGameMessage],
          });
        }
        break;
      }
      case "RECONNECT": {
        console.log("reconnect");
        const { code, isEvaluator } = message?.payload;
        const game = currentGames.get(code);
        currentGames.set(code, {
          ...game,
          [isEvaluator ? "evaluator" : "humanPlayer"]: ws,
        });

        sendMessage(ws, {
          message: "MESSAGE_HISTORY",
          payload: { messages: game.messages },
        });
        break;
      }
    }
  });
});
