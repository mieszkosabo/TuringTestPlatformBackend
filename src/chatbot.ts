import axios from "axios";
import {
  AI_PREFIX,
  HUMAN_PREFIX,
  OPEN_AI_PARAMS_CONFIG,
  OPEN_AI_SECRET,
  OPEN_AI_URL,
  PROMPT_BEGINNING,
} from "./const";
import { GameMessage } from "./types";

export const messagesToPrompt = (messages: GameMessage[]): string =>
  PROMPT_BEGINNING +
  messages
    .map((msg) =>
      msg.fromEvaluator
        ? `${HUMAN_PREFIX} ${msg.text}\n`
        : `${AI_PREFIX} ${msg.text}\n`
    )
    .join("") +
  AI_PREFIX;

// This is the function responsible for getting machine's responses.
// If you would like to use TuringFest with a different bot, then
// change its implementation.
export const getAnswerFromBot = (
  messages: GameMessage[]
): Promise<GameMessage> =>
  axios({
    method: "post",
    url: OPEN_AI_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPEN_AI_SECRET}`,
    },
    data: {
      prompt: messagesToPrompt(messages),
      ...OPEN_AI_PARAMS_CONFIG,
    },
  }).then((response) => {
    console.log(response.data);

    return response.status === 200
      ? {
          text: response.data.choices[0]?.text?.trim(),
          fromEvaluator: false,
        }
      : { text: "error", fromEvaluator: false };
  });
