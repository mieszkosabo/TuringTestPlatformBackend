import { WebSocketServer } from "ws";
import { PORT } from "./const";
import { Games } from "./types";
import { createNewGame, generateCode, getExpiredGames } from "./utils";

const wss = new WebSocketServer({port: PORT});



// a in memory set of current games
const currentGames: Games = new Map();

// end any expired games
setInterval(() => {
    const expiredGames = getExpiredGames(currentGames);
    expiredGames.forEach(([code, { evaluator, humanPlayer, withMachine }]) => {
        evaluator.send(JSON.stringify({ message: "GAME_END", payload: { wasMachine: withMachine}}));
        evaluator.close();
        if (humanPlayer) {
            humanPlayer.send(JSON.stringify({ message: "GAME_END", payload: { wasMachine: withMachine}}));
            humanPlayer.close();
        }
        currentGames.delete(code);
    })
}, 1000);


wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const message = JSON.parse(msg.toString());
        console.log(message);
        switch (message?.message) {
            case "INIT": {
                const withHuman = message.payload?.withHuman;
                const code = generateCode();
                const game = createNewGame(ws, withHuman);

                currentGames.set(code, game);

                ws.send(JSON.stringify({ message: "NEW_GAME", payload: { code }}));

                break;
            }
            case "JOIN": {
                const code = message?.payload?.code;
                if (code) {
                    const game = currentGames.get(code);
                    const { withMachine, evaluator } = game;
                    currentGames.set(code, {...game, humanPlayer: ws, startedAt: new Date() }); // note that we update the startedAt
                    evaluator.send(JSON.stringify({ message: "GAME_START", payload: {}}));
                    ws.send(JSON.stringify({ message: "GAME_START", payload: { withMachine }}));
                }
                break;
            }
            case "MESSAGE": {
                const { code, text, fromEvaluator } = message?.payload;
                const game = currentGames.get(code);
                if (game) {
                    const { withMachine, evaluator, humanPlayer } = game;

                    if (fromEvaluator && !withMachine) {
                        humanPlayer.send(JSON.stringify({ message: "NEW_MESSAGE", payload: { text }}));
                    }
                    if (!fromEvaluator) {
                        evaluator.send(JSON.stringify({ message: "NEW_MESSAGE", payload: { text }}));
                    }
                }

                break;
            }
            default:
                console.log("default hit", message?.message)
                break;
        }
    })

})