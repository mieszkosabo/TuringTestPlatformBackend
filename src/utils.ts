import { Game, GameCode, Games } from './types';
import type WebSocket from "ws";
import { NOT_STARTED_GAME_TIMEOUT, TEST_DURATION } from './const';

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

export const generateCode = (): GameCode => makeid(7);

export const createNewGame = (evalutatorWs: WebSocket): Game => {
    //const withMachine = Math.random() > 0.5; // FIXME: uncomment later
    const withMachine = false;
    const initedAt = new Date();

    return {
        evaluator: evalutatorWs,
        withMachine,
        initedAt
    }
};

export const getExpiredGames = (games: Games) => {
    const currDate = new Date();
    return Array
        .from(games.entries())
        .filter(([code, { startedAt, initedAt }]) => (
            startedAt
                ? currDate.getTime() - startedAt.getTime() >= TEST_DURATION
                : currDate.getTime() - initedAt.getTime() >= NOT_STARTED_GAME_TIMEOUT
            )
        )
};