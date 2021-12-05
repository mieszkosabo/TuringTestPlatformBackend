import { WebSocketServer } from "ws";
import { PORT } from "./const";
import { Games, ServerMessage } from "./types";
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

// TODO: add linting
// TODO: handle games with GPT-3
wss.on("connection", (ws) => {
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
          currentGames.set(code, {
            ...game,
            humanPlayer: ws,
            startedAt: new Date(),
          }); // note that we update the startedAt
          sendMessage(evaluator, { message: "GAME_START", payload: {} });
          sendMessage(ws, { message: "GAME_START", payload: { withMachine } });
        }
        break;
      }
      case "MESSAGE": {
        const { code, text, fromEvaluator } = message?.payload;
        const game = currentGames.get(code);
        if (game) {
          const { withMachine, evaluator, humanPlayer } = game;
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
        }
        break;
      }
    }
  });
});
