import { WebSocketServer } from "ws";
import { PORT } from "./const";
import { GameCode, Games } from "./types";
import { createNewGame, generateCode } from "./utils";

const wss = new WebSocketServer({port: PORT});



// a in memory set of current games
const currentGames: Games = new Map();




wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const message = JSON.parse(msg.toString());
        console.log(message);
        switch (message?.message) {
            case "INIT": {
                const code = generateCode();
                const game = createNewGame(ws);

                currentGames.set(code, game);

                ws.send(JSON.stringify({ message: "NEW_GAME", payload: { code }}));

                break;
            }
            case "JOIN": {
                const code = message?.payload?.code;
                if (code) {
                    const game = currentGames.get(code);
                    const {withMachine, evaluator } = game;
                    currentGames.set(code, {...game, humanPlayer: ws});
                    evaluator.send(JSON.stringify({ message: "GAME_START", payload: {}}));
                    ws.send(JSON.stringify({ message: "GAME_START", payload: { withMachine }}));
                }
                break;
            }
            case "MESSAGE": {
                const { code, text, fromEvaluator } = message?.payload;
                if (code) {
                    const { withMachine, evaluator, humanPlayer } = currentGames.get(code);

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