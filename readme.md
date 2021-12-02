## Scripts

```bash
yarn       # install dependencies
yarn dev   # run project in development mode (hot reloading)
yarn start # run project
yarn test  # run tests
```

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

##### MESSAGE
- code: string
- text: string
- fromEvalutor: boolean

Sent when either evaluator or human player send message.

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
- was_machine: boolean

Sent when a game finishes, the flag in payload informs whether the evaluator was talking to a machine or a human player.