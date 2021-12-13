import { WebSocketServer } from "ws";
import { getAnswerFromBot } from "./chatbot";
import { PORT, TEST_DURATION } from "./const";
import { GameMessage, Games, ServerMessage } from "./types";
import {
  createNewGame,
  generateCode,
  removeExpiredGames,
  parseMessage,
  sendMessage,
  wait,
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
  ws.on("message", async (msg) => {
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
          const updatedMessages = [...messages, newGameMessage];
          if (fromEvaluator && !withMachine) {
            // evaluator -> humanPlayer
            sendMessage(humanPlayer, newMessage);
          } else if (fromEvaluator && withMachine) {
            // evaluator -> machine
            console.log(updatedMessages);
            const messageFromMachine = await getAnswerFromBot(updatedMessages);
            console.log(messageFromMachine);

            // ~ 5-15 seconds delay to make the timing more natural
            await wait(Math.random() * (15_000 - 5_000) + 5_000);

            // machine -> evaluator
            sendMessage(evaluator, {
              message: "NEW_MESSAGE",
              payload: { text: messageFromMachine.text },
            });

            updatedMessages.push(messageFromMachine);
          }
          if (!fromEvaluator) {
            // humanPlayer -> evaluator
            sendMessage(evaluator, newMessage);
          }

          currentGames.set(code, {
            ...game,
            messages: updatedMessages,
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
