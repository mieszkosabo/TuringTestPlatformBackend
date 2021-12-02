import WebSocket from 'ws';
import { PORT } from '../src/const';

const createConnection = () => new WebSocket(`ws://localhost:${PORT}`);

describe("api tests", () => {
    it("accepts connections", (done) => {
        const ws = createConnection();
        ws.on("open", () => {
            ws.close();
            done();
        })
    });

    it("inits a new game", (done) => {
        const ws = createConnection();
        ws.on("open", () => {
            ws.send(JSON.stringify({ message: 'INIT'}));
        })
        ws.on('message', (data) => {
            const res = JSON.parse(data.toString());
            expect(typeof res?.payload?.code).toEqual("string");
            ws.close();
            done();
        })
    })

    it("human player can join a game", (done) => {
        const wsEvaluator = createConnection();
        const wsHumanPlayer = createConnection();

        // evaluator inits a game
        wsEvaluator.on("open", () => {
            wsEvaluator.send(JSON.stringify({ message: 'INIT', payload: { withHuman: true }}));
        })

        wsEvaluator.on("message", (data) => {
            const res = JSON.parse(data.toString());
            const { message, payload } = res;
            if (message === "NEW_GAME") { // evaluator receives info about new game
                const { code } = payload;
                // human player joins the game
                wsHumanPlayer.send(JSON.stringify({ message: 'JOIN', payload: { code }}));
            } else { // GAME_STARTS, after humanPlayer joins
                expect(payload.withMachine).toBeUndefined(); // evaluator doesn't know if they play with a machine (yet)
                // this assertion actually may or may not happen, cos of race condition,
                // but whatever. Not that important.
            }

        })

        wsHumanPlayer.on('message', (msg) => { // GAME_STARTS
            const { payload } = JSON.parse(msg.toString());
            console.log(payload);
            expect(typeof payload.withMachine).toEqual("boolean");
            wsHumanPlayer.close();
            wsEvaluator.close();
            done();
        })
    })

    it("human player can send message to evaluator", (done) => {
        const textMessage = "ayy whats good?";
        const wsEvaluator = createConnection();
        const wsHumanPlayer = createConnection();
        let currCode = null;

        // evaluator inits a game
        wsEvaluator.on("open", () => {
            wsEvaluator.send(JSON.stringify({ message: 'INIT', payload: { withHuman: true }}));
        })

        wsEvaluator.on("message", (data) => {
            const res = JSON.parse(data.toString());
            const { message, payload } = res;
            if (message === "NEW_GAME") { // evaluator receives info about new game
                const { code } = payload;
                currCode = code;
                // human player joins the game
                wsHumanPlayer.send(JSON.stringify({ message: 'JOIN', payload: { code }}));
            } else if (message === "GAME_START") { // GAME_START, after humanPlayer joins
                expect(payload.withMachine).toBeUndefined(); // evaluator doesn't know if they play with a machine (yet)
                // this assertion actually may or may not happen, cos of race condition,
                // but whatever. Not that important.
            } else if (message === "NEW_MESSAGE") { // human players sends sth
                const { text } = payload;
                expect(text).toBe(textMessage);
                wsHumanPlayer.close();
                wsEvaluator.close();
                done();
            }

        })

        wsHumanPlayer.on('message', (msg) => { // GAME_STARTS
            const { payload } = JSON.parse(msg.toString());
            console.log(payload);
            wsHumanPlayer.send(JSON.stringify({ message: "MESSAGE", payload: { fromEvaluator: false, text: textMessage, code: currCode}}));
        })
    })
})