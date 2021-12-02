import { Game, GameCode } from './types';
// import WebSocket from "ws";

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

export const createNewGame = (evalutatorWs: any): Game => {
    //const withMachine = Math.random() > 0.5; // FIXME: uncomment later
    const withMachine = false;
    const startedAt = new Date();

    return {
        evaluator: evalutatorWs,
        withMachine,
        startedAt
    }
}