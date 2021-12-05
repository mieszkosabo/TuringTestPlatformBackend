import { ClientMessage, Game, GameCode, Games, ServerMessage } from "./types";
import type WebSocket from "ws";
import { NOT_STARTED_GAME_TIMEOUT, TEST_DURATION } from "./const";

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const generateCode = (): GameCode => makeid(7);

export const createNewGame = (
  evalutatorWs: WebSocket,
  withHuman?: boolean
): Game => {
  const withMachine = withHuman != null ? withHuman : Math.random() > 0.5;
  const initedAt = new Date();

  return {
    evaluator: evalutatorWs,
    withMachine,
    initedAt,
  };
};

export const getExpiredGames = (games: Games) => {
  const currDate = new Date();
  return Array.from(games.entries()).filter(([code, { startedAt, initedAt }]) =>
    startedAt
      ? currDate.getTime() - startedAt.getTime() >= TEST_DURATION
      : currDate.getTime() - initedAt.getTime() >= NOT_STARTED_GAME_TIMEOUT
  );
};

export const parseMessage = (msg: WebSocket.RawData): ClientMessage =>
  JSON.parse(msg.toString());

export const sendMessage = (receiver: WebSocket, msg: ServerMessage): void => {
  receiver.send(JSON.stringify(msg));
};

export const removeExpiredGames = (currentGames: Games) => {
  const expiredGames = getExpiredGames(currentGames);
  expiredGames.forEach(([code, { evaluator, humanPlayer, withMachine }]) => {
    const endMsg: ServerMessage = {
      message: "GAME_END",
      payload: { wasMachine: withMachine },
    };
    sendMessage(evaluator, endMsg);
    evaluator.close();
    if (humanPlayer) {
      sendMessage(humanPlayer, endMsg);
      humanPlayer.close();
    }
    currentGames.delete(code);
  });
};
