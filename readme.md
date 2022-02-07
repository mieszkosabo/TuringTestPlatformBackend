# How to run

1. Get a secret key from OpenAI
2. create a .env file in the root directory of the project:

```
OPENAI_SECRET=<YOUR_OPENAI_SECRET_HERE>
```

3. make sure you have node and npm installed
4. install yarn with `npm i -g yarn`
5. install dependencies with `yarn`
6. run project with `yarn start`

## Scripts

```bash
yarn       # install dependencies
yarn dev   # run project in development mode (hot reloading)
yarn start # run project
yarn test  # run tests
```

🚨 **NOTE**: before running tests make sure that server is running!

## Definitions

Throughout this readme we will use these terms:

- **Evaluator** - a human that guesses whether they talk to a machine or a human player.
- **Human player** - a human that might be chosen to answer evaluator's questions.
- **Machine** - A computer that answers evaluator's questions. In our case: OpenAI's GPT-3.

## API

Client and server send all messages in the following form:

```json
{
    "message": <MESSAGE_NAME>,
    "payload": <some_object>
}

```

### Client messages

#### INIT

- withHuman: maybe boolean.

This message inits a turing test.
If withHuman flag is present then server will deterministically connect evaluator with human player (eg for testing purposes).

#### JOIN

- code: string

This message informs the server that the human player is ready to start.
Message's payload has to have a 'code' field with a code previously sent by a server.

#### MESSAGE

- code: string
- text: string
- fromEvaluator: boolean

Sent when either evaluator or human player send message.

#### RECONNECT

- code: string
- isEvaluator: boolean

Sent by Client every time they have to create a new connection, for example because they
reloaded the website.

### Server messages

#### NEW_GAME

- code: string

A respond to a new connection. Payload contains a code that is used to invite a human player.

#### GAME_START

- withMachine: maybe boolean

Sent after human player joins. Payload withMachine is sent only to human player.

#### NEW_MESSAGE

- text: string

Sent from human player or machine (depending on who was randomly chosen) to evaluator
or from evaluator to human player.

#### GAME_END

- wasMachine: boolean

Sent when a game finishes, the flag in payload informs whether the evaluator was talking to a machine or a human player.

#### MESSAGE_HISTORY

- messages: [{ text: string; fromEvaluator: boolean; }]

Sent to Client after 'RECONNECT' message, so that they don't lose messages.
